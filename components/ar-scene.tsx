"use client"

import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { LoadedARModel } from "./loaded-ar-model"
import { OrbitControls, Grid } from "@react-three/drei"
import { Camera, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ARSceneProps {
  bimFile: File
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onModelTransform: (position: [number, number, number], rotation: [number, number, number], scale: number) => void
}

export function ARScene({ bimFile, position, rotation, scale, onModelTransform }: ARSceneProps) {
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop")
  const [modelUrl, setModelUrl] = useState<string>("")
  const [isARFile, setIsARFile] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS) {
      setDeviceType("ios")
    } else if (isAndroid) {
      setDeviceType("android")
    } else {
      setDeviceType("desktop")
    }

    const fileExt = bimFile.name.split(".").pop()?.toLowerCase()
    if (fileExt === "usdz" || fileExt === "glb" || fileExt === "gltf") {
      setIsARFile(true)
      const url = URL.createObjectURL(bimFile)
      setModelUrl(url)
    } else {
      setIsARFile(false)
    }

    return () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl)
      }
    }
  }, [bimFile])

  if (deviceType === "ios" && isARFile && bimFile.name.endsWith(".usdz")) {
    return (
      <div className="relative h-full w-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-100 p-6">
              <Camera className="h-16 w-16 text-blue-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">AR Ready!</h2>
          <p className="text-gray-600 mb-6">Нажмите кнопку ниже чтобы открыть модель в режиме дополненной реальности</p>

          <a
            href={modelUrl}
            rel="ar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Camera className="h-5 w-5" />
            Открыть в AR
            <ExternalLink className="h-4 w-4" />
          </a>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600">
              <strong>Инструкция:</strong> После нажатия кнопки, наведите камеру на пол или горизонтальную поверхность.
              Появится индикатор, где вы можете разместить модель.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (deviceType === "android" && isARFile && (bimFile.name.endsWith(".glb") || bimFile.name.endsWith(".gltf"))) {
    return (
      <div className="relative h-full w-full">
        <model-viewer
          src={modelUrl}
          ar
          ar-modes="scene-viewer webxr quick-look"
          camera-controls
          shadow-intensity="1"
          style={{ width: "100%", height: "100%" }}
        >
          <button
            slot="ar-button"
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Camera className="h-5 w-5" />
            Активировать AR
          </button>
        </model-viewer>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-md px-4">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-700 text-center backdrop-blur-sm">
            <div className="font-semibold mb-1">AR режим доступен</div>
            <p className="text-xs">Нажмите кнопку "Активировать AR" для запуска камеры</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isARFile) {
    return (
      <div className="relative h-full w-full">
        <div className="absolute left-4 top-4 z-10 max-w-xs">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800 text-xs">
              <strong>Формат не поддерживает AR:</strong> Для iOS требуется USDZ, для Android - GLB/GLTF. Используйте
              режим preview для ручного выравнивания.
            </AlertDescription>
          </Alert>
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

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-10 max-w-xs">
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-700 backdrop-blur-sm">
          <div className="font-semibold mb-0.5">AR Preview Режим</div>
          <p className="text-xs">Используйте контроллы для выравнивания</p>
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
