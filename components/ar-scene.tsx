"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState, useEffect } from "react"
import { LoadedARModel } from "./loaded-ar-model"
import { OrbitControls, Grid } from "@react-three/drei"
import { Button } from "./ui/button"

interface ARSceneProps {
  bimFile: File
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onModelTransform: (position: [number, number, number], rotation: [number, number, number], scale: number) => void
}

export function ARScene({ bimFile, position, rotation, scale, onModelTransform }: ARSceneProps) {
  const [isIOS, setIsIOS] = useState(false)
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null)
  const [isARActive, setIsARActive] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState("")

  useEffect(() => {
    const ua = navigator.userAgent
    const platform = navigator.platform
    const maxTouchPoints = navigator.maxTouchPoints

    // Проверяем различными способами
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua)
    const isSafariOnMac = platform === "MacIntel" && maxTouchPoints > 1
    const isMobileSafari = /Safari/.test(ua) && /Mobile/.test(ua)
    const hasApplePlatform = /iPhone|iPad|iPod/.test(platform)

    const iOS = isAppleDevice || isSafariOnMac || hasApplePlatform

    const info = `UA: ${ua.substring(0, 50)}..., Platform: ${platform}, Touch: ${maxTouchPoints}, iOS: ${iOS}`
    console.log("[v0] Device detection:", info)
    setDeviceInfo(info)
    setIsIOS(iOS)

    if (iOS) {
      console.log("[v0] iOS device confirmed - enabling Quick Look AR")
      setIsARSupported(true)
    } else {
      console.log("[v0] Non-iOS device - checking WebXR")
      checkWebXRSupport()
    }
  }, [])

  const checkWebXRSupport = async () => {
    try {
      if (typeof navigator === "undefined" || !("xr" in navigator)) {
        console.log("[v0] WebXR API not found in navigator")
        setIsARSupported(false)
        return
      }

      const xr = navigator.xr as any
      if (!xr || typeof xr.isSessionSupported !== "function") {
        console.log("[v0] WebXR isSessionSupported method not available")
        setIsARSupported(false)
        return
      }

      const supported = await xr.isSessionSupported("immersive-ar")
      console.log("[v0] WebXR immersive-ar supported:", supported)
      setIsARSupported(supported)
    } catch (error) {
      console.log("[v0] WebXR support check error:", error)
      setIsARSupported(false)
    }
  }

  const openIOSAR = () => {
    alert(
      "iOS AR готов к работе!\n\n" +
        "Текущий режим: preview с ручным выравниванием\n\n" +
        "Для полного AR опыта:\n" +
        "1. Конвертируйте BIM в USDZ через Reality Converter\n" +
        "2. Загрузите USDZ файл\n" +
        "3. Quick Look AR откроется автоматически",
    )
  }

  const startARSession = async () => {
    console.log("[v0] Starting AR session, isIOS:", isIOS, "isARSupported:", isARSupported)

    if (!isARSupported) {
      alert("AR не поддерживается на этом устройстве")
      return
    }

    if (isIOS) {
      openIOSAR()
      return
    }

    // Android WebXR flow
    try {
      console.log("[v0] Requesting WebXR immersive-ar session")
      const xr = navigator.xr as any
      const session = await xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
      })
      console.log("[v0] WebXR session started successfully")
      setIsARActive(true)

      session.addEventListener("end", () => {
        console.log("[v0] WebXR session ended")
        setIsARActive(false)
      })
    } catch (error) {
      console.error("[v0] Failed to start AR session:", error)
      alert("Не удалось запустить AR режим: " + (error as Error).message)
    }
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 flex flex-col gap-2 items-center">
        {isARSupported === null ? (
          <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground">Проверка поддержки AR...</div>
        ) : isARSupported ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm text-green-700 text-center max-w-md">
              {isIOS ? "✓ iPhone/iPad AR доступен" : "✓ Android AR доступен"}
            </div>
            <Button onClick={startARSession} size="lg" className="shadow-lg">
              {isIOS ? "Открыть в AR" : isARActive ? "AR Активен" : "Запустить AR"}
            </Button>
            <p className="text-xs text-muted-foreground max-w-xs text-center px-4">
              {isIOS ? "Используйте контроллы ниже для выравнивания модели" : "Нажмите для входа в AR режим"}
            </p>
            <details className="text-xs text-muted-foreground max-w-md">
              <summary className="cursor-pointer">Показать диагностику</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto">{deviceInfo}</pre>
            </details>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center max-w-md">
            <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground text-center">
              AR не поддерживается на этом устройстве
            </div>
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Показать диагностику</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto">{deviceInfo}</pre>
            </details>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
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
            isARActive={isARActive}
          />
        </Suspense>

        {!isARActive && <Grid args={[20, 20]} cellColor="#6b7280" sectionColor="#3b82f6" />}
        {!isARActive && <OrbitControls makeDefault />}
      </Canvas>
    </div>
  )
}
