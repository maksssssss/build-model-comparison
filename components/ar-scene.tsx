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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [usdzUrl, setUsdzUrl] = useState<string | null>(null)

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent
      const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      setIsIOS(iOS)

      if (iOS) {
        // iOS supports AR through Quick Look
        setIsARSupported(true)
      } else {
        // Check WebXR support for Android
        checkWebXRSupport()
      }
    }

    const checkWebXRSupport = async () => {
      try {
        if (typeof navigator === "undefined" || !("xr" in navigator)) {
          setIsARSupported(false)
          return
        }

        const xr = navigator.xr as any
        if (!xr || typeof xr.isSessionSupported !== "function") {
          setIsARSupported(false)
          return
        }

        const supported = await xr.isSessionSupported("immersive-ar")
        setIsARSupported(supported)
      } catch (error) {
        console.log("[v0] WebXR not available")
        setIsARSupported(false)
      }
    }

    checkDevice()
  }, [])

  useEffect(() => {
    if (isIOS && bimFile) {
      // For MVP, we'll use a placeholder USDZ conversion
      // In production, you'd convert OBJ/IFC to USDZ on the server
      console.log("[v0] iOS detected - Quick Look AR will be used")
      // Placeholder: in real app, convert model to USDZ format
      setUsdzUrl(URL.createObjectURL(bimFile))
    }
  }, [isIOS, bimFile])

  const startARSession = async () => {
    if (!isARSupported) {
      setErrorMessage("AR не поддерживается на этом устройстве")
      return
    }

    if (isIOS) {
      setErrorMessage("Используйте кнопку 'Открыть в AR' ниже для запуска Quick Look AR")
      return
    }

    // Android WebXR flow
    try {
      const xr = navigator.xr as any
      const session = await xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
      })
      setIsARActive(true)
      setErrorMessage(null)

      session.addEventListener("end", () => {
        setIsARActive(false)
      })
    } catch (error) {
      console.error("[v0] Failed to start AR session:", error)
      setErrorMessage("Не удалось запустить AR режим")
    }
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 flex flex-col gap-2 items-center">
        {isARSupported === null ? (
          <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground">Проверка поддержки AR...</div>
        ) : isARSupported ? (
          <>
            {isIOS ? (
              <div className="flex flex-col gap-2 items-center">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm text-green-700">
                  iPhone AR поддерживается через Quick Look
                </div>
                <a
                  href={usdzUrl || "#"}
                  rel="ar"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
                >
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'%3E%3C/path%3E%3C/svg%3E"
                    alt="AR"
                    className="mr-2 h-5 w-5"
                  />
                  Открыть в AR (Quick Look)
                </a>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  Нажмите кнопку, чтобы открыть модель в нативном AR режиме iOS
                </p>
              </div>
            ) : (
              <Button onClick={startARSession} disabled={isARActive} size="lg" className="shadow-lg">
                {isARActive ? "AR Активен" : "Запустить AR (WebXR)"}
              </Button>
            )}
          </>
        ) : (
          <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground">
            AR режим доступен только на мобильных устройствах iOS или Android с ARCore
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="absolute left-1/2 top-32 z-10 -translate-x-1/2 max-w-sm rounded-lg bg-blue-500/90 px-6 py-3 text-sm text-white text-center">
          {errorMessage}
        </div>
      )}

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
