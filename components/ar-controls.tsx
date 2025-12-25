"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Move,
  RotateCw,
  ZoomIn,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
} from "lucide-react"

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
  const [controlMode, setControlMode] = useState<"position" | "rotation" | "scale">("position")
  const moveStep = 0.1
  const rotateStep = Math.PI / 36 // 5 degrees

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
    <Card className="absolute bottom-4 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 border-border bg-card/95 p-4 shadow-lg backdrop-blur">
      {/* Mode Selector */}
      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant={controlMode === "position" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setControlMode("position")}
        >
          <Move className="mr-2 h-4 w-4" />
          Позиция
        </Button>
        <Button
          size="sm"
          variant={controlMode === "rotation" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setControlMode("rotation")}
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Поворот
        </Button>
        <Button
          size="sm"
          variant={controlMode === "scale" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setControlMode("scale")}
        >
          <ZoomIn className="mr-2 h-4 w-4" />
          Масштаб
        </Button>
      </div>

      {/* Position Controls */}
      {controlMode === "position" && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Горизонтальное перемещение</p>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" onClick={() => handlePositionMove("x", -moveStep)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePositionMove("z", -moveStep)}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePositionMove("x", moveStep)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div />
              <Button size="sm" variant="outline" onClick={() => handlePositionMove("z", moveStep)}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <div />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Высота: {position[1].toFixed(2)}м</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handlePositionMove("y", -moveStep)}
              >
                <ArrowDown className="mr-1 h-4 w-4" />
                Ниже
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handlePositionMove("y", moveStep)}
              >
                <ArrowUp className="mr-1 h-4 w-4" />
                Выше
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rotation Controls */}
      {controlMode === "rotation" && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Поворот по оси Y (влево/вправо)</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleRotationChange("y", -rotateStep)}
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Влево
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleRotationChange("y", rotateStep)}
              >
                <RotateCw className="mr-1 h-4 w-4" />
                Вправо
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Наклон</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleRotationChange("x", -rotateStep)}
              >
                Назад
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleRotationChange("x", rotateStep)}
              >
                Вперед
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scale Controls */}
      {controlMode === "scale" && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Масштаб: {scale.toFixed(2)}x</p>
            <Slider
              value={[scale]}
              onValueChange={([value]) => onScaleChange(value)}
              min={0.1}
              max={5}
              step={0.1}
              className="mb-4"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onScaleChange(Math.max(0.1, scale - 0.1))}
            >
              <Minimize className="mr-1 h-4 w-4" />
              Меньше
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onScaleChange(Math.min(5, scale + 0.1))}
            >
              <Maximize className="mr-1 h-4 w-4" />
              Больше
            </Button>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={onReset}>
        Сбросить выравнивание
      </Button>
    </Card>
  )
}
