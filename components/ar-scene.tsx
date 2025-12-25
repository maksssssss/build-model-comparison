"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { LoadedARModel } from "./loaded-ar-model"
import { OrbitControls, Grid } from "@react-three/drei"

interface ARSceneProps {
  bimFile: File
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onModelTransform: (position: [number, number, number], rotation: [number, number, number], scale: number) => void
}

export function ARScene({ bimFile, position, rotation, scale, onModelTransform }: ARSceneProps) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 max-w-md px-4">
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-700 text-center backdrop-blur-sm">
          <div className="font-semibold mb-1">AR Preview Режим</div>
          <p className="text-xs">Используйте контроллы ниже для ручного выравнивания модели</p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 1.6, 3], fov: 75 }} gl={{ alpha: true }} className="h-full w-full">
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <hemisphereLight intensity={0.5} />

        <Suspense fallback={null}>
          <LoadedARModel
            file={bimFile}
            position={position}
            rotation={rotation}
            scale={scale}
            onTransform={onModelTransform}
            isARActive={false}
          />
        </Suspense>

        <Grid args={[20, 20]} cellColor="#6b7280" sectionColor="#3b82f6" />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
