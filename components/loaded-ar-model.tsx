"use client"

import { useEffect, useState, useRef } from "react"
import { loadModelFromFile } from "@/lib/file-loaders"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"

interface LoadedARModelProps {
  file: File
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onTransform: (position: [number, number, number], rotation: [number, number, number], scale: number) => void
  isARActive: boolean
  onPointerDown?: (point: [number, number, number]) => void
  referencePoints?: { id: string; modelPosition: [number, number, number] | null; name: string }[]
}

export function LoadedARModel({
  file,
  position,
  rotation,
  scale,
  onTransform,
  isARActive,
  onPointerDown,
  referencePoints = []
}: LoadedARModelProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null)
  const [loading, setLoading] = useState(true)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    let mounted = true

    const loadModel = async () => {
      try {
        console.log(`[v0] Loading AR model: ${file.name}`)
        setLoading(true)

        const loadedModel = await loadModelFromFile(file)

        if (!mounted) return

        // Center model
        const box = new THREE.Box3().setFromObject(loadedModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        loadedModel.position.sub(center)

        // Auto-scale to reasonable size (2 units)
        const maxDim = Math.max(size.x, size.y, size.z)
        const initialScale = 2 / maxDim
        loadedModel.scale.setScalar(initialScale)

        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x4a90e2,
              transparent: true,
              opacity: 0.6,
              side: THREE.DoubleSide,
              roughness: 0.5,
              metalness: 0.2,
            })
          }
        })

        console.log(`[v0] AR model loaded successfully: ${file.name}`)
        setModel(loadedModel)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error loading AR model:", error)
        setLoading(false)
      }
    }

    loadModel()

    return () => {
      mounted = false
    }
  }, [file])

  if (loading || !model) {
    return null
  }

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    if (onPointerDown) {
      const point = e.point
      // Convert world point to local point if needed, but here we probably want world point in scene coords
      onPointerDown([point.x, point.y, point.z])
    }
  }

  return (
    <group ref={modelRef} position={position} rotation={rotation} scale={scale}>
      <primitive
        object={model}
        onPointerDown={handlePointerDown}
      />
      {/* Render Markers for reference points */}
      {referencePoints.map((p) => p.modelPosition && (
        <mesh key={p.id} position={p.modelPosition}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}
    </group>
  )
}
