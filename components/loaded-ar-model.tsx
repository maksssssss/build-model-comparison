"use client"

import { useEffect, useState, useRef } from "react"
import { loadModelFile } from "@/lib/file-loaders"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"

interface LoadedARModelProps {
  file: File
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onTransform: (position: [number, number, number], rotation: [number, number, number], scale: number) => void
  isARActive: boolean
}

export function LoadedARModel({ file, position, rotation, scale, onTransform, isARActive }: LoadedARModelProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null)
  const [loading, setLoading] = useState(true)
  const modelRef = useRef<THREE.Object3D>(null)
  const { scene } = useThree()

  // Load model
  useEffect(() => {
    let mounted = true

    const loadModel = async () => {
      try {
        setLoading(true)
        const loadedModel = await loadModelFile(file)

        if (!mounted) return

        // Center and scale model
        const box = new THREE.Box3().setFromObject(loadedModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        loadedModel.position.sub(center)

        const maxDim = Math.max(size.x, size.y, size.z)
        const initialScale = 2 / maxDim
        loadedModel.scale.setScalar(initialScale)

        // Apply semi-transparent material for better AR visibility
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x4a90e2,
              transparent: true,
              opacity: 0.6,
              side: THREE.FrontSide,
              roughness: 0.5,
              metalness: 0.2,
            })
          }
        })

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

  if (loading || !model) {
    return null
  }

  return <primitive ref={modelRef} object={model} />
}
