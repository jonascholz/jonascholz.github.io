/**
 * Interactive MuJoCo scene: a differential-drive rover with a lidar fan that
 * wanders its arena, drives to wherever you click and pushes things around.
 * Physics run in WebAssembly (official @mujoco/mujoco bindings), rendering in
 * three.js via React Three Fiber.
 */
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { MainModule } from '@mujoco/mujoco';
import xml from './rover.xml?raw';
import { RoverSim } from './rover-sim.ts';
import { RAY_ANGLES } from './controller.ts';

/** MuJoCo geom type ids (mjtGeom). */
const GEOM = { plane: 0, sphere: 2, capsule: 3, cylinder: 5, box: 6 } as const;
const MAX_STEP = 1 / 30;

const STATUS: Record<RoverSim['mode'], string> = {
  wander: 'wandering',
  goal: 'driving to your goal',
  escape: 'backing out',
};

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setDark(root.dataset.theme ? root.dataset.theme === 'dark' : media.matches);
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    media.addEventListener('change', update);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', update);
    };
  }, []);
  return dark;
}

function geometryFor(type: number, size: ArrayLike<number>): THREE.BufferGeometry | null {
  switch (type) {
    case GEOM.plane:
      return new THREE.PlaneGeometry(size[0] * 2, size[1] * 2);
    case GEOM.sphere:
      return new THREE.SphereGeometry(size[0], 32, 16);
    case GEOM.box:
      return new THREE.BoxGeometry(size[0] * 2, size[1] * 2, size[2] * 2);
    case GEOM.cylinder:
      return new THREE.CylinderGeometry(size[0], size[0], size[1] * 2, 40).rotateX(Math.PI / 2);
    case GEOM.capsule:
      return new THREE.CapsuleGeometry(size[0], size[1] * 2, 8, 24).rotateX(Math.PI / 2);
    default:
      return null;
  }
}

interface SceneProps {
  sim: RoverSim;
  dark: boolean;
  onStatus: (s: string) => void;
}

