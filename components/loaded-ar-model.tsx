"use client"

import { useEffect, useState, useRef } from "react"
import { loadModelFromFile } from "@/lib/file-loaders"
import * as THREE from "three"

interface LoadedARModelProps {
  file: File
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onTransform: (position: [number, number, number], rotation: [number, number, number], scale: number) => void
}

export function LoadedARModel({ file, position, rotation, scale, onTransform }: LoadedARModelProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null)
  const [loading, setLoading] = useState(true)
  const modelRef = useRef<THREE.Object3D>(null)

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
            const material = child.material as THREE.MeshStandardMaterial
            if (material) {
              material.transparent = true
              material.opacity = 0.7
              material.side = THREE.FrontSide
              material.roughness = 0.6
              material.metalness = 0.2
              material.color.set(0x4a90e2) // Blue tint for AR overlay
            }
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

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(...position)
      modelRef.current.rotation.set(...rotation)
      modelRef.current.scale.setScalar(scale)
    }
  }, [position, rotation, scale])

  // Update transform callback
  useEffect(() => {
    if (modelRef.current) {
      const pos = modelRef.current.position
      const rot = modelRef.current.rotation
      const modelScale = modelRef.current.scale.x

      onTransform([pos.x, pos.y, pos.z], [rot.x, rot.y, rot.z], modelScale)
    }
  }, [model, onTransform])

  if (loading) {
    return (
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#3b82f6" wireframe />
      </mesh>
    )
  }

  if (!model) {
    return null
  }

  return <primitive ref={modelRef} object={model} />
}
