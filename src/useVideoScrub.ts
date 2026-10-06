import { useEffect, useRef, useState, type RefObject } from 'react';
import MP4Box, { type ISOFile, type MP4ArrayBuffer, type MP4Sample, type MP4TrackInfo } from 'mp4box';

export const LERP_TAU = 8;
export const SNAP = 0.002;
export const LRU_MAX = 24;
export const LEAD = 24;
export const WATCHDOG = 60_000;

export type ScrubStatus = 'idle' | 'loading' | 'building' | 'ready' | 'fallback' | 'missing' | 'error';

interface UseVideoScrubOptions {
  source: string;
  progress: number;
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

interface FrameBlob {
  index: number;
  timestamp: number;
  blob: Blob;
}

interface EncodedSample {
  decodeIndex: number;
  frameIndex: number;
  timestamp: number;
  timestampUs: number;
  durationUs: number;
  key: boolean;
  data: Uint8Array;
}

interface ParsedVideo {
  duration: number;
  codec: string;
  width: number;
  height: number;
  description?: ArrayBuffer;
  decodeOrder: EncodedSample[];
  presentationOrder: EncodedSample[];
}

interface ScrubResult {
  status: ScrubStatus;
  duration: number;
  ready: boolean;
  painted: boolean;
  building: boolean;
}

const parsedVideoCache = new Map<string, ParsedVideo>();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function canvasCover(context: CanvasRenderingContext2D, bitmap: ImageBitmap, targetWidth: number, targetHeight: number) {
  const scale = Math.max(targetWidth / bitmap.width, targetHeight / bitmap.height);
  const sourceWidth = targetWidth / scale;
  const sourceHeight = targetHeight / scale;
  const sourceX = (bitmap.width - sourceWidth) / 2;
  const sourceY = (bitmap.height - sourceHeight) / 2;
  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
}

async function toWebP(frame: VideoFrame): Promise<Blob | null> {
  const width = frame.displayWidth || frame.codedWidth;
  const height = frame.displayHeight || frame.codedHeight;
  if (typeof OffscreenCanvas !== 'undefined') {
    const offscreen = new OffscreenCanvas(width, height);
    const context = offscreen.getContext('2d', { alpha: false });
    if (!context) return null;
    context.drawImage(frame, 0, 0, width, height);
    return offscreen.convertToBlob({ type: 'image/webp', quality: 0.88 });
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return null;
  context.drawImage(frame, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.88));
}

function serializeCodecDescription(file: ISOFile, track: MP4TrackInfo): ArrayBuffer | undefined {
  try {
    const entry = file.getTrackById(track.id).mdia?.minf?.stbl?.stsd?.entries?.[0];
    const codecBox = entry?.avcC ?? entry?.hvcC ?? entry?.av1C ?? entry?.vpcC;
    if (!codecBox) return undefined;
    const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN);
    codecBox.write(stream);
    const written = new Uint8Array(stream.buffer, 0, stream.position);
    // VideoDecoderConfig.description expects the codec box payload, not its 8-byte MP4 header.
    return written.slice(8).buffer;
  } catch {
    return undefined;
  }
}

