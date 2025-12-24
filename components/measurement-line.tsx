"use client"

import { Line, Html } from "@react-three/drei"
import * as THREE from "three"

interface MeasurementLineProps {
  start: THREE.Vector3
  end: THREE.Vector3
  distance: number
  color?: string
}

export function MeasurementLine({ start, end, distance, color = "#ef4444" }: MeasurementLineProps) {
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={2} />

      <mesh position={start}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={end}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <Html position={midpoint} center>
        <div className="rounded bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground shadow-lg">
          {(distance * 1000).toFixed(1)} мм
        </div>
      </Html>
    </group>
  )
}
