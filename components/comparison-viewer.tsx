"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, EyeOff, Grid3x3, BarChart3, Ruler, Crosshair } from "lucide-react"
import { useState } from "react"
import { ModelViewer } from "./model-viewer"
import { DeviationPanel } from "./deviation-panel"
import { ViewControls } from "./view-controls"
import { MeasurementTool } from "./measurement-tool"
import type { DeviationAnalysis } from "@/lib/model-comparison"
import type * as THREE from "three"

interface Measurement {
  id: string
  start: THREE.Vector3
  end: THREE.Vector3
  distance: number
}

interface ComparisonViewerProps {
  bimFile: File
  scanFile: File
  onReset: () => void
}

export function ComparisonViewer({ bimFile, scanFile, onReset }: ComparisonViewerProps) {
  const [showBim, setShowBim] = useState(true)
  const [showScan, setShowScan] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showDeviations, setShowDeviations] = useState(false)
  const [deviationData, setDeviationData] = useState<DeviationAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [bimOpacity, setBimOpacity] = useState(0.75)
  const [scanOpacity, setScanOpacity] = useState(0.7)
  const [bimRenderMode, setBimRenderMode] = useState<"solid" | "wireframe" | "points">("solid")
  const [scanRenderMode, setScanRenderMode] = useState<"solid" | "wireframe" | "points">("solid")

  const [measurementMode, setMeasurementMode] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])

  const [triggerAlignment, setTriggerAlignment] = useState(false)

  const handleAnalysisComplete = (analysis: DeviationAnalysis) => {
    console.log("[v0] Analysis received:", analysis)
    setDeviationData(analysis)
    setShowDeviations(true)
    setIsAnalyzing(false)
  }

  const handleStartAnalysis = () => {
    console.log("[v0] Starting analysis...")
    setIsAnalyzing(true)
  }

  const handleAddMeasurement = (start: THREE.Vector3, end: THREE.Vector3) => {
    const distance = start.distanceTo(end)
    const measurement: Measurement = {
      id: `measure-${Date.now()}`,
      start,
      end,
      distance,
    }
    setMeasurements((prev) => [...prev, measurement])
  }

  const handleClearMeasurements = () => {
    setMeasurements([])
  }

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
  }

  const handleAlign = () => {
    setTriggerAlignment(true)
    setTimeout(() => setTriggerAlignment(false), 100)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h2 className="font-semibold text-foreground">
              {showDeviations ? "Анализ отклонений" : "Визуальное сравнение"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {bimFile.name} vs {scanFile.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showBim ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBim(!showBim)}
            className="gap-2"
          >
            {showBim ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            BIM
          </Button>
          <Button
            variant={showScan ? "default" : "outline"}
            size="sm"
            onClick={() => setShowScan(!showScan)}
            className="gap-2"
          >
            {showScan ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Скан
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)} className="gap-2">
            <Grid3x3 className="h-4 w-4" />
            {showGrid ? "Сетка" : "Без сетки"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleAlign} className="gap-2 bg-transparent">
            <Crosshair className="h-4 w-4" />
            Выровнять
          </Button>
          <Button
            variant={measurementMode ? "default" : "outline"}
            size="sm"
            onClick={() => setMeasurementMode(!measurementMode)}
            className="gap-2"
          >
            <Ruler className="h-4 w-4" />
            Измерить
          </Button>
          <Button
            variant={showDeviations ? "default" : "outline"}
            size="sm"
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {isAnalyzing ? "Анализ..." : showDeviations ? "Показать анализ" : "Анализировать"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Viewer */}
        <div className={showDeviations && deviationData ? "flex-1" : "flex-1"}>
          <ModelViewer
            bimFile={bimFile}
            scanFile={scanFile}
            showBim={showBim}
            showScan={showScan}
            showGrid={showGrid}
            showDeviations={showDeviations}
            onAnalysisComplete={handleAnalysisComplete}
            startAnalysis={isAnalyzing}
            bimOpacity={bimOpacity}
            scanOpacity={scanOpacity}
            bimRenderMode={bimRenderMode}
            scanRenderMode={scanRenderMode}
            measurementMode={measurementMode}
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            triggerAlignment={triggerAlignment}
          />

          {!showDeviations && !measurementMode && (
            <ViewControls
              bimOpacity={bimOpacity}
              scanOpacity={scanOpacity}
              onBimOpacityChange={setBimOpacity}
              onScanOpacityChange={setScanOpacity}
              bimRenderMode={bimRenderMode}
              scanRenderMode={scanRenderMode}
              onBimRenderModeChange={setBimRenderMode}
              onScanRenderModeChange={setScanRenderMode}
            />
          )}

          {measurementMode && (
            <MeasurementTool
              measurements={measurements}
              onClearMeasurements={handleClearMeasurements}
              onDeleteMeasurement={handleDeleteMeasurement}
            />
          )}
        </div>

        {showDeviations && deviationData && (
          <div className="w-96 border-l border-border">
            <DeviationPanel data={deviationData} bimFileName={bimFile.name} scanFileName={scanFile.name} />
          </div>
        )}
      </div>
    </div>
  )
}