function parseMp4(buffer: ArrayBuffer, signal: AbortSignal): Promise<ParsedVideo> {
  return new Promise((resolve, reject) => {
    const file = MP4Box.createFile();
    const extractedSamples: MP4Sample[] = [];
    let readyStarted = false;
    let settled = false;

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    };

    file.onError = (message) => fail(message || 'MP4 parsing failed.');
    file.onReady = (info) => {
      if (readyStarted || signal.aborted) return;
      readyStarted = true;
      const track = info.tracks.find((candidate) => Boolean(candidate.video));
      if (!track?.video) {
        fail('No video track was found in the supplied MP4.');
        return;
      }

      file.onSamples = (_trackId, _user, samples) => extractedSamples.push(...samples);
      file.setExtractionOptions(track.id, null, { nbSamples: Math.max(1, track.nb_samples), rapAlignement: false });
      file.start();
      file.flush();

      const timescale = track.timescale || info.timescale || 1;
      const decodeOrder = extractedSamples.map((sample, decodeIndex): EncodedSample => {
        const presentationTime = Number.isFinite(sample.cts) ? sample.cts : sample.dts;
        const sampleTimescale = sample.timescale || timescale;
        const bytes = sample.data instanceof Uint8Array
          ? sample.data.slice()
          : new Uint8Array(sample.data).slice();
        return {
          decodeIndex,
          frameIndex: -1,
          timestamp: presentationTime / sampleTimescale,
          timestampUs: Math.round((presentationTime / sampleTimescale) * 1_000_000),
          durationUs: Math.round((sample.duration / sampleTimescale) * 1_000_000),
          key: Boolean(sample.is_sync ?? sample.is_rap),
          data: bytes,
        };
      });

      if (decodeOrder.length === 0) {
        fail('The MP4 video track contained no extractable frames.');
        return;
      }

      const presentationOrder = [...decodeOrder].sort((left, right) => left.timestamp - right.timestamp);
      presentationOrder.forEach((sample, frameIndex) => { sample.frameIndex = frameIndex; });
      settled = true;
      resolve({
        duration: track.duration / timescale || info.duration / (info.timescale || 1),
        codec: track.codec,
        width: track.video.width,
        height: track.video.height,
        description: serializeCodecDescription(file, track),
        decodeOrder,
        presentationOrder,
      });
    };

    signal.addEventListener('abort', () => fail('MP4 parsing was aborted.'), { once: true });
    try {
      const input = buffer as MP4ArrayBuffer;
      input.fileStart = 0;
      file.appendBuffer(input);
      // A complete ArrayBuffer normally includes the movie metadata; flush if it is at the tail.
      if (!readyStarted && !signal.aborted) file.flush();
    } catch (error) {
      fail(error instanceof Error ? error.message : 'MP4 parsing failed.');
    }
  });
}

function getNearestIndex(samples: EncodedSample[], timestamp: number): number {
  let low = 0;
  let high = samples.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (samples[middle].timestamp < timestamp) low = middle + 1;
    else high = middle;
  }
  if (low > 0 && Math.abs(samples[low - 1].timestamp - timestamp) < Math.abs(samples[low].timestamp - timestamp)) {
    return low - 1;
  }
  return low;
}

