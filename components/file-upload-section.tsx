"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, Check, ArrowRight } from "lucide-react"
import { useRef } from "react"

interface FileUploadSectionProps {
  bimFile: File | null
  scanFile: File | null
  onBimFileChange: (file: File | null) => void
  onScanFileChange: (file: File | null) => void
  onCompare: () => void
}

export function FileUploadSection({
  bimFile,
  scanFile,
  onBimFileChange,
  onScanFileChange,
  onCompare,
}: FileUploadSectionProps) {
  const bimInputRef = useRef<HTMLInputElement>(null)
  const scanInputRef = useRef<HTMLInputElement>(null)

  const handleBimDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onBimFileChange(file)
  }

  const handleScanDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onScanFileChange(file)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const canCompare = bimFile && scanFile

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* BIM Model Upload */}
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">BIM-модель (Проект)</h3>
                <p className="text-xs text-muted-foreground">IFC, OBJ, FBX, GLB</p>
              </div>
            </div>
          </div>

          <div className="p-6" onDrop={handleBimDrop} onDragOver={(e) => e.preventDefault()}>
            {!bimFile ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium text-foreground">Перетащите файл сюда</p>
                <p className="mb-4 text-xs text-muted-foreground">или нажмите для выбора</p>
                <Button variant="outline" size="sm" onClick={() => bimInputRef.current?.click()}>
                  Выбрать файл
                </Button>
                <input
                  ref={bimInputRef}
                  type="file"
                  className="hidden"
                  accept=".ifc,.obj,.fbx,.glb,.gltf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onBimFileChange(file)
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{bimFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(bimFile.size)}</p>
                  </div>
                  <Check className="h-5 w-5 flex-shrink-0 text-chart-3" />
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => onBimFileChange(null)}>
                  Изменить файл
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Scan Upload */}
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-accent/10">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">3D-скан (Реальность)</h3>
                <p className="text-xs text-muted-foreground">PLY, PCD, E57, OBJ</p>
              </div>
            </div>
          </div>

          <div className="p-6" onDrop={handleScanDrop} onDragOver={(e) => e.preventDefault()}>
            {!scanFile ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:border-accent/50 hover:bg-muted/30">
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium text-foreground">Перетащите файл сюда</p>
                <p className="mb-4 text-xs text-muted-foreground">или нажмите для выбора</p>
                <Button variant="outline" size="sm" onClick={() => scanInputRef.current?.click()}>
                  Выбрать файл
                </Button>
                <input
                  ref={scanInputRef}
                  type="file"
                  className="hidden"
                  accept=".ply,.pcd,.e57,.obj,.glb,.gltf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onScanFileChange(file)
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-accent/10">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{scanFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(scanFile.size)}</p>
                  </div>
                  <Check className="h-5 w-5 flex-shrink-0 text-chart-3" />
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => onScanFileChange(null)}>
                  Изменить файл
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Compare Button */}
      <div className="flex justify-center">
        <Button size="lg" className="gap-2 px-8 text-base font-semibold" disabled={!canCompare} onClick={onCompare}>
          Сравнить модели
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {!canCompare && (
        <p className="text-center text-sm text-muted-foreground">Загрузите оба файла для начала сравнения</p>
      )}
    </div>
  )
}
