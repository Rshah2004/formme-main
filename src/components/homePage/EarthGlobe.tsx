import { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const LOCATIONS: { name: string; lat: number; lng: number }[] = [
  { name: "Bangladesh", lat: 23.685, lng: 90.356 },
  { name: "India", lat: 20.594, lng: 78.963 },
  { name: "China", lat: 35.862, lng: 104.195 },
  { name: "Pakistan", lat: 30.375, lng: 69.345 },
  { name: "Canada", lat: 56.13, lng: -106.347 },
];

const ARC_PAIRS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
];

const INITIAL_HOLD = 1.5;
const PHASE_DURATION = 4;
const HOLD_DURATION = 3;
const FADE_DURATION = 1.5;

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function lngToRotationY(lng: number): number {
  return -((lng + 90) * (Math.PI / 180));
}

function buildArc(a: [number, number], b: [number, number], r: number) {
  const N = 60;
  const sV = latLngToVec3(a[0], a[1], r);
  const eV = latLngToVec3(b[0], b[1], r);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const v = new THREE.Vector3().copy(sV).lerp(eV, t).normalize();
    v.multiplyScalar(r * (1 + 0.06 * Math.sin(t * Math.PI)));
    pts.push(v);
  }
  return pts;
}

const PHASE_TARGETS = ARC_PAIRS.map(([, bi]) => {
  return { y: lngToRotationY(LOCATIONS[bi].lng), x: 0 };
});

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Scene({ onActiveIndexChange }: { onActiveIndexChange?: (idx: number) => void }) {
  const R = 1;
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, "/images/earth-texture.jpg");
  const dotRefs = useRef<(THREE.Mesh | null)[]>([]);

  const arcs = useMemo(() => {
    return ARC_PAIRS.map(([ai, bi]) => {
      const a = LOCATIONS[ai];
      const b = LOCATIONS[bi];
      const pts = buildArc([a.lat, a.lng], [b.lat, b.lng], R);
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 60, 0.004, 6, false);
      const mat = new THREE.MeshBasicMaterial({
        color: "#b8784e",
        transparent: true,
        opacity: 0,
      });
      const totalIndices = geo.index ? geo.index.count : 0;
      geo.setDrawRange(0, 0);
      const mesh = new THREE.Mesh(geo, mat);
      return { mesh, mat, geo, totalIndices };
    });
  }, []);
  const activeIndexRef = useRef<number>(-1);

  const stateRef = useRef({
    dotScales: LOCATIONS.map(() => 0),
    currentRotationY: lngToRotationY(LOCATIONS[1].lng),
    currentRotationX: 0,
  });

  const totalCycle =
    INITIAL_HOLD + ARC_PAIRS.length * PHASE_DURATION + HOLD_DURATION + FADE_DURATION;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const cycleTime = elapsed % totalCycle;
    const state = stateRef.current;

    const phasesEnd = ARC_PAIRS.length * PHASE_DURATION;
    const holdEnd = phasesEnd + HOLD_DURATION;

    let inFade = false;
    let inHold = false;
    let phase = -1;
    let phaseT = 0;

    if (cycleTime < INITIAL_HOLD) {
      phase = -1;
      phaseT = 0;
      inHold = true;
    } else if (cycleTime < phasesEnd) {
      const adjusted = cycleTime - INITIAL_HOLD;
      phase = Math.floor(adjusted / PHASE_DURATION);
      phaseT = (adjusted - phase * PHASE_DURATION) / PHASE_DURATION;
    } else if (cycleTime < holdEnd) {
      inHold = true;
      phase = ARC_PAIRS.length - 1;
      phaseT = 1;
    } else {
      inFade = true;
      phaseT = (cycleTime - holdEnd) / FADE_DURATION;
    }

    let focusIndex = -1;
    if (!inFade) {
      if (cycleTime < INITIAL_HOLD) {
        focusIndex = 0;
      } else {
        focusIndex = Math.min(phase, LOCATIONS.length - 1);
      }
      const isFinalPhase = phase === ARC_PAIRS.length - 1;
      if (isFinalPhase && (inHold || phaseT > 0.6)) {
        focusIndex = LOCATIONS.length - 1;
      }
    }
    if (onActiveIndexChange) {
      if (activeIndexRef.current !== focusIndex) {
        activeIndexRef.current = focusIndex;
        onActiveIndexChange(focusIndex);
      }
    }

    if (inFade) {
      state.currentRotationY = THREE.MathUtils.lerp(
        state.currentRotationY,
        lngToRotationY(LOCATIONS[0].lng),
        0.03
      );
      state.currentRotationX = THREE.MathUtils.lerp(state.currentRotationX, 0, 0.03);
    } else if (focusIndex >= 0) {
      const targetY = lngToRotationY(LOCATIONS[focusIndex].lng);
      state.currentRotationY = THREE.MathUtils.lerp(state.currentRotationY, targetY, 0.03);
      state.currentRotationX = THREE.MathUtils.lerp(state.currentRotationX, 0, 0.03);
    } else if (phase >= 0) {
      const target = PHASE_TARGETS[Math.min(phase, PHASE_TARGETS.length - 1)];
      state.currentRotationY = THREE.MathUtils.lerp(state.currentRotationY, target.y, 0.02);
      state.currentRotationX = THREE.MathUtils.lerp(state.currentRotationX, target.x, 0.02);
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = state.currentRotationY;
      groupRef.current.rotation.x = state.currentRotationX;
    }

    for (let i = 0; i < LOCATIONS.length; i++) {
      let targetScale = 0;

      if (inFade) {
        targetScale = THREE.MathUtils.lerp(1, 0, easeInOutCubic(phaseT));
      } else {
        let activated = false;
        if (i === 0 && (phase >= 0 || cycleTime < INITIAL_HOLD)) activated = true;
        for (let p = 0; p <= phase; p++) {
          if (ARC_PAIRS[p][1] === i) activated = true;
        }
        if (activated) targetScale = 1;
      }

      state.dotScales[i] = THREE.MathUtils.lerp(state.dotScales[i], targetScale, 0.08);

      const dot = dotRefs.current[i];
      if (dot) {
        let isActive = false;
        if (!inFade && !inHold && phase >= 0) {
          if (i === 0 && phase === 0) isActive = true;
          if (phase < ARC_PAIRS.length && ARC_PAIRS[phase][1] === i) isActive = true;
        }
        const pulse = isActive ? 1 + 0.15 * Math.sin(elapsed * 3) : 1;
        const s = state.dotScales[i] * pulse;
        dot.scale.setScalar(Math.max(s, 0.001));
      }
    }

    for (let a = 0; a < arcs.length; a++) {
      const arc = arcs[a];
      if (inFade) {
        arc.mat.opacity = THREE.MathUtils.lerp(0.6, 0, easeInOutCubic(phaseT));
        arc.geo.setDrawRange(0, arc.totalIndices);
      } else if (a < phase) {
        arc.mat.opacity = 0.25;
        arc.geo.setDrawRange(0, arc.totalIndices);
      } else if (a === phase && phase >= 0) {
        const drawProgress = easeInOutCubic(Math.min(phaseT * 1.2, 1));
        const count = Math.floor(drawProgress * arc.totalIndices);
        arc.geo.setDrawRange(0, count);
        arc.mat.opacity = 0.6;
      } else {
        arc.geo.setDrawRange(0, 0);
        arc.mat.opacity = 0;
      }
    }

    if (inFade && phaseT >= 0.99) {
      state.dotScales = LOCATIONS.map(() => 0);
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.3} />
      <directionalLight position={[-3, -1, -3]} intensity={0.4} />

      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.9}
            metalness={0}
            color="#e8e4de"
            emissive="#1a1a1a"
            emissiveIntensity={0.12}
          />
        </mesh>

        {LOCATIONS.map((loc, i) => {
          const pos = latLngToVec3(loc.lat, loc.lng, R * 1.005);
          return (
            <mesh
              key={loc.name}
              position={pos}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              scale={0.001}
            >
              <sphereGeometry args={[0.016, 12, 12]} />
              <meshBasicMaterial color="#b8784e" />
            </mesh>
          );
        })}

        {arcs.map((arc, i) => (
          <primitive key={i} object={arc.mesh} />
        ))}
      </group>

      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.4} autoRotate={false} />
    </>
  );
}

const EarthGlobe = ({ onActiveIndexChange }: { onActiveIndexChange?: (idx: number) => void }) => {
  const camPos = useMemo(() => {
    return [0, 0.9, 2.6] as [number, number, number];
  }, []);

  return (
    <Canvas
      camera={{ position: camPos, fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene onActiveIndexChange={onActiveIndexChange} />
    </Canvas>
  );
};

export default EarthGlobe;
