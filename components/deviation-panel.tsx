"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import type { DeviationAnalysis } from "@/lib/model-comparison"
import { ExportPanel } from "./export-panel"

interface DeviationPanelProps {
  data: DeviationAnalysis
  bimFileName?: string
  scanFileName?: string
}

export function DeviationPanel({ data, bimFileName = "model.ifc", scanFileName = "scan.ply" }: DeviationPanelProps) {
  const { statistics, elements } = data

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle2 className="h-4 w-4 text-chart-3" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-chart-5" />
      case "critical":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-chart-3/10 text-chart-3"
      case "warning":
        return "bg-chart-5/10 text-chart-5"
      case "critical":
        return "bg-destructive/10 text-destructive"
      default:
        return ""
    }
  }

  return (
    <div className="w-96 border-l border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Обнаруженные отклонения</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Анализ завершен: {statistics.totalPoints.toLocaleString()} точек проверено
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 border-b border-border p-4">
          <Card className="p-3">
            <div className="mb-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-chart-3" />
              <span className="text-xs font-medium text-muted-foreground">Норма</span>
            </div>
            <p className="text-lg font-bold text-chart-3">{statistics.okCount.toLocaleString()}</p>
          </Card>
          <Card className="p-3">
            <div className="mb-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-chart-5" />
              <span className="text-xs font-medium text-muted-foreground">Внимание</span>
            </div>
            <p className="text-lg font-bold text-chart-5">{statistics.warningCount.toLocaleString()}</p>
          </Card>
          <Card className="p-3">
            <div className="mb-1 flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" />
              <span className="text-xs font-medium text-muted-foreground">Критично</span>
            </div>
            <p className="text-lg font-bold text-destructive">{statistics.criticalCount.toLocaleString()}</p>
          </Card>
        </div>

        {/* Summary Statistics */}
        <div className="border-b border-border p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Среднее отклонение:</span>
              <span className="font-semibold text-foreground">{statistics.avgDeviation.toFixed(1)} мм</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Максимальное:</span>
              <span className="font-semibold text-destructive">{statistics.maxDeviation.toFixed(1)} мм</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Минимальное:</span>
              <span className="font-semibold text-chart-3">{statistics.minDeviation.toFixed(1)} мм</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-b border-border p-4">
          <p className="mb-2 text-xs font-semibold text-foreground">Цветовая шкала:</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-chart-3" />
              <span className="text-xs text-muted-foreground">{"<"} 10 мм - норма</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-chart-5" />
              <span className="text-xs text-muted-foreground">10-30 мм - требует внимания</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-destructive" />
              <span className="text-xs text-muted-foreground">{">"} 30 мм - критично</span>
            </div>
          </div>
        </div>

        {/* Deviation List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {elements.map((item) => (
              <Card key={item.id} className="p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <p className="text-sm font-medium text-foreground">{item.element}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Зона: {item.zone}</p>
                  </div>
                  <div className={`rounded px-2 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                    {item.deviation.toFixed(1)} мм
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <ExportPanel analysis={data} bimFileName={bimFileName} scanFileName={scanFileName} />
        </div>
      </div>
    </div>
  )
}
