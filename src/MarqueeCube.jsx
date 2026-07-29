import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'

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
        thickness={0.6}
        roughness={0.04}
        transmission={1}
        ior={1.2}
        chromaticAberration={0.08}
        anisotropy={0.4}
        distortion={0.15}
        distortionScale={0.25}
        temporalDistortion={0.1}
        color="#eaf6ff"
        backside
      />
    </RoundedBox>
  )
}

export default function MarqueeCube() {
  return (
    <div className="marquee-cube-canvas-wrap">
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        camera={{ position: [0, 0, 4.2], fov: 38 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 4]} intensity={1.3} color="#ffffff" />
        <pointLight position={[-3, -2, 2]} intensity={0.9} color="#7dd3fc" />
        <pointLight position={[2.5, -2.5, -2]} intensity={0.7} color="#f472b6" />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <RotatingCube />
        </Suspense>
      </Canvas>
    </div>
  )
}
