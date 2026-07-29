import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Procedural studio lighting — no remote HDR fetch (keeps CSP happy and the
// transmission glass actually visible on a dark page).
function LocalEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const envMap = pmrem.fromScene(room, 0.04).texture
    scene.environment = envMap

    return () => {
      scene.environment = null
      envMap.dispose()
      pmrem.dispose()
      room.dispose()
    }
  }, [gl, scene])

  return null
}

function RotatingCube() {
  const meshRef = useRef(null)

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
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4.2], fov: 38 }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 3, 4]} intensity={1.35} color="#ffffff" />
        <pointLight position={[-3, -2, 2]} intensity={0.95} color="#7dd3fc" />
        <pointLight position={[2.5, -2.5, -2]} intensity={0.75} color="#f472b6" />
        <LocalEnvironment />
        <RotatingCube />
      </Canvas>
    </div>
  )
}