function Scene({ sim, dark, onStatus }: SceneProps) {
  const { model, data } = sim;
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const lastStatus = useRef('');

  // One mesh per MuJoCo geom, colored from the model (floor and walls follow the theme).
  const geoms = useMemo(
    () =>
      Array.from({ length: model.ngeom }, (_, i) => {
        const type = model.geom_type[i];
        const size = model.geom_size.slice(i * 3, i * 3 + 3);
        const rgba = model.geom_rgba.slice(i * 4, i * 4 + 4);
        return { i, type, body: model.geom_bodyid[i], geometry: geometryFor(type, size), rgba };
      }),
    [model],
  );
  const floorColor = dark ? '#1c2029' : '#ecebe6';
  const wallColor = dark ? '#3a4150' : '#c9ccd4';

  const rayGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAY_ANGLES.length * 6), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(RAY_ANGLES.length * 6), 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    sim.step(Math.min(delta, MAX_STEP));

    const m = new THREE.Matrix4();
    for (const g of geoms) {
      const mesh = meshes.current[g.i];
      if (!mesh) continue;
      const p = g.i * 3;
      const r = g.i * 9;
      const R = data.geom_xmat;
      const X = data.geom_xpos;
      m.set(R[r], R[r + 1], R[r + 2], X[p], R[r + 3], R[r + 4], R[r + 5], X[p + 1], R[r + 6], R[r + 7], R[r + 8], X[p + 2], 0, 0, 0, 1);
      mesh.matrix.copy(m);
    }

    const pos = rayGeometry.attributes.position as THREE.BufferAttribute;
    const col = rayGeometry.attributes.color as THREE.BufferAttribute;
    sim.rays.forEach((ray, k) => {
      pos.setXYZ(2 * k, ...ray.from);
      pos.setXYZ(2 * k + 1, ...ray.to);
      const c = ray.hit ? [1, 0.35, 0.3] : dark ? [0.35, 0.45, 0.6] : [0.55, 0.65, 0.8];
      col.setXYZ(2 * k, c[0], c[1], c[2]);
      col.setXYZ(2 * k + 1, c[0], c[1], c[2]);
    });
    pos.needsUpdate = true;
    col.needsUpdate = true;

    const status = STATUS[sim.mode];
    if (status !== lastStatus.current) {
      lastStatus.current = status;
      onStatus(status);
    }
  });

  // MuJoCo is z-up, three.js is y-up: rotate the whole world.
  const world = useRef<THREE.Group>(null);
  const toSim = (point: THREE.Vector3) => world.current!.worldToLocal(point.clone());

  const onFloorClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return; // that was an orbit drag
    e.stopPropagation();
    const p = toSim(e.point);
    sim.setGoal(p.x, p.y);
  };

  const onBodyClick = (body: number) => (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return;
    e.stopPropagation();
    const p = toSim(e.point);
    const rover = sim.pose;
    const d = Math.hypot(p.x - rover.x, p.y - rover.y) || 1;
    sim.kick(body, [(p.x - rover.x) / d, (p.y - rover.y) / d]);
  };

  const isFree = (body: number) => body > 0 && model.body_dofnum[body] === 6 && model.body_mocapid[body] < 0;

  return (
    <group ref={world} rotation={[-Math.PI / 2, 0, 0]}>
      {geoms.map((g) => {
        if (!g.geometry) return null;
        const isFloor = g.type === GEOM.plane;
        const isStatic = g.body === 0 && !isFloor;
        const color = isFloor ? floorColor : isStatic ? wallColor : new THREE.Color(g.rgba[0], g.rgba[1], g.rgba[2]);
        const clickable = isFloor ? onFloorClick : isFree(g.body) && g.body !== sim.rover ? onBodyClick(g.body) : undefined;
        return (
          <mesh
            key={g.i}
            ref={(el) => {
              meshes.current[g.i] = el;
            }}
            geometry={g.geometry}
            matrixAutoUpdate={false}
            castShadow={!isFloor && g.rgba[3] > 0.9}
            receiveShadow
            onClick={clickable}
            onPointerOver={clickable ? () => (document.body.style.cursor = 'pointer') : undefined}
            onPointerOut={clickable ? () => (document.body.style.cursor = '') : undefined}
          >
            <meshStandardMaterial
              color={color}
              roughness={isFloor ? 0.95 : 0.55}
              metalness={0.05}
              transparent={g.rgba[3] < 1}
              opacity={g.rgba[3]}
            />
          </mesh>
        );
      })}
      <lineSegments geometry={rayGeometry} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}

export interface RoverDemoProps {
  /** CSS height of the canvas. */
  height?: string;
}

export default function RoverDemo({ height = '28rem' }: RoverDemoProps) {
  const [sim, setSim] = useState<RoverSim | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('loading physics');
  const [visible, setVisible] = useState(true);
  const mj = useRef<MainModule | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const dark = useDarkMode();

  useEffect(() => {
    let cancelled = false;
    let created: RoverSim | null = null;
    (async () => {
      try {
        if (!mj.current) {
          const { default: load } = await import('@mujoco/mujoco');
          mj.current = await load();
        }
        if (cancelled) return;
        created = new RoverSim(mj.current, xml);
        setSim(created);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      created?.dispose();
    };
  }, []);

  // Pause the simulation while the demo is scrolled out of view.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="rover-demo" ref={container} style={{ height }}>
      {sim && (
        <Canvas
          shadows
          dpr={[1, 2]}
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 3.9, 3.1], fov: 42, near: 0.05, far: 50 }}
          aria-label="Interactive 3D simulation of a rover robot. Click the floor to set a goal."
        >
          <ambientLight intensity={dark ? 0.55 : 0.8} />
          <directionalLight
            position={[2.5, 4, 2]}
            intensity={dark ? 1.6 : 2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
          />
          <Scene sim={sim} dark={dark} onStatus={setStatus} />
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 0, 0]}
          />
        </Canvas>
      )}
      <div className="rover-hud">
        <span className="rover-status">
          <span className="dot" aria-hidden="true" />
          {error ? `could not start: ${error}` : `rover: ${status}`}
        </span>
        <span className="rover-help">Click the floor to send it there · click a crate to kick it · drag to orbit</span>
        <button type="button" onClick={() => sim?.reset()} disabled={!sim}>
          Reset
        </button>
      </div>
    </div>
  );
}
