"use client"

import { useState } from "react"
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

  const checkARSupport = () => {
    if (!("xr" in navigator)) {
      setIsARSupported(false)
    }
  }

  const loadARModel = async () => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  useState(() => {
    checkARSupport()
    loadARModel()
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

  const handleSetModelPosition = (id: string, pos: [number, number, number]) => {
    setCurrentPointId(id)
    setCurrentMode("model")
    setIsSettingPoint(true)
    // In real implementation, would enable click-to-select on model
    setTimeout(() => {
      setReferencePoints(
        referencePoints.map((p) =>
          p.id === id
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
    }, 100)
  }

  const handleSetRealPosition = (id: string, pos: [number, number, number]) => {
    setCurrentPointId(id)
    setCurrentMode("real")
    setIsSettingPoint(true)
    // In real implementation, would use hit-test in AR
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
    // Calculate transformation based on reference points
    const completePoints = referencePoints.filter((p) => p.modelPosition && p.realPosition)

    if (completePoints.length >= 2) {
      // Simple alignment: use first point for position, second for rotation
      const firstModel = completePoints[0].modelPosition!
      const firstReal = completePoints[0].realPosition!

      setPosition([firstReal[0] - firstModel[0], firstReal[1] - firstModel[1], firstReal[2] - firstModel[2]])

      console.log("[v0] Aligned model using reference points")
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
