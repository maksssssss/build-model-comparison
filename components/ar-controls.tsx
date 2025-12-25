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
  ChevronDown,
  ChevronUp,
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
  const [isCollapsed, setIsCollapsed] = useState(false)
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
    <Card className="absolute right-4 top-4 z-20 w-72 border-border bg-card/95 p-3 shadow-lg backdrop-blur">
      {/* Header with collapse button */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Контроллы</span>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Mode Selector */}
          <div className="mb-3 flex gap-1">
            <Button
              size="sm"
              variant={controlMode === "position" ? "default" : "outline"}
              className="flex-1 text-xs h-8"
              onClick={() => setControlMode("position")}
            >
              <Move className="mr-1 h-3 w-3" />
              Позиция
            </Button>
            <Button
              size="sm"
              variant={controlMode === "rotation" ? "default" : "outline"}
              className="flex-1 text-xs h-8"
              onClick={() => setControlMode("rotation")}
            >
              <RotateCw className="mr-1 h-3 w-3" />
              Поворот
            </Button>
            <Button
              size="sm"
              variant={controlMode === "scale" ? "default" : "outline"}
              className="flex-1 text-xs h-8"
              onClick={() => setControlMode("scale")}
            >
              <ZoomIn className="mr-1 h-3 w-3" />
              Масштаб
            </Button>
          </div>

          {/* Position Controls */}
          {controlMode === "position" && (
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Перемещение</p>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-transparent"
                    onClick={() => handlePositionMove("x", -moveStep)}
                  >
                    <ArrowLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-transparent"
                    onClick={() => handlePositionMove("z", -moveStep)}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-transparent"
                    onClick={() => handlePositionMove("x", moveStep)}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <div />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-transparent"
                    onClick={() => handlePositionMove("z", moveStep)}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <div />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Высота: {position[1].toFixed(1)}м</p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 bg-transparent"
                    onClick={() => handlePositionMove("y", -moveStep)}
                  >
                    Ниже
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 bg-transparent"
                    onClick={() => handlePositionMove("y", moveStep)}
                  >
                    Выше
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rotation Controls */}
          {controlMode === "rotation" && (
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Поворот</p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 bg-transparent"
                    onClick={() => handleRotationChange("y", -rotateStep)}
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Влево
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 bg-transparent"
                    onClick={() => handleRotationChange("y", rotateStep)}
                  >
                    <RotateCw className="mr-1 h-3 w-3" />
                    Вправо
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Наклон</p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 bg-transparent"
                    onClick={() => handleRotationChange("x", -rotateStep)}
                  >
                    Назад
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 bg-transparent"
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
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Масштаб: {scale.toFixed(1)}x</p>
                <Slider
                  value={[scale]}
                  onValueChange={([value]) => onScaleChange(value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="mb-2"
                />
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-8 bg-transparent"
                  onClick={() => onScaleChange(Math.max(0.1, scale - 0.1))}
                >
                  <Minimize className="mr-1 h-3 w-3" />
                  Меньше
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-8 bg-transparent"
                  onClick={() => onScaleChange(Math.min(5, scale + 0.1))}
                >
                  <Maximize className="mr-1 h-3 w-3" />
                  Больше
                </Button>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <Button variant="ghost" size="sm" className="mt-3 w-full text-xs h-8" onClick={onReset}>
            Сбросить
          </Button>
        </>
      )}
    </Card>
  )
}
