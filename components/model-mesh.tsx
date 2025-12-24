"use client"

import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import * as THREE from "three"
import { useEffect, useRef } from "react"

interface ModelMeshProps {
  url: string
  color: string
  opacity: number
  position: [number, number, number]
  onLoad?: (object: THREE.Object3D) => void
}

// Try to determine file type from URL
const getFileExtension = (url: string) => {
  const match = url.match(/\.([^./?]+)(\?|$)/)
  return match ? match[1].toLowerCase() : ""
}

// Determine loader based on file type
const getLoader = (ext: string) => {
  switch (ext) {
    case "glb":
    case "gltf":
      return GLTFLoader
    case "obj":
      return OBJLoader
    case "fbx":
      return FBXLoader
    default:
      throw new Error("Unsupported file type")
  }
}

export function ModelMesh({ url, color, opacity, position, onLoad }: ModelMeshProps) {
  const meshRef = useRef<THREE.Group>(null)
  const ext = getFileExtension(url)
  const model = useLoader(getLoader(ext), url)

  useEffect(() => {
    if (meshRef.current && model) {
      // Apply color and opacity to all meshes
      meshRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: opacity < 1,
            opacity: opacity,
            side: THREE.DoubleSide,
            roughness: 0.7,
            metalness: 0.2,
          })
        }
      })

      // Center the model
      const box = new THREE.Box3().setFromObject(meshRef.current)
      const center = box.getCenter(new THREE.Vector3())
      meshRef.current.position.sub(center)

      if (onLoad) {
        onLoad(meshRef.current)
      }
    }
  }, [model, color, opacity, onLoad])

  if (!model) {
    // Fallback: render a simple cube as placeholder
    return (
      <mesh position={position}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
    )
  }

  return <primitive ref={meshRef} object={model.clone()} position={position} />
}
