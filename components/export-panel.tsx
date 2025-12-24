"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react"
import type { DeviationAnalysis } from "@/lib/model-comparison"
import { exportToTXT, exportToCSV, exportToJSON } from "@/lib/report-export"

interface ExportPanelProps {
  analysis: DeviationAnalysis
  bimFileName: string
  scanFileName: string
}

export function ExportPanel({ analysis, bimFileName, scanFileName }: ExportPanelProps) {
  const handleExportTXT = () => {
    exportToTXT(analysis, bimFileName, scanFileName)
  }

  const handleExportCSV = () => {
    exportToCSV(analysis, bimFileName, scanFileName)
  }

  const handleExportJSON = () => {
    exportToJSON(analysis, bimFileName, scanFileName)
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Download className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">Экспорт отчета</h3>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleExportTXT}
        >
          <FileText className="h-4 w-4" />
          Текстовый отчет (.txt)
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleExportCSV}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Excel таблица (.csv)
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleExportJSON}
        >
          <FileJson className="h-4 w-4" />
          JSON данные (.json)
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Отчеты содержат полную статистику отклонений и детальные данные по всем точкам анализа
      </p>
    </Card>
  )
}
