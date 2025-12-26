"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Move, RotateCw, ZoomIn, RotateCcw, Maximize, Minimize, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"

interface ARControlsProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onPositionChange: (position: [number, number, number]) => void
  onRotationChange: (rotation: [number, number, number]) => void
  onScaleChange: (scale: number) => void
  onReset: () => void
}

export function ARControls({
  position,
  rotation,
  scale,
  onPositionChange,
  onRotationChange,
  onScaleChange,
  onReset,
}: ARControlsProps) {
  const [controlMode, setControlMode] = useState<"position" | "rotation" | "scale">("scale")
  const [isExpanded, setIsExpanded] = useState(false)
  const moveStep = 0.1
  const rotateStep = Math.PI / 36

  const handlePositionMove = (axis: "x" | "y" | "z", delta: number) => {
    const newPosition: [number, number, number] = [...position]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newPosition[axisIndex] += delta
    onPositionChange(newPosition)
  }

  const handleRotationChange = (axis: "x" | "y" | "z", delta: number) => {
    const newRotation: [number, number, number] = [...rotation]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newRotation[axisIndex] += delta
    onRotationChange(newRotation)
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-20 rounded-t-3xl rounded-b-none border-t-2 border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl safe-bottom">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full transition-colors ${
              controlMode === "position" ? "bg-blue-500" : controlMode === "rotation" ? "bg-green-500" : "bg-orange-500"
            }`}
          />
          <span className="text-sm font-bold text-white">
            {controlMode === "position" ? "Позиция" : controlMode === "rotation" ? "Поворот" : "Масштаб"}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>

      <div className="px-3 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant={controlMode === "position" ? "default" : "outline"}
            className={`h-12 text-xs font-bold ${
              controlMode === "position"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-white/10 text-white hover:bg-white/20 border-white/20"
            }`}
            onClick={() => setControlMode("position")}
          >
            <Move className="mr-1.5 h-4 w-4" />
            Позиция
          </Button>
          <Button
            size="sm"
            variant={controlMode === "rotation" ? "default" : "outline"}
            className={`h-12 text-xs font-bold ${
              controlMode === "rotation"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-white/10 text-white hover:bg-white/20 border-white/20"
            }`}
            onClick={() => setControlMode("rotation")}
          >
            <RotateCw className="mr-1.5 h-4 w-4" />
            Поворот
          </Button>
          <Button
            size="sm"
            variant={controlMode === "scale" ? "default" : "outline"}
            className={`h-12 text-xs font-bold ${
              controlMode === "scale"
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-white/10 text-white hover:bg-white/20 border-white/20"
            }`}
            onClick={() => setControlMode("scale")}
          >
            <ZoomIn className="mr-1.5 h-4 w-4" />
            Масштаб
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-4">
          {controlMode === "scale" && (
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-sm font-semibold text-white">Размер: {scale.toFixed(1)}x</p>
                <Slider
                  value={[scale]}
                  onValueChange={([value]) => onScaleChange(value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="mb-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-12 text-sm bg-white/10 text-white hover:bg-white/20 border-white/20"
                  onClick={() => onScaleChange(Math.max(0.1, scale - 0.2))}
                >
                  <Minimize className="mr-2 h-4 w-4" />
                  Меньше
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-12 text-sm bg-white/10 text-white hover:bg-white/20 border-white/20"
                  onClick={() => onScaleChange(Math.min(5, scale + 0.2))}
                >
                  <Maximize className="mr-2 h-4 w-4" />
                  Больше
                </Button>
              </div>
            </div>
          )}

          {controlMode === "rotation" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white mb-2">Вращение модели</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-12 text-sm bg-white/10 text-white hover:bg-white/20 border-white/20"
                  onClick={() => handleRotationChange("y", -rotateStep * 2)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Влево
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-12 text-sm bg-white/10 text-white hover:bg-white/20 border-white/20"
                  onClick={() => handleRotationChange("y", rotateStep * 2)}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Вправо
                </Button>
              </div>
            </div>
          )}

          {controlMode === "position" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white mb-2">Перемещение</p>
              <p className="text-xs text-white/60 mb-3">Доступно после запуска AR камеры</p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full h-11 text-sm font-semibold bg-white/10 text-white hover:bg-white/20 border-white/20"
            onClick={onReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Сбросить настройки
          </Button>
        </div>
      )}
    </Card>
  )
}
