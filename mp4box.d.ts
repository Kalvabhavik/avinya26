declare module 'mp4box' {
  export interface MP4TrackInfo {
    id: number;
    codec: string;
    timescale: number;
    duration: number;
    nb_samples: number;
    video?: { width: number; height: number };
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    tracks: MP4TrackInfo[];
  }

  export interface MP4Sample {
    track_id: number;
    is_sync: boolean;
    is_rap?: boolean;
    timescale: number;
    dts: number;
    cts: number;
    duration: number;
    size: number;
    data: Uint8Array | ArrayBuffer;
  }

  export interface MP4CodecBox {
    write(stream: DataStream): void;
  }

  export interface MP4SampleEntry {
    avcC?: MP4CodecBox;
    hvcC?: MP4CodecBox;
    av1C?: MP4CodecBox;
    vpcC?: MP4CodecBox;
  }

  export interface MP4TrackBox {
    mdia?: {
      minf?: {
        stbl?: {
          stsd?: { entries?: MP4SampleEntry[] };
        };
      };
    };
  }

  export class DataStream {
    static readonly BIG_ENDIAN: number;
    constructor(buffer?: ArrayBuffer | null, byteOffset?: number, endianness?: number);
    buffer: ArrayBuffer;
    position: number;
  }

  export interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number;
  }

  export interface ISOFile {
    onError?: (message: string) => void;
    onReady?: (info: MP4Info) => void;
    onSamples?: (trackId: number, user: unknown, samples: MP4Sample[]) => void;
    appendBuffer(buffer: MP4ArrayBuffer): number;
    setExtractionOptions(trackId: number, user?: unknown, options?: { nbSamples?: number; rapAlignement?: boolean }): void;
    start(): void;
    flush(): void;
    getTrackById(trackId: number): MP4TrackBox;
  }

  export function createFile(): ISOFile;

  const MP4Box: {
    createFile: typeof createFile;
    DataStream: typeof DataStream;
  };
  export default MP4Box;
}
