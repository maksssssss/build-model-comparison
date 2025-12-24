"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ruler, X, Trash2 } from "lucide-react"
import type * as THREE from "three"

interface Measurement {
  id: string
  start: THREE.Vector3
  end: THREE.Vector3
  distance: number
}

interface MeasurementToolProps {
  measurements: Measurement[]
  onClearMeasurements: () => void
  onDeleteMeasurement: (id: string) => void
}

export function MeasurementTool({ measurements, onClearMeasurements, onDeleteMeasurement }: MeasurementToolProps) {
  if (measurements.length === 0) return null

  return (
    <Card className="absolute right-4 top-4 w-72 p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Измерения</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearMeasurements} title="Очистить все">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-2">
        {measurements.map((measurement, index) => (
          <div
            key={measurement.id}
            className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-2"
          >
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Измерение {index + 1}</p>
              <p className="text-lg font-bold text-primary">{(measurement.distance * 1000).toFixed(1)} мм</p>
              <p className="text-xs text-muted-foreground">{measurement.distance.toFixed(3)} м</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDeleteMeasurement(measurement.id)}
              title="Удалить"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-md bg-muted/30 p-2">
        <p className="text-xs text-muted-foreground">Кликните по модели дважды, чтобы измерить расстояние</p>
      </div>
    </Card>
  )
}