export function useVideoScrub({ source, progress, enabled, videoRef, canvasRef }: UseVideoScrubOptions): ScrubResult {
  const progressRef = useRef(progress);
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const parsedVideoRef = useRef<ParsedVideo | null>(null);
  const durationRef = useRef(0);
  const bankRef = useRef(new Map<number, FrameBlob>());
  const lruRef = useRef<number[]>([]);
  const readyRef = useRef(false);
  const paintedRef = useRef(false);
  const buildingRef = useRef(false);
  const [status, setStatus] = useState<ScrubStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [painted, setPainted] = useState(false);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    progressRef.current = clamp(progress, 0, 1);
  }, [progress]);

  useEffect(() => {
    if (!enabled) return undefined;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return undefined;

    let disposed = false;
    let phase: 'loading' | 'bank' | 'fallback' | 'missing' | 'error' = 'loading';
    let rafId = 0;
    let watchdogId = 0;
    let lastFrameAt = performance.now();
    let lastFallbackSeekAt = 0;
    let lastPaintedIndex = -1;
    let paintingIndex = -1;
    let paintRequest = 0;
    let activeDecode = false;
    let requestedIndex = -1;
    let decoderError: Error | null = null;
    const controller = new AbortController();
    const context = canvas.getContext('2d', { alpha: false });
    const cached = parsedVideoCache.get(source) ?? null;

    canvas.width = 1920;
    canvas.height = 1080;
    canvas.style.opacity = '0';
    paintedRef.current = false;
    setPainted(false);
    if (context) context.imageSmoothingQuality = 'high';

    if (cached) {
      parsedVideoRef.current = cached;
      durationRef.current = cached.duration;
      setDuration(cached.duration);
      readyRef.current = true;
      setReady(true);
    } else if (parsedVideoRef.current && parsedVideoRef.current !== cached) {
      parsedVideoRef.current = null;
      durationRef.current = 0;
      readyRef.current = false;
      setReady(false);
      paintedRef.current = false;
      setPainted(false);
      bankRef.current.clear();
      lruRef.current = [];
    }

    const resetCanvas = () => {
      paintRequest += 1;
      paintingIndex = -1;
      lastPaintedIndex = -1;
      canvas.style.opacity = '0';
      paintedRef.current = false;
      setPainted(false);
    };

    const setFallback = (nextStatus: 'fallback' | 'missing' | 'error') => {
      if (disposed) return;
      phase = nextStatus;
      buildingRef.current = false;
      setBuilding(false);
      resetCanvas();
      setStatus(nextStatus);
      if (nextStatus !== 'fallback') {
        readyRef.current = false;
        setReady(false);
      }
      if (watchdogId) window.clearTimeout(watchdogId);
      controller.abort();
    };

    const startBankWatchdog = () => {
      if (paintedRef.current) return;
      if (watchdogId) window.clearTimeout(watchdogId);
      watchdogId = window.setTimeout(() => {
        if (!disposed && phase === 'bank' && !paintedRef.current) setFallback('fallback');
      }, WATCHDOG);
    };

    const touchFrame = (index: number): FrameBlob | undefined => {
      const frame = bankRef.current.get(index);
      if (!frame) return undefined;
      lruRef.current = lruRef.current.filter((item) => item !== index);
      lruRef.current.push(index);
      return frame;
    };

    const rememberFrame = (index: number, timestamp: number, blob: Blob) => {
      if (disposed) return;
      bankRef.current.set(index, { index, timestamp, blob });
      lruRef.current = lruRef.current.filter((item) => item !== index);
      lruRef.current.push(index);
      while (lruRef.current.length > LRU_MAX) {
        const oldest = lruRef.current.shift();
        if (oldest !== undefined) bankRef.current.delete(oldest);
      }
    };

    const drawFrame = async (entry: FrameBlob) => {
      if (entry.index === lastPaintedIndex || entry.index === paintingIndex) return;
      paintingIndex = entry.index;
      const requestId = ++paintRequest;
      try {
        const bitmap = await createImageBitmap(entry.blob);
        if (disposed || requestId !== paintRequest || !context) {
          bitmap.close();
          return;
        }
        canvasCover(context, bitmap, canvas.width, canvas.height);
        bitmap.close();
        lastPaintedIndex = entry.index;
        if (!paintedRef.current) {
          paintedRef.current = true;
          setPainted(true);
          canvas.style.opacity = '1';
          if (watchdogId) window.clearTimeout(watchdogId);
          watchdogId = 0;
        }
      } catch {
        // The underlying HTML video remains visible until a canvas frame paints successfully.
      } finally {
        if (paintingIndex === entry.index) paintingIndex = -1;
      }
    };

    const decodeWindow = async (targetIndex: number, preferSoftware: boolean) => {
      const parsed = parsedVideoRef.current;
      if (!parsed || typeof VideoDecoder === 'undefined' || typeof EncodedVideoChunk === 'undefined') {
        throw new Error('WebCodecs is not available.');
      }
      const frames = parsed.presentationOrder;
      const targetFrame = frames[targetIndex];
      if (!targetFrame) throw new Error('The requested frame is unavailable.');

      let keyDecodeIndex = targetFrame.decodeIndex;
      while (keyDecodeIndex > 0 && !parsed.decodeOrder[keyDecodeIndex].key) keyDecodeIndex -= 1;
      const endDecodeIndex = Math.min(parsed.decodeOrder.length - 1, targetFrame.decodeIndex + LEAD);
      const warmStart = Math.max(0, targetIndex - 1);
      const warmEnd = Math.min(frames.length - 1, targetIndex + 2);
      const outputTasks: Promise<void>[] = [];
      decoderError = null;

      const config: VideoDecoderConfig = {
        codec: parsed.codec,
        codedWidth: parsed.width,
        codedHeight: parsed.height,
        ...(parsed.description ? { description: parsed.description } : {}),
        ...(preferSoftware ? { hardwareAcceleration: 'prefer-software' } : {}),
      };
      const support = await VideoDecoder.isConfigSupported(config);
      if (!support.supported) throw new Error(`Unsupported video codec: ${parsed.codec}`);

      const decoder = new VideoDecoder({
        output: (frame) => {
          const index = getNearestIndex(frames, frame.timestamp / 1_000_000);
          if (index < warmStart || index > warmEnd) {
            frame.close();
            return;
          }
          const convert = async () => {
            try {
              const blob = await toWebP(frame);
              if (blob && !disposed) {
                rememberFrame(index, frames[index].timestamp, blob);
              }
            } finally {
              frame.close();
            }
          };
          outputTasks.push(convert());
        },
        error: (error) => { decoderError = error; },
      });

      try {
        decoder.configure(config);
        for (let index = keyDecodeIndex; index <= endDecodeIndex; index += 1) {
          if (disposed || phase !== 'bank') break;
          const sample = parsed.decodeOrder[index];
          decoder.decode(new EncodedVideoChunk({
            type: sample.key ? 'key' : 'delta',
            timestamp: sample.timestampUs,
            duration: sample.durationUs || undefined,
            data: sample.data,
          }));
        }
        await decoder.flush();
        if (decoderError) throw decoderError;
        await Promise.all(outputTasks);
      } finally {
        if (decoder.state !== 'closed') decoder.close();
      }
    };

    const requestDecode = async (index: number) => {
      if (activeDecode || phase !== 'bank' || bankRef.current.has(index)) return;
      activeDecode = true;
      requestedIndex = index;
      try {
        await decodeWindow(index, false);
      } catch {
        if (disposed || phase !== 'bank') return;
        try {
          bankRef.current.clear();
          lruRef.current = [];
          await decodeWindow(index, true);
        } catch {
          if (!disposed && phase === 'bank') {
            setFallback('fallback');
          }
        }
      } finally {
        activeDecode = false;
        requestedIndex = -1;
      }
    };

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.1, Math.max(0, (now - lastFrameAt) / 1000));
      lastFrameAt = now;
      const mediaDuration = Number.isFinite(video.duration) ? video.duration : 0;
      const resolvedDuration = durationRef.current || mediaDuration || 0;
      if (resolvedDuration > 0) {
        targetTimeRef.current = clamp(progressRef.current, 0, 1) * resolvedDuration;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          currentTimeRef.current = targetTimeRef.current;
        } else {
          currentTimeRef.current += (targetTimeRef.current - currentTimeRef.current) * (1 - Math.exp(-dt * LERP_TAU));
        }
        if (Math.abs(targetTimeRef.current - currentTimeRef.current) < SNAP) currentTimeRef.current = targetTimeRef.current;
      }

      const parsed = parsedVideoRef.current;
      if (phase === 'bank' && parsed && resolvedDuration > 0) {
        const targetIndex = getNearestIndex(parsed.presentationOrder, currentTimeRef.current);
        const cachedFrame = touchFrame(targetIndex);
        if (cachedFrame && cachedFrame.index !== lastPaintedIndex) void drawFrame(cachedFrame);
        else if (!cachedFrame && (!activeDecode || Math.abs(targetIndex - requestedIndex) > 2)) void requestDecode(targetIndex);
      }

      const canSeek = phase === 'fallback' || phase === 'loading' || phase === 'bank';
      if (canSeek && video.readyState >= HTMLMediaElement.HAVE_METADATA && resolvedDuration > 0 && now - lastFallbackSeekAt > 32) {
        const nextTime = clamp(currentTimeRef.current, 0, Math.max(0, resolvedDuration - 0.02));
        if (!video.seeking && Math.abs(video.currentTime - nextTime) > 0.035) {
          try {
            video.currentTime = nextTime;
            lastFallbackSeekAt = now;
          } catch {
            // Browsers can briefly reject seeking while metadata or the media resource changes.
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const onLoadedMetadata = () => {
      if (disposed) return;
      const mediaDuration = Number.isFinite(video.duration) ? video.duration : 0;
      if (mediaDuration > 0 && durationRef.current === 0) {
        durationRef.current = mediaDuration;
        setDuration(mediaDuration);
      }
      if (phase === 'loading') setStatus('building');
      if (typeof VideoDecoder === 'undefined' || typeof EncodedVideoChunk === 'undefined') setFallback('fallback');
    };

    const onVideoError = () => {
      if (disposed || phase === 'bank') return;
      // MP4 may still be valid for WebCodecs even when the native video element cannot decode it.
      if (video.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) return;
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onVideoError);
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    if (!video.src || !video.src.endsWith(source)) {
      video.src = source;
      video.load();
    } else if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      onLoadedMetadata();
    }

    if (cached) {
      parsedVideoRef.current = cached;
      durationRef.current = cached.duration;
      setDuration(cached.duration);
      readyRef.current = true;
      setReady(true);
      phase = 'bank';
      setStatus('ready');
      startBankWatchdog();
    } else {
      parsedVideoRef.current = null;
      readyRef.current = false;
      setReady(false);
      buildingRef.current = true;
      setBuilding(true);
      setStatus('loading');

      const canUseWebCodecs = typeof VideoDecoder !== 'undefined' && typeof EncodedVideoChunk !== 'undefined';
      if (!canUseWebCodecs) {
        void fetch(source, { method: 'HEAD', signal: controller.signal })
          .then((response) => {
            const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
            if (!response.ok && response.status !== 405) setFallback(response.status === 404 ? 'missing' : 'error');
            else if (contentType.includes('text/html')) setFallback('missing');
            else setFallback('fallback');
          })
          .catch(() => { if (!disposed) setFallback('fallback'); });
      } else {
        watchdogId = window.setTimeout(() => {
          if (!disposed && phase === 'loading') setFallback('fallback');
        }, WATCHDOG);

        void (async () => {
          try {
            const response = await fetch(source, { signal: controller.signal });
            const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
            if (!response.ok || contentType.includes('text/html')) {
              setFallback(response.status === 404 || contentType.includes('text/html') ? 'missing' : 'error');
              return;
            }
            const data = await response.arrayBuffer();
            if (disposed || phase !== 'loading') return;
            const parsed = await parseMp4(data, controller.signal);
            if (disposed || phase !== 'loading') return;
            parsedVideoRef.current = parsed;
            parsedVideoCache.clear();
            parsedVideoCache.set(source, parsed);
            durationRef.current = parsed.duration || durationRef.current;
            setDuration(durationRef.current);
            phase = 'bank';
            buildingRef.current = false;
            setBuilding(false);
            readyRef.current = true;
            setReady(true);
            setStatus('ready');
            startBankWatchdog();
          } catch (error) {
            if (disposed || controller.signal.aborted) return;
            const message = error instanceof Error ? error.message.toLowerCase() : '';
            const nextStatus = message.includes('404') || message.includes('not found') ? 'missing' : 'fallback';
            setFallback(nextStatus);
          }
        })();
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (watchdogId) window.clearTimeout(watchdogId);
      controller.abort();
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onVideoError);
      video.pause();
      parsedVideoRef.current = null;
      durationRef.current = 0;
    };
  }, [enabled, source, videoRef, canvasRef]);

  return { status, duration, ready, painted, building };
}
