"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Target, Plus, Trash2, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface ReferencePoint {
  id: string
  name: string
  modelPosition: [number, number, number] | null
  realPosition: [number, number, number] | null
  type: "window" | "door" | "corner" | "custom"
}

interface ReferencePointsProps {
  points: ReferencePoint[]
  onAddPoint: () => void
  onRemovePoint: (id: string) => void
  onSetModelPosition: (id: string) => void
  onSetRealPosition: (id: string, position: [number, number, number]) => void
  onAlign: () => void
  isSettingPoint: boolean
  currentPointId: string | null
  currentMode: "model" | "real" | null
}

export function ReferencePoints({
  points,
  onAddPoint,
  onRemovePoint,
  onSetModelPosition,
  onSetRealPosition,
  onAlign,
  isSettingPoint,
  currentPointId,
  currentMode,
}: ReferencePointsProps) {
  const getTypeIcon = (type: ReferencePoint["type"]) => {
    switch (type) {
      case "window":
        return "🪟"
      case "door":
        return "🚪"
      case "corner":
        return "📐"
      default:
        return "📍"
    }
  }

  const isPointComplete = (point: ReferencePoint) => point.modelPosition !== null && point.realPosition !== null

  const allPointsComplete = points.length >= 2 && points.every(isPointComplete)

  return (
    <Card className="absolute right-4 top-20 z-20 w-80 border-border bg-card/95 p-4 shadow-lg backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Опорные точки</h3>
        </div>
        <Button size="sm" variant="outline" onClick={onAddPoint} disabled={isSettingPoint}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 space-y-2">
        {points.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Добавьте минимум 2 опорные точки для выравнивания (окно, дверь, угол и т.д.)
          </p>
        ) : (
          points.map((point) => (
            <div key={point.id} className="rounded-lg border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(point.type)}</span>
                  <span className="text-sm font-medium">{point.name}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => onRemovePoint(point.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">На модели:</span>
                  {point.modelPosition ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Установлено
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-6 text-xs bg-transparent ${currentPointId === point.id && currentMode === "model" ? "border-primary text-primary" : ""}`}
                      onClick={() => onSetModelPosition(point.id)}
                      disabled={isSettingPoint && !(currentPointId === point.id && currentMode === "model")}
                    >
                      {currentPointId === point.id && currentMode === "model" ? "Выберите на модели..." : "Установить"}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">В реальности:</span>
                  {point.realPosition ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Установлено
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs bg-transparent"
                      onClick={() => onSetRealPosition(point.id, [0, 0, 0])}
                      disabled={isSettingPoint && !(currentPointId === point.id && currentMode === "real")}
                    >
                      {currentPointId === point.id && currentMode === "real" ? "Выберите..." : "Установить"}
                    </Button>
                  )}
                </div>
              </div>

              {isPointComplete(point) && (
                <Badge variant="default" className="mt-2 w-full justify-center">
                  Точка готова
                </Badge>
              )}
            </div>
          ))
        )}
      </div>

      {points.length >= 2 && (
        <Button className="w-full" disabled={!allPointsComplete} onClick={onAlign}>
          Выровнять по точкам ({points.filter(isPointComplete).length}/{points.length})
        </Button>
      )}

      {!allPointsComplete && points.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Установите обе позиции для каждой точки перед выравниванием
        </p>
      )}
    </Card>
  )
}
