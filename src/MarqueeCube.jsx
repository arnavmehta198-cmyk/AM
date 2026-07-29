import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'

function RotatingCube() {
  const meshRef = useRef(null)

  // Independent, self-running rotation — never tied to scroll/marquee state.
  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * 0.35
    meshRef.current.rotation.y += delta * 0.55
  })

  return (
    <RoundedBox ref={meshRef} args={[1.7, 1.7, 1.7]} radius={0.09} smoothness={4}>
      <MeshTransmissionMaterial
        thickness={0.55}
        roughness={0.08}
        transmission={1}
        ior={1.2}
        chromaticAberration={0.04}
        anisotropy={0.2}
        distortion={0.08}
        distortionScale={0.2}
        temporalDistortion={0.05}
        color="#eaf6ff"
        samples={4}
        resolution={256}
        backside
      />
    </RoundedBox>
  )
}

export default function MarqueeCube() {
  return (
    <div className="marquee-cube-canvas-wrap">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        camera={{ position: [0, 0, 4.2], fov: 38 }}
        frameloop="always"
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 3, 4]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-3, -2, 2]} intensity={0.8} color="#7dd3fc" />
        <Suspense fallback={null}>
          <RotatingCube />
        </Suspense>
      </Canvas>
    </div>
  )
}
