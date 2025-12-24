import type { DeviationAnalysis } from "./model-comparison"

export function generateTextReport(analysis: DeviationAnalysis, bimFileName: string, scanFileName: string): string {
  const { statistics } = analysis
  const date = new Date().toLocaleString("ru-RU")

  return `
ОТЧЕТ СРАВНЕНИЯ BIM-МОДЕЛИ И 3D-СКАНА
========================================

Дата создания: ${date}
BIM-модель: ${bimFileName}
3D-скан: ${scanFileName}

СТАТИСТИКА ОТКЛОНЕНИЙ
---------------------
Всего точек анализа: ${statistics.totalPoints}
Средне отклонение: ${(statistics.averageDeviation * 1000).toFixed(1)} мм
Максимальное отклонение: ${(statistics.maxDeviation * 1000).toFixed(1)} мм
Минимальное отклонение: ${(statistics.minDeviation * 1000).toFixed(1)} мм

КЛАССИФИКАЦИЯ ОТКЛОНЕНИЙ
------------------------
✓ Норма (< 10 мм): ${statistics.normalCount} точек (${((statistics.normalCount / statistics.totalPoints) * 100).toFixed(1)}%)
⚠ Внимание (10-30 мм): ${statistics.warningCount} точек (${((statistics.warningCount / statistics.totalPoints) * 100).toFixed(1)}%)
✗ Критично (> 30 мм): ${statistics.criticalCount} точек (${((statistics.criticalCount / statistics.totalPoints) * 100).toFixed(1)}%)

ДЕТАЛЬНЫЕ ДАННЫЕ
----------------
${analysis.points
  .slice(0, 100)
  .map(
    (p, i) =>
      `Точка ${i + 1}: Позиция (${p.position.x.toFixed(2)}, ${p.position.y.toFixed(2)}, ${p.position.z.toFixed(2)}) - Отклонение: ${(p.deviation * 1000).toFixed(1)} мм`,
  )
  .join("\n")}
${analysis.points.length > 100 ? `\n... и еще ${analysis.points.length - 100} точек` : ""}

========================================
Отчет создан системой BIM Compare
  `
}

export function exportToJSON(analysis: DeviationAnalysis, bimFileName: string, scanFileName: string): void {
  const report = {
    metadata: {
      date: new Date().toISOString(),
      bimFile: bimFileName,
      scanFile: scanFileName,
      version: "1.0",
    },
    statistics: analysis.statistics,
    points: analysis.points.map((p) => ({
      position: { x: p.position.x, y: p.position.y, z: p.position.z },
      deviation: p.deviation,
      deviationMM: p.deviation * 1000,
      severity: p.severity,
    })),
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `bim-comparison-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(analysis: DeviationAnalysis, bimFileName: string, scanFileName: string): void {
  const rows = [
    ["BIM Compare - Отчет сравнения"],
    ["Дата", new Date().toLocaleString("ru-RU")],
    ["BIM-модель", bimFileName],
    ["3D-скан", scanFileName],
    [],
    ["СТАТИСТИКА"],
    ["Всего точек", analysis.statistics.totalPoints.toString()],
    ["Среднее отклонение (мм)", (analysis.statistics.averageDeviation * 1000).toFixed(1)],
    ["Максимальное отклонение (мм)", (analysis.statistics.maxDeviation * 1000).toFixed(1)],
    ["Минимальное отклонение (мм)", (analysis.statistics.minDeviation * 1000).toFixed(1)],
    ["Норма (< 10 мм)", analysis.statistics.normalCount.toString()],
    ["Внимание (10-30 мм)", analysis.statistics.warningCount.toString()],
    ["Критично (> 30 мм)", analysis.statistics.criticalCount.toString()],
    [],
    ["ДЕТАЛЬНЫЕ ДАННЫЕ"],
    ["№", "X", "Y", "Z", "Отклонение (м)", "Отклонение (мм)", "Критичность"],
    ...analysis.points.map((p, i) => [
      (i + 1).toString(),
      p.position.x.toFixed(3),
      p.position.y.toFixed(3),
      p.position.z.toFixed(3),
      p.deviation.toFixed(4),
      (p.deviation * 1000).toFixed(1),
      p.severity,
    ]),
  ]

  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `bim-comparison-report-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToTXT(analysis: DeviationAnalysis, bimFileName: string, scanFileName: string): void {
  const report = generateTextReport(analysis, bimFileName, scanFileName)
  const blob = new Blob([report], { type: "text/plain;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `bim-comparison-report-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export async function captureScreenshot(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        resolve(url)
      }
    })
  })
}
