"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Camera } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ARScene } from "./ar-scene"
import { ARControls } from "./ar-controls"
import { ReferencePoints, type ReferencePoint } from "./reference-points"

interface ARViewerProps {
  bimFile: File
  onExit: () => void
}

export function ARViewer({ bimFile, onExit }: ARViewerProps) {
  const [isARSupported, setIsARSupported] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2])
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0])
  const [scale, setScale] = useState(1)

  const [referencePoints, setReferencePoints] = useState<ReferencePoint[]>([])
  const [isSettingPoint, setIsSettingPoint] = useState(false)
  const [currentPointId, setCurrentPointId] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState<"model" | "real" | null>(null)

  useEffect(() => {
    const checkARSupport = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)

      // iOS supports AR Quick Look, Android supports model-viewer
      if (isIOS || isAndroid) {
        setIsARSupported(true)
      } else {
        setIsARSupported(false)
      }
    }

    checkARSupport()
    setIsLoading(false)
  }, [])

  const handleReset = () => {
    setPosition([0, 0, -2])
    setRotation([0, 0, 0])
    setScale(1)
  }

  const handleAddPoint = () => {
    const id = `point-${Date.now()}`
    const newPoint: ReferencePoint = {
      id,
      name: `Точка ${referencePoints.length + 1}`,
      modelPosition: null,
      realPosition: null,
      type: "custom",
    }
    setReferencePoints([...referencePoints, newPoint])
  }

  const handleRemovePoint = (id: string) => {
    setReferencePoints(referencePoints.filter((p) => p.id !== id))
  }

  const handleSetModelPosition = (id: string) => {
    setCurrentPointId(id)
    setCurrentMode("model")
    setIsSettingPoint(true)
  }

  const handlePointSelect = (pos: [number, number, number]) => {
    if (isSettingPoint && currentPointId && currentMode === "model") {
      setReferencePoints(
        referencePoints.map((p) =>
          p.id === currentPointId
            ? {
              ...p,
              modelPosition: pos,
            }
            : p,
        ),
      )
      setIsSettingPoint(false)
      setCurrentPointId(null)
      setCurrentMode(null)
    }
  }

  const handleSetRealPosition = (id: string, pos: [number, number, number]) => {
    setCurrentPointId(id)
    setCurrentMode("real")
    setIsSettingPoint(true)
    setTimeout(() => {
      setReferencePoints(
        referencePoints.map((p) =>
          p.id === id
            ? {
              ...p,
              realPosition: pos,
            }
            : p,
        ),
      )
      setIsSettingPoint(false)
      setCurrentPointId(null)
      setCurrentMode(null)
    }, 100)
  }

  const handleAlign = () => {
    const completePoints = referencePoints.filter((p) => p.modelPosition && p.realPosition)

    if (completePoints.length >= 2) {
      const m1 = completePoints[0].modelPosition!
      const m2 = completePoints[1].modelPosition!
      const r1 = completePoints[0].realPosition!
      const r2 = completePoints[1].realPosition!

      // 1. Calculate rotation around Y axis
      // Model direction vector in XZ plane
      const dMx = m2[0] - m1[0]
      const dMz = m2[2] - m1[2]
      const angleM = Math.atan2(dMz, dMx)

      // Real direction vector in XZ plane
      const dRx = r2[0] - r1[0]
      const dRz = r2[2] - r1[2]
      const angleR = Math.atan2(dRz, dRx)

      const theta = angleR - angleM

      // 2. Apply rotation to get new orientation
      const newRotation: [number, number, number] = [0, theta, 0]

      // 3. Calculate position to match the first point
      // Rotate m1 around Y by theta
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)
      const rotatedM1x = m1[0] * cosT - m1[2] * sinT
      const rotatedM1z = m1[0] * sinT + m1[2] * cosT

      const newPosition: [number, number, number] = [
        r1[0] - rotatedM1x,
        r1[1] - m1[1], // Height alignment
        r1[2] - rotatedM1z
      ]

      setPosition(newPosition)
      setRotation(newRotation)
      setScale(1) // Keep scale for now, can be calculated from distances if needed

      console.log("[v0] Aligned model using 2-point rotation and translation")
    } else if (completePoints.length === 1) {
      const firstModel = completePoints[0].modelPosition!
      const firstReal = completePoints[0].realPosition!

      setPosition([firstReal[0] - firstModel[0], firstReal[1] - firstModel[1], firstReal[2] - firstModel[2]])
      console.log("[v0] Aligned model using 1-point translation only")
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">AR Режим</h2>
              <p className="text-xs text-muted-foreground">{bimFile.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* AR Content Area */}
      <div className="h-full w-full pt-16">
        {!isARSupported ? (
          <div className="flex h-full items-center justify-center p-4">
            <Alert>
              <AlertDescription>
                WebXR не поддерживается на этом устройстве. Используйте мобильное устройство с поддержкой AR.
              </AlertDescription>
            </Alert>
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">AR режим загружается...</h3>
              <p className="text-sm text-muted-foreground">Готовим камеру и модель</p>
            </div>
          </div>
        ) : (
          <>
            <ARScene
              bimFile={bimFile}
              position={position}
              rotation={rotation}
              scale={scale}
              onModelTransform={(pos, rot, s) => {
                setPosition(pos)
                setRotation(rot)
                setScale(s)
              }}
              onPointSelect={handlePointSelect}
              referencePoints={referencePoints}
            />
            <ARControls
              position={position}
              rotation={rotation}
              scale={scale}
              onPositionChange={setPosition}
              onRotationChange={setRotation}
              onScaleChange={setScale}
              onReset={handleReset}
            />
            <ReferencePoints
              points={referencePoints}
              onAddPoint={handleAddPoint}
              onRemovePoint={handleRemovePoint}
              onSetModelPosition={handleSetModelPosition}
              onSetRealPosition={handleSetRealPosition}
              onAlign={handleAlign}
              isSettingPoint={isSettingPoint}
              currentPointId={currentPointId}
              currentMode={currentMode}
            />
          </>
        )}
      </div>
    </div>
  )
}
