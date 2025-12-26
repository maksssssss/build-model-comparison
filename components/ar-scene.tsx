"use client"

import { useEffect, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { LoadedARModel } from "./loaded-ar-model"
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei"
import { Camera, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ARControls } from "./ar-controls"

interface ARSceneProps {
  bimFile: File // Changed from Blob to File to match model-viewer pattern
}

export function ARScene({ bimFile }: ARSceneProps) {
  const [modelUrl, setModelUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState<string>("")
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2])
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0])
  const [scale, setScale] = useState(1)
  const modelViewerRef = useRef<any>(null)

  useEffect(() => {
    const fileExt = bimFile.name.split(".").pop()?.toLowerCase()

    if (fileExt === "glb" || fileExt === "gltf") {
      const url = URL.createObjectURL(bimFile)
      setModelUrl(url)
      setLoading(false)
      setArReady(true)

      return () => URL.revokeObjectURL(url)
    } else {
      setError(`Формат .${fileExt} не поддерживается для AR. Используйте GLB или GLTF`)
      setLoading(false)
    }
  }, [bimFile])

  const handleLaunchAR = () => {
    const modelViewer = modelViewerRef.current
    if (modelViewer) {
      try {
        // @ts-ignore
        modelViewer.activateAR()
      } catch (err) {
        console.error("[v0] AR activation failed:", err)
      }
    }
  }

  const handleReset = () => {
    setPosition([0, 0, -2])
    setRotation([0, 0, 0])
    setScale(1)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-white text-sm">Загрузка модели...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
          <div>
            <p className="text-white font-semibold mb-2">Ошибка загрузки</p>
            <p className="text-white/70 text-sm">{error}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
            <p className="text-white text-xs font-semibold mb-2">Поддерживаемые форматы:</p>
            <ul className="text-white/80 text-xs space-y-1">
              <li>• GLB (рекомендуется)</li>
              <li>• GLTF</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        ar
        ar-modes="scene-viewer webxr"
        camera-controls
        shadow-intensity="1"
        auto-rotate
        autoplay
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, #1a1a1a, #000000)",
        }}
      />

      {arReady && (
        <div className="absolute top-20 left-0 right-0 z-20 px-4 pointer-events-none">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">Модель готова к AR</p>
                <p className="text-white/90 text-xs">
                  Нажмите кнопку ниже чтобы открыть камеру и разместить модель в реальном мире
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {arReady && (
        <div className="absolute bottom-32 left-0 right-0 z-30 px-6 pointer-events-none">
          <Button
            size="lg"
            onClick={handleLaunchAR}
            className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-2xl pointer-events-auto active:scale-95 transition-transform"
          >
            <Camera className="mr-3 h-6 w-6" />
            Запустить AR Камеру
          </Button>
        </div>
      )}

      <ARControls
        position={position}
        rotation={rotation}
        scale={scale}
        onPositionChange={setPosition}
        onRotationChange={setRotation}
        onScaleChange={setScale}
        onReset={handleReset}
      />

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1.6, 3]} fov={75} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <hemisphereLight intensity={0.3} groundColor="#808080" color="#b8d4ff" />

        <Suspense
          fallback={
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#3b82f6" wireframe />
            </mesh>
          }
        >
          <LoadedARModel file={bimFile} position={position} rotation={rotation} scale={scale} />
        </Suspense>

        <Grid args={[20, 20]} cellColor="#6b7280" sectionColor="#3b82f6" fadeDistance={30} />
      </Canvas>
    </>
  )
}
