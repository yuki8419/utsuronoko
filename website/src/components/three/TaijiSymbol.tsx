"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { MotionValue } from "framer-motion";

interface TaijiMeshProps {
  mousePosition: { x: number; y: number };
  isHovered: boolean;
  isVisible: boolean;
  smoothedSepRef: React.MutableRefObject<number>;
  scaleRef: React.MutableRefObject<number>;
}

// 分離値を滑らかにするコンポーネント
function SeparationSmoother({
  separationRef,
  smoothedSepRef
}: {
  separationRef: React.MutableRefObject<number>;
  smoothedSepRef: React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    const targetSep = separationRef.current;
    const sepSmoothness = 0.12;
    const sepLerp = 1 - Math.exp(-sepSmoothness * delta * 60);
    smoothedSepRef.current += (targetSep - smoothedSepRef.current) * sepLerp;
  });
  return null;
}

// 高品質な太極図
function Taiji3D({ mousePosition, isHovered, isVisible, smoothedSepRef, scaleRef }: TaijiMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const yinRef = useRef<THREE.Group>(null);
  const yangRef = useRef<THREE.Group>(null);

  const radius = 2;
  const smallRadius = radius / 2;

  const currentRotation = useRef({ x: 0, y: 0, z: 0 });
  const currentFloating = useRef(0);

  // マテリアル
  const materials = useMemo(() => ({
    yin: new THREE.MeshPhysicalMaterial({
      color: "#080808",
      roughness: 0.15,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    }),
    yang: new THREE.MeshPhysicalMaterial({
      color: "#f8f8f5",
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      emissive: "#ffffff",
      emissiveIntensity: 0.05,
      side: THREE.DoubleSide,
    }),
    gold: new THREE.MeshPhysicalMaterial({
      color: "#d4af37",
      roughness: 0.25,
      metalness: 1.0,
      clearcoat: 0.9,
      emissive: "#b8860b",
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    }),
  }), []);

  useFrame((state, delta) => {
    if (!isVisible) return;

    const time = state.clock.getElapsedTime();

    // 共有のsmoothedSepRefから値を取得
    const sep = smoothedSepRef.current;

    // フレームレート非依存の滑らかな補間（回転と浮遊のみ）
    const rotationSmoothness = 0.15;
    const floatSmoothness = 0.15;

    // 指数減衰補間（フレームレート非依存）
    const rotLerp = 1 - Math.exp(-rotationSmoothness * delta * 60);
    const floatLerp = 1 - Math.exp(-floatSmoothness * delta * 60);

    const targetRotX = mousePosition.y * 0.25;
    const targetRotY = mousePosition.x * 0.25;

    if (groupRef.current) {
      currentRotation.current.z -= delta * 0.1;

      const floatSpeed = 0.4 + sep * 1.5;
      const floatAmp = 0.08 + sep * 0.08;
      const targetFloating = Math.sin(time * floatSpeed) * floatAmp;
      currentFloating.current += (targetFloating - currentFloating.current) * floatLerp;

      currentRotation.current.x += (targetRotX - currentRotation.current.x) * rotLerp;
      currentRotation.current.y += (targetRotY - currentRotation.current.y) * rotLerp;

      groupRef.current.rotation.set(
        currentRotation.current.x,
        currentRotation.current.y,
        currentRotation.current.z
      );
      groupRef.current.position.y = currentFloating.current;

      // スケールを適用（Three.js内で処理することでDOMとの同期問題を解消）
      const scale = scaleRef.current;
      groupRef.current.scale.setScalar(scale);
    }

    // 陰陽分離 - Framer Motionで補間済みの値を直接使用
    if (yinRef.current && yangRef.current) {
      // 分離距離（最大3.0まで）
      const dist = sep * 3.0;
      // 回転角度（最大90度）
      const angle = sep * Math.PI * 0.5;

      // 陰（黒）は左上へ - 直接設定
      yinRef.current.position.x = -Math.cos(angle) * dist;
      yinRef.current.position.y = Math.sin(angle) * dist;
      yinRef.current.rotation.z = sep * 0.3;

      // 陽（白）は右下へ - 直接設定
      yangRef.current.position.x = Math.cos(angle) * dist;
      yangRef.current.position.y = -Math.sin(angle) * dist;
      yangRef.current.rotation.z = -sep * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 陰（黒）側 */}
      <group ref={yinRef}>
        {/* メイン半円 - 左側 */}
        <mesh>
          <circleGeometry args={[radius, 64, Math.PI / 2, Math.PI]} />
          <primitive object={materials.yin} attach="material" />
        </mesh>
        {/* 上の膨らみ（白側に食い込む黒） */}
        <mesh position={[0, smallRadius, 0.001]}>
          <circleGeometry args={[smallRadius, 32, -Math.PI / 2, Math.PI]} />
          <primitive object={materials.yin} attach="material" />
        </mesh>
        {/* 陰中の陽（黒の中の白い点） */}
        <mesh position={[0, smallRadius, 0.002]}>
          <circleGeometry args={[0.28, 32]} />
          <primitive object={materials.yang} attach="material" />
        </mesh>
      </group>

      {/* 陽（白）側 */}
      <group ref={yangRef}>
        {/* メイン半円 - 右側 */}
        <mesh>
          <circleGeometry args={[radius, 64, -Math.PI / 2, Math.PI]} />
          <primitive object={materials.yang} attach="material" />
        </mesh>
        {/* 下の膨らみ（黒側に食い込む白） */}
        <mesh position={[0, -smallRadius, 0.001]}>
          <circleGeometry args={[smallRadius, 32, Math.PI / 2, Math.PI]} />
          <primitive object={materials.yang} attach="material" />
        </mesh>
        {/* 陽中の陰（白の中の黒い点） */}
        <mesh position={[0, -smallRadius, 0.002]}>
          <circleGeometry args={[0.28, 32]} />
          <primitive object={materials.yin} attach="material" />
        </mesh>
      </group>

      {/* 外周リング（金） */}
      <mesh position={[0, 0, 0.003]}>
        <ringGeometry args={[radius - 0.02, radius + 0.05, 128]} />
        <primitive object={materials.gold} attach="material" />
      </mesh>
    </group>
  );
}

// シンプルで美しいパーティクル
function GoldParticles({ smoothedSepRef, scaleRef }: { smoothedSepRef: React.MutableRefObject<number>; scaleRef: React.MutableRefObject<number> }) {
  const particlesRef = useRef<THREE.Points>(null);

  const { geometry } = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 2.8 + Math.random() * 1.8;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: geo };
  }, []);

  const currentRotation = useRef(0);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const separation = smoothedSepRef.current;
    const time = state.clock.getElapsedTime();
    const rotationSpeed = 0.03 + separation * 0.08;

    currentRotation.current += delta * rotationSpeed;
    particlesRef.current.rotation.z = currentRotation.current;

    // スケールを適用
    const scale = scaleRef.current;
    particlesRef.current.scale.setScalar(scale);

    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.5 + separation * 0.3 + Math.sin(time * 0.8) * 0.15;
    material.size = 0.06 + separation * 0.04;
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color="#d4af37"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// エレガントなリング
function ElegantRings({ smoothedSepRef, scaleRef }: { smoothedSepRef: React.MutableRefObject<number>; scaleRef: React.MutableRefObject<number> }) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const separation = smoothedSepRef.current;
    const globalScale = scaleRef.current;
    const time = state.clock.getElapsedTime();

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.06;
      const scale = (1 + separation * 0.12) * globalScale;
      ring1Ref.current.scale.setScalar(scale);
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.25 + separation * 0.1 + Math.sin(time * 1.2) * 0.08;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.04;
      const scale = (1 + separation * 0.18) * globalScale;
      ring2Ref.current.scale.setScalar(scale);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + separation * 0.08 + Math.cos(time * 1.0) * 0.05;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[0, 0, -0.01]}>
        <ringGeometry args={[2.5, 2.55, 128]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, -0.02]}>
        <ringGeometry args={[3.0, 3.03, 128]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

interface TaijiSymbolProps {
  separationMotionValue?: MotionValue<number>;
  scaleMotionValue?: MotionValue<number>;
  className?: string;
}

export default function TaijiSymbol({
  separationMotionValue,
  scaleMotionValue,
  className = "",
}: TaijiSymbolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  // MotionValueの値をrefで追跡（React stateを経由しない）
  const separationRef = useRef(0);
  const scaleRef = useRef(1);
  // 全コンポーネントで共有するスムージング済みの値
  const smoothedSepRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // MotionValueの変更をrefに直接反映
  useEffect(() => {
    if (!separationMotionValue) return;

    // 初期値を設定
    separationRef.current = separationMotionValue.get();

    // 変更を購読
    const unsubscribe = separationMotionValue.on("change", (value) => {
      separationRef.current = value;
    });

    return () => unsubscribe();
  }, [separationMotionValue]);

  // scaleMotionValueの変更をrefに直接反映
  useEffect(() => {
    if (!scaleMotionValue) return;

    scaleRef.current = scaleMotionValue.get();

    const unsubscribe = scaleMotionValue.on("change", (value) => {
      scaleRef.current = value;
    });

    return () => unsubscribe();
  }, [scaleMotionValue]);

  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setMousePosition({
        x: Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2))),
        y: Math.max(-1, Math.min(1, -(e.clientY - centerY) / (rect.height / 2))),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted]);

  if (!mounted) {
    return <div className={`w-full h-full ${className}`} />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
        frameloop="always"
      >
        {/* ライティング */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} color="#fff8f0" />
        <directionalLight position={[-3, -2, 3]} intensity={0.4} color="#e8dcc8" />
        <pointLight position={[0, 0, 4]} intensity={0.8} color="#d4af37" distance={12} />

        {/* 分離値のスムージング処理 */}
        <SeparationSmoother separationRef={separationRef} smoothedSepRef={smoothedSepRef} />

        <Taiji3D
          mousePosition={mousePosition}
          isHovered={isHovered}
          isVisible={isVisible}
          smoothedSepRef={smoothedSepRef}
          scaleRef={scaleRef}
        />
        <GoldParticles smoothedSepRef={smoothedSepRef} scaleRef={scaleRef} />
        <ElegantRings smoothedSepRef={smoothedSepRef} scaleRef={scaleRef} />

        {/* Bloom only - 背景を透明に保つ */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            intensity={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
