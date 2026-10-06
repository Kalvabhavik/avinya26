import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Compass, Eye, Play, Pause, ChevronLeft, ChevronRight, Anchor, Sparkles } from 'lucide-react';
import type { IslandEvent } from '../types';

interface Realistic3DShipProps {
  progress: number;
  onProgressChange: (newProgress: number) => void;
  islands: IslandEvent[];
  activeIslandIndex: number;
  onSelectIsland: (index: number) => void;
  isAutoCruising: boolean;
  onToggleAutoCruise: () => void;
  dayColor?: string;
  className?: string;
}

export type CameraViewMode = 'chase' | 'helm' | 'overhead';

export default function Realistic3DShip({
  progress,
  onProgressChange,
  islands,
  activeIslandIndex,
  onSelectIsland,
  isAutoCruising,
  onToggleAutoCruise,
  dayColor = '#c5a059',
  className = '',
}: Realistic3DShipProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [shipSpeedKnots, setShipSpeedKnots] = useState(12.5);
  const [headingDegrees, setHeadingDegrees] = useState(45);

  // References for Three.js animation loop
  const currentProgressRef = useRef(progress);
  const targetProgressRef = useRef(progress);
  const cameraModeRef = useRef(cameraMode);
  const isAutoCruisingRef = useRef(isAutoCruising);

  useEffect(() => {
    targetProgressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    isAutoCruisingRef.current = isAutoCruising;
  }, [isAutoCruising]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e18);
    scene.fog = new THREE.FogExp2(0x0a1928, 0.0016);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.5, 3000);
    camera.position.set(0, 35, 75);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x456285, 0.9);
    scene.add(ambientLight);

    // Warm Sun/Moon directional light
    const dirLight = new THREE.DirectionalLight(0xffecd0, 2.2);
    dirLight.position.set(120, 150, 90);
    scene.add(dirLight);

    // Hemisphere light for sea reflection ambiance
    const hemiLight = new THREE.HemisphereLight(0x90b4d4, 0x0f2b3e, 0.7);
    scene.add(hemiLight);

    // 4. Curved Archipelago Voyage Spline
    // Scaled coordinates representing the 5 island waypoints
    const waypointPositions = [
      new THREE.Vector3(-240, 0, 160),  // Island 1
      new THREE.Vector3(-110, 0, -80),  // Island 2
      new THREE.Vector3(30, 0, 140),    // Island 3
      new THREE.Vector3(160, 0, -60),   // Island 4
      new THREE.Vector3(260, 0, 100),   // Island 5
    ];

    const voyageCurve = new THREE.CatmullRomCurve3(waypointPositions, false, 'centripetal', 0.5);

    // 5. Build Voyage Route Ribbon / Line
    const pathPoints = voyageCurve.getPoints(160);
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineDashedMaterial({
      color: 0xc5a059,
      linewidth: 2,
      dashSize: 5,
      gapSize: 3,
      transparent: true,
      opacity: 0.65,
    });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    pathLine.computeLineDistances();
    pathLine.position.y = 0.4;
    scene.add(pathLine);

    // 6. Build the 3D Ocean Surface with Dynamic Waves
    const oceanGeo = new THREE.PlaneGeometry(1600, 1600, 80, 80);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x092138,
      roughness: 0.25,
      metalness: 0.45,
      flatShading: true,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    scene.add(oceanMesh);

    const oceanPosAttr = oceanGeo.attributes.position;
    const baseOceanY = new Float32Array(oceanPosAttr.count);
    for (let i = 0; i < oceanPosAttr.count; i++) {
      baseOceanY[i] = oceanPosAttr.getY(i);
    }

    // Function to calculate wave height at any (x, z) coordinate
    const getWaveHeightAt = (x: number, z: number, time: number): number => {
      const w1 = Math.sin(x * 0.035 + time * 1.6) * 1.5;
      const w2 = Math.cos(z * 0.045 + time * 1.3) * 1.3;
      const w3 = Math.sin((x + z) * 0.06 + time * 2.1) * 0.8;
      const w4 = Math.cos((x - z) * 0.02 + time * 0.8) * 0.9;
      return w1 + w2 + w3 + w4;
    };

    // 7. BUILD THE DETAILED 3D REALISTIC BOAT / SHIP
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // --- Hull (Wooden planked galleon body) ---
    const hullGroup = new THREE.Group();
    shipGroup.add(hullGroup);

    // Dark oak / mahogany wood material
    const woodHullMat = new THREE.MeshStandardMaterial({
      color: 0x2b180d,
      roughness: 0.65,
      metalness: 0.1,
    });
    const woodDeckMat = new THREE.MeshStandardMaterial({
      color: 0x4a2f1b,
      roughness: 0.55,
      metalness: 0.05,
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.85,
    });
    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xf5ebd7,
      roughness: 0.8,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1a0f08,
      roughness: 0.7,
    });

    // Main hull geometry
    const hullGeometry = new THREE.CylinderGeometry(4.2, 2.6, 26, 12, 4);
    hullGeometry.rotateZ(Math.PI / 2);
    hullGeometry.scale(1, 0.45, 0.55); // Flatten and shape like ship hull
    const mainHullMesh = new THREE.Mesh(hullGeometry, woodHullMat);
    mainHullMesh.position.y = 1.8;
    hullGroup.add(mainHullMesh);

    // Sharpened Bow Cutwater (slices water)
    const bowConeGeo = new THREE.ConeGeometry(2.8, 8, 8);
    bowConeGeo.rotateZ(-Math.PI / 2);
    bowConeGeo.scale(0.8, 1.2, 0.45);
    const bowMesh = new THREE.Mesh(bowConeGeo, woodHullMat);
    bowMesh.position.set(15, 2.2, 0);
    hullGroup.add(bowMesh);

    // Decorative Bowsprit Spar
    const bowspritGeo = new THREE.CylinderGeometry(0.2, 0.4, 12, 8);
    bowspritGeo.rotateZ(-Math.PI / 3);
    const bowspritMesh = new THREE.Mesh(bowspritGeo, darkWoodMat);
    bowspritMesh.position.set(20, 5.5, 0);
    hullGroup.add(bowspritMesh);

    // Stern Transom & Quarterdeck (raised cabin)
    const cabinGeo = new THREE.BoxGeometry(7, 3.5, 4.4);
    const cabinMesh = new THREE.Mesh(cabinGeo, woodDeckMat);
    cabinMesh.position.set(-8.5, 3.8, 0);
    hullGroup.add(cabinMesh);

    // Golden Stern Trim & Galleries
    const sternTrimGeo = new THREE.BoxGeometry(0.8, 4.2, 5.2);
    const sternTrimMesh = new THREE.Mesh(sternTrimGeo, goldTrimMat);
    sternTrimMesh.position.set(-12.2, 3.8, 0);
    hullGroup.add(sternTrimMesh);

    // Deck Surface Planks
    const deckGeo = new THREE.BoxGeometry(22, 0.6, 5.0);
    const deckMesh = new THREE.Mesh(deckGeo, woodDeckMat);
    deckMesh.position.set(0.5, 3.2, 0);
    hullGroup.add(deckMesh);

    // Ship's Helm Wheel on Quarterdeck
    const wheelStandGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.2, 8);
    const wheelStand = new THREE.Mesh(wheelStandGeo, darkWoodMat);
    wheelStand.position.set(-5.5, 5.5, 0);
    hullGroup.add(wheelStand);

    const wheelRimGeo = new THREE.TorusGeometry(0.9, 0.08, 8, 16);
    wheelRimGeo.rotateY(Math.PI / 2);
    const wheelRim = new THREE.Mesh(wheelRimGeo, goldTrimMat);
    wheelRim.position.set(-5.5, 6.4, 0);
    hullGroup.add(wheelRim);

    // --- Masts and Billowing Sails ---
    // 1. Mainmast (Center tall mast)
    const mainMastGeo = new THREE.CylinderGeometry(0.35, 0.5, 22, 10);
    const mainMast = new THREE.Mesh(mainMastGeo, darkWoodMat);
    mainMast.position.set(-0.5, 13.5, 0);
    hullGroup.add(mainMast);

    // Mainmast Yard Arms (horizontal spars)
    const mainYardLowGeo = new THREE.CylinderGeometry(0.18, 0.22, 11, 8);
    mainYardLowGeo.rotateX(Math.PI / 2);
    const mainYardLow = new THREE.Mesh(mainYardLowGeo, darkWoodMat);
    mainYardLow.position.set(-0.5, 11, 0);
    hullGroup.add(mainYardLow);

    const mainYardHighGeo = new THREE.CylinderGeometry(0.15, 0.18, 8.5, 8);
    mainYardHighGeo.rotateX(Math.PI / 2);
    const mainYardHigh = new THREE.Mesh(mainYardHighGeo, darkWoodMat);
    mainYardHigh.position.set(-0.5, 18, 0);
    hullGroup.add(mainYardHigh);

    // Realistic Billowing Mainsail (Curved lofted geometry)
    const createCurvedSail = (width: number, height: number, curvature = 1.4) => {
      const sailGeometry = new THREE.PlaneGeometry(width, height, 16, 12);
      sailGeometry.rotateY(Math.PI / 2);
      const pos = sailGeometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const zVal = pos.getZ(i);
        const yVal = pos.getY(i);
        // Billow forward (in X) based on distance from center edges
        const factorZ = 1 - Math.pow(zVal / (width / 2), 2);
        const factorY = 1 - Math.pow(yVal / (height / 2), 2);
        pos.setX(i, factorZ * factorY * curvature);
      }
      sailGeometry.computeVertexNormals();
      return new THREE.Mesh(sailGeometry, sailMat);
    };

    const mainSailLow = createCurvedSail(9.8, 6.2, 1.8);
    mainSailLow.position.set(0.6, 10.5, 0);
    hullGroup.add(mainSailLow);

    const mainSailHigh = createCurvedSail(7.6, 5.0, 1.4);
    mainSailHigh.position.set(0.5, 17.5, 0);
    hullGroup.add(mainSailHigh);

    // 2. Foremast (Front mast)
    const foreMastGeo = new THREE.CylinderGeometry(0.3, 0.42, 17, 10);
    const foreMast = new THREE.Mesh(foreMastGeo, darkWoodMat);
    foreMast.position.set(7.5, 11, 0);
    hullGroup.add(foreMast);

    const foreYardGeo = new THREE.CylinderGeometry(0.16, 0.2, 8.5, 8);
    foreYardGeo.rotateX(Math.PI / 2);
    const foreYard = new THREE.Mesh(foreYardGeo, darkWoodMat);
    foreYard.position.set(7.5, 12, 0);
    hullGroup.add(foreYard);

    const foreSail = createCurvedSail(7.8, 5.5, 1.5);
    foreSail.position.set(8.3, 11.5, 0);
    hullGroup.add(foreSail);

    // Jib Sail (triangular sail running from bowsprit to foremast)
    const jibShape = new THREE.Shape();
    jibShape.moveTo(0, 0);
    jibShape.lineTo(10, 0);
    jibShape.lineTo(0, 8);
    jibShape.closePath();
    const jibGeo = new THREE.ShapeGeometry(jibShape);
    jibGeo.rotateY(Math.PI / 2);
    const jibMesh = new THREE.Mesh(jibGeo, sailMat);
    jibMesh.position.set(10.5, 5.2, 0);
    hullGroup.add(jibMesh);

    // Waving Masthead Pennant Flag
    const flagGeo = new THREE.PlaneGeometry(3.6, 1.2, 8, 2);
    flagGeo.rotateY(Math.PI / 2);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      side: THREE.DoubleSide,
    });
    const pennantMesh = new THREE.Mesh(flagGeo, flagMat);
    pennantMesh.position.set(-1.8, 24.2, 0);
    hullGroup.add(pennantMesh);

    // Warm Brass Stern Lantern with PointLight
    const lanternGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.9, 6);
    const lanternMesh = new THREE.Mesh(lanternGeo, goldTrimMat);
    lanternMesh.position.set(-12.8, 6.2, 0);
    hullGroup.add(lanternMesh);

    const lanternLight = new THREE.PointLight(0xffa540, 2.5, 25);
    lanternLight.position.set(-12.8, 6.2, 0);
    hullGroup.add(lanternLight);

    // Bowsprit Navigation Lantern
    const bowLantern = new THREE.PointLight(0x70d8ff, 1.5, 20);
    bowLantern.position.set(22, 6.5, 0);
    hullGroup.add(bowLantern);

    // --- Realistic Ship Wake Foam (Stern Trail) ---
    const wakeGeo = new THREE.PlaneGeometry(36, 12, 16, 6);
    wakeGeo.rotateX(-Math.PI / 2);
    const wakeMat = new THREE.MeshBasicMaterial({
      color: 0xd6f1ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const wakeMesh = new THREE.Mesh(wakeGeo, wakeMat);
    wakeMesh.position.set(-24, 0.15, 0);
    shipGroup.add(wakeMesh);

    // 8. BUILD 3D ARCHIPELAGO ISLANDS ALONG THE ROUTE
    const islandsGroup = new THREE.Group();
    scene.add(islandsGroup);

    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x1d362a, // Lush coastal vegetation
      roughness: 0.85,
      flatShading: true,
    });
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x2e353b, // Dark sea cliff rocks
      roughness: 0.9,
      flatShading: true,
    });

    waypointPositions.forEach((pos, idx) => {
      const isld = new THREE.Group();
      isld.position.copy(pos);

      // Base island rocky terrain
      const radius = 28 + (idx % 3) * 6;
      const islandGeo = new THREE.ConeGeometry(radius, 14, 10);
      const isldBase = new THREE.Mesh(islandGeo, islandMat);
      isldBase.position.y = 4;
      isld.add(isldBase);

      // Surrounding rocky outcrops
      for (let r = 0; r < 4; r++) {
        const rockGeo = new THREE.DodecahedronGeometry(5 + r * 1.5);
        const rockMesh = new THREE.Mesh(rockGeo, rockMat);
        const ang = (r * Math.PI) / 2 + 0.3;
        rockMesh.position.set(Math.cos(ang) * (radius * 0.75), 2, Math.sin(ang) * (radius * 0.75));
        isld.add(rockMesh);
      }

      // Unique Feature for each Island
      if (idx === 0) {
        // Island 1: Stone Lighthouse with rotating light beam
        const lhTowerGeo = new THREE.CylinderGeometry(2, 3.2, 22, 8);
        const lhTower = new THREE.Mesh(lhTowerGeo, new THREE.MeshStandardMaterial({ color: 0xe8e2ce }));
        lhTower.position.y = 15;
        isld.add(lhTower);

        const lhTopGeo = new THREE.CylinderGeometry(2.3, 2.3, 3, 8);
        const lhTop = new THREE.Mesh(lhTopGeo, darkWoodMat);
        lhTop.position.y = 26;
        isld.add(lhTop);

        const lhLight = new THREE.PointLight(0xffea88, 3.5, 90);
        lhLight.position.y = 26;
        isld.add(lhLight);
      } else if (idx === 4) {
        // Island 5: Carnival Ferris Wheel
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(0, 16, 0);

        const fwRimGeo = new THREE.TorusGeometry(12, 0.5, 8, 24);
        const fwRim = new THREE.Mesh(fwRimGeo, goldTrimMat);
        wheelGroup.add(fwRim);

        // Spokes
        for (let s = 0; s < 8; s++) {
          const spokeGeo = new THREE.CylinderGeometry(0.15, 0.15, 24, 6);
          spokeGeo.rotateZ((s * Math.PI) / 4);
          const spoke = new THREE.Mesh(spokeGeo, goldTrimMat);
          wheelGroup.add(spoke);
        }
        isld.add(wheelGroup);

        const carnivalLight = new THREE.PointLight(0xff4488, 3.0, 70);
        carnivalLight.position.y = 18;
        isld.add(carnivalLight);
      }

      // Waypoint Glowing Ring / Beacon
      const ringGeo = new THREE.RingGeometry(radius + 2, radius + 4, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === activeIslandIndex ? 0xc5a059 : 0x315e63,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.5;
      isld.add(ringMesh);

      islandsGroup.add(isld);
    });

    // 9. ANIMATION & RENDER LOOP
    let animId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update Ocean Wave Vertices
      for (let i = 0; i < oceanPosAttr.count; i++) {
        const x = oceanPosAttr.getX(i);
        const z = oceanPosAttr.getZ(i);
        const wave = getWaveHeightAt(x, z, elapsedTime);
        oceanPosAttr.setY(i, baseOceanY[i] + wave);
      }
      oceanPosAttr.needsUpdate = true;
      oceanGeo.computeVertexNormals();

      // Auto-cruise progression if enabled
      if (isAutoCruisingRef.current) {
        targetProgressRef.current = (targetProgressRef.current + delta * 0.035) % 1.0;
        onProgressChange(targetProgressRef.current);
      }

      // Smooth Lerp progress toward target
      const lerpSpeed = isAutoCruisingRef.current ? 4 : 7;
      const prevProgress = currentProgressRef.current;
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * (1 - Math.exp(-delta * lerpSpeed));
      const p = Math.max(0, Math.min(1, currentProgressRef.current));

      // Calculate speed in knots based on delta movement
      const speed = Math.abs(currentProgressRef.current - prevProgress) / Math.max(0.001, delta) * 120 + 8.5;
      setShipSpeedKnots(Math.min(24, Math.round(speed * 10) / 10));

      // Calculate 3D Position along the voyage curve
      const shipPos = voyageCurve.getPointAt(p);
      const tangent = voyageCurve.getTangentAt(p).normalize();

      // Align ship with water wave elevation at its location
      const shipWaveY = getWaveHeightAt(shipPos.x, shipPos.z, elapsedTime);
      shipGroup.position.set(shipPos.x, shipWaveY + 0.3, shipPos.z);

      // Realistic Pitch (tilting front/back with waves) & Roll (rocking side to side)
      const pitch = Math.sin(elapsedTime * 2.4 + p * 30) * 0.065;
      const roll = Math.cos(elapsedTime * 1.9 + p * 20) * 0.05;

      // Realistic Yaw (Heading along voyage path)
      const angleY = Math.atan2(-tangent.z, tangent.x);
      shipGroup.rotation.set(0, angleY, 0);

      // Apply pitch and roll to the hull
      hullGroup.rotation.z = pitch;
      hullGroup.rotation.x = roll;

      // Fluttering flag in sea wind
      pennantMesh.rotation.y = Math.sin(elapsedTime * 6) * 0.18;

      // Gentle lantern flame flicker
      lanternLight.intensity = 2.4 + Math.sin(elapsedTime * 8) * 0.4;

      // Calculate nautical compass heading in degrees
      const headingDeg = Math.round(((angleY * 180) / Math.PI + 360) % 360);
      setHeadingDegrees(headingDeg);

      // Update Camera based on CameraMode
      const activeCam = cameraModeRef.current;
      if (activeCam === 'chase') {
        // Smooth Chase Camera: positioned 3/4 behind the boat
        const camOffset = new THREE.Vector3(-tangent.x * 42, 22, -tangent.z * 42);
        // Add subtle lateral offset for dramatic framing
        camOffset.x += -tangent.z * 18;
        camOffset.z += tangent.x * 18;

        const targetCamPos = shipGroup.position.clone().add(camOffset);
        camera.position.lerp(targetCamPos, delta * 3.5);
        camera.lookAt(shipGroup.position.x + tangent.x * 15, shipGroup.position.y + 4, shipGroup.position.z + tangent.z * 15);
      } else if (activeCam === 'helm') {
        // Captain's Quarterdeck Helm View: look over the ship's bow
        const helmEyePos = shipGroup.position.clone().add(new THREE.Vector3(tangent.x * -4, 6.2, tangent.z * -4));
        camera.position.copy(helmEyePos);
        const bowTarget = shipGroup.position.clone().add(new THREE.Vector3(tangent.x * 60, 4, tangent.z * 60));
        camera.lookAt(bowTarget);
      } else {
        // Overhead Chart View: top-down nautical survey
        const targetCamPos = new THREE.Vector3(shipGroup.position.x, 160, shipGroup.position.z + 40);
        camera.position.lerp(targetCamPos, delta * 3.0);
        camera.lookAt(shipGroup.position.x, 0, shipGroup.position.z);
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // 10. RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      oceanGeo.dispose();
      oceanMat.dispose();
    };
  }, []);

  // Mouse wheel / trackpad scroll listener to drive 3D ship
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Allow scrolling inside the 3D canvas to sail the ship forward or backward
      e.stopPropagation();
      const delta = e.deltaY * 0.00075;
      const nextProgress = Math.max(0, Math.min(1, targetProgressRef.current + delta));
      onProgressChange(nextProgress);
    },
    [onProgressChange]
  );

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating HUD: Nautical Telemetry & Controls */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto flex flex-col gap-2.5">
        {/* Telemetry Badge */}
        <div className="px-4 py-2.5 rounded-xl bg-[#0b141e]/85 border border-[#c5a059]/40 backdrop-blur-md shadow-2xl flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#c5a059]">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="font-bold tracking-widest">{String(headingDegrees).padStart(3, '0')}° HEADING</span>
          </div>
          <span className="w-[1px] h-4 bg-white/20" />
          <div className="text-[#f2e9d8]/90 font-medium">
            <span>{shipSpeedKnots} KTS</span>
          </div>
          <span className="w-[1px] h-4 bg-white/20" />
          <div className="text-[#c5a059] font-bold">
            <span>{Math.round(progress * 100)}% VOYAGE</span>
          </div>
        </div>

        {/* Scroll Instruction Hint */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b141e]/70 border border-white/10 text-[10px] tracking-wider uppercase text-[#f2e9d8]/75 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
          <span>SCROLL DOWN / UP TO SAIL 3D SHIP</span>
        </div>
      </div>

      {/* Top Right: Camera Mode Switcher */}
      <div className="absolute top-6 right-6 z-20 pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-[#0b141e]/85 border border-[#c5a059]/40 backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={() => setCameraMode('chase')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
            cameraMode === 'chase'
              ? 'bg-[#c5a059] text-[#0b141e] shadow-md'
              : 'text-[#f2e9d8]/70 hover:text-[#f2e9d8] hover:bg-white/5'
          }`}
        >
          CHASE CAM
        </button>
        <button
          type="button"
          onClick={() => setCameraMode('helm')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
            cameraMode === 'helm'
              ? 'bg-[#c5a059] text-[#0b141e] shadow-md'
              : 'text-[#f2e9d8]/70 hover:text-[#f2e9d8] hover:bg-white/5'
          }`}
        >
          HELM CAM
        </button>
        <button
          type="button"
          onClick={() => setCameraMode('overhead')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
            cameraMode === 'overhead'
              ? 'bg-[#c5a059] text-[#0b141e] shadow-md'
              : 'text-[#f2e9d8]/70 hover:text-[#f2e9d8] hover:bg-white/5'
          }`}
        >
          CHART CAM
        </button>
      </div>

      {/* Bottom Floating Control Deck */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-[92%] max-w-2xl px-5 py-3.5 rounded-2xl bg-[#0b141e]/90 border border-[#c5a059]/40 backdrop-blur-md shadow-2xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleAutoCruise}
              className="px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d6af48] text-[#0b141e] font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5 shadow-md transition-colors"
            >
              {isAutoCruising ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutoCruising ? 'PAUSE CRUISE' : 'AUTO CRUISE'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextIdx = Math.max(0, activeIslandIndex - 1);
                onSelectIsland(nextIdx);
                onProgressChange(islands.length > 1 ? nextIdx / (islands.length - 1) : 0);
              }}
              disabled={activeIslandIndex <= 0}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#f2e9d8] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Island"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                const nextIdx = Math.min(islands.length - 1, activeIslandIndex + 1);
                onSelectIsland(nextIdx);
                onProgressChange(islands.length > 1 ? nextIdx / (islands.length - 1) : 1);
              }}
              disabled={activeIslandIndex >= islands.length - 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#f2e9d8] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Island"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="text-[11px] font-mono font-bold tracking-widest text-[#c5a059]">
            <span>ISLE 0{activeIslandIndex + 1} OF 0{islands.length || 5}</span>
          </div>
        </div>

        {/* Interactive Voyage Progress Slider (Scrubber) */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => onProgressChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#1d3045] rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
          />
        </div>

        {/* Island Waypoint Markers */}
        <div className="flex justify-between px-1">
          {islands.map((isle, idx) => {
            const frac = islands.length > 1 ? idx / (islands.length - 1) : 0;
            const isCurrent = Math.abs(progress - frac) < 0.12;

            return (
              <button
                key={isle.id}
                type="button"
                onClick={() => {
                  onSelectIsland(idx);
                  onProgressChange(frac);
                }}
                className={`text-[9px] font-mono tracking-wider transition-colors ${
                  isCurrent ? 'text-[#c5a059] font-bold underline' : 'text-[#f2e9d8]/60 hover:text-[#f2e9d8]'
                }`}
              >
                0{idx + 1} {isle.islandName.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
