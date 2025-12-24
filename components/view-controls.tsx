"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Layers, Box, Circle } from "lucide-react"

interface ViewControlsProps {
  bimOpacity: number
  scanOpacity: number
  onBimOpacityChange: (value: number) => void
  onScanOpacityChange: (value: number) => void
  bimRenderMode: "solid" | "wireframe" | "points"
  scanRenderMode: "solid" | "wireframe" | "points"
  onBimRenderModeChange: (mode: "solid" | "wireframe" | "points") => void
  onScanRenderModeChange: (mode: "solid" | "wireframe" | "points") => void
}

export function ViewControls({
  bimOpacity,
  scanOpacity,
  onBimOpacityChange,
  onScanOpacityChange,
  bimRenderMode,
  scanRenderMode,
  onBimRenderModeChange,
  onScanRenderModeChange,
}: ViewControlsProps) {
  return (
    <Card className="absolute left-4 top-4 w-80 p-4 shadow-lg">
      <h3 className="mb-4 font-semibold text-foreground">Управление видом</h3>

      {/* BIM Model Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">BIM-модель</Label>
          <div className="flex items-center gap-1">
            <Button
              variant={bimRenderMode === "solid" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onBimRenderModeChange("solid")}
              title="Заливка"
            >
              <Box className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={bimRenderMode === "wireframe" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onBimRenderModeChange("wireframe")}
              title="Каркас"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={bimRenderMode === "points" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onBimRenderModeChange("points")}
              title="Точки"
            >
              <Circle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Прозрачность</Label>
            <span className="text-xs font-medium text-foreground">{Math.round(bimOpacity * 100)}%</span>
          </div>
          <Slider
            value={[bimOpacity * 100]}
            onValueChange={(values) => onBimOpacityChange(values[0] / 100)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Scan Model Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">3D-скан</Label>
          <div className="flex items-center gap-1">
            <Button
              variant={scanRenderMode === "solid" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onScanRenderModeChange("solid")}
              title="Заливка"
            >
              <Box className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={scanRenderMode === "wireframe" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onScanRenderModeChange("wireframe")}
              title="Каркас"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={scanRenderMode === "points" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onScanRenderModeChange("points")}
              title="Точки"
            >
              <Circle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Прозрачность</Label>
            <span className="text-xs font-medium text-foreground">{Math.round(scanOpacity * 100)}%</span>
          </div>
          <Slider
            value={[scanOpacity * 100]}
            onValueChange={(values) => onScanOpacityChange(values[0] / 100)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  )
}
