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
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null)
  const [isARActive, setIsARActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkARSupport = async () => {
      try {
        if (typeof navigator === "undefined" || !("xr" in navigator)) {
          setIsARSupported(false)
          return
        }

        // @ts-ignore - WebXR types may not be available
        const xr = navigator.xr
        if (!xr || typeof xr.isSessionSupported !== "function") {
          setIsARSupported(false)
          return
        }

        // Try to check AR support with error handling
        const supported = await xr.isSessionSupported("immersive-ar")
        setIsARSupported(supported)
      } catch (error) {
        // If permissions policy blocks WebXR, just show as not supported
        console.log("[v0] WebXR not available (likely due to permissions policy)")
        setIsARSupported(false)
      }
    }

    checkARSupport()
  }, [])

  const startARSession = async () => {
    if (!isARSupported) {
      setErrorMessage("AR не поддерживается на этом устройстве")
      return
    }

    try {
      // @ts-ignore
      const session = await navigator.xr.requestSession("immersive-ar", {
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
      setErrorMessage("Не удалось запустить AR режим. Используйте совместимое мобильное устройство.")
    }
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
        {isARSupported === null ? (
          <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground">Проверка поддержки AR...</div>
        ) : isARSupported ? (
          <Button onClick={startARSession} disabled={isARActive} size="lg" className="shadow-lg">
            {isARActive ? "AR Активен" : "Запустить AR"}
          </Button>
        ) : (
          <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground">
            AR режим доступен только на мобильных устройствах с поддержкой WebXR
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-lg bg-destructive/90 px-6 py-3 text-sm text-destructive-foreground">
          {errorMessage}
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 1.6, 3], fov: 75 }} gl={{ alpha: true }} className="h-full w-full">
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <hemisphereLight intensity={0.5} />

        {/* Model */}
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

        {/* Grid for reference */}
        {!isARActive && <Grid args={[20, 20]} cellColor="#6b7280" sectionColor="#3b82f6" />}

        {/* Controls (only in non-AR mode) */}
        {!isARActive && <OrbitControls makeDefault />}
      </Canvas>
    </div>
  )
}
