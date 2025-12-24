"use client"

import { useState } from "react"
import { FileUploadSection } from "@/components/file-upload-section"
import { ComparisonViewer } from "@/components/comparison-viewer"
import { Cable as Cube, Layers } from "lucide-react"

export default function HomePage() {
  const [bimFile, setBimFile] = useState<File | null>(null)
  const [scanFile, setScanFile] = useState<File | null>(null)
  const [isComparing, setIsComparing] = useState(false)

  const handleCompare = () => {
    if (bimFile && scanFile) {
      setIsComparing(true)
    }
  }

  const handleReset = () => {
    setBimFile(null)
    setScanFile(null)
    setIsComparing(false)
  }

  if (isComparing && bimFile && scanFile) {
    return <ComparisonViewer bimFile={bimFile} scanFile={scanFile} onReset={handleReset} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold text-foreground">BIM Compare</h1>
              <p className="text-xs text-muted-foreground">3D Model Deviation Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cube className="h-4 w-4" />
            <span className="font-mono">v1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground">Сравните проект с реальностью</h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Загрузите BIM-модель из Archicad и 3D-скан здания. Система автоматически найдет и покажет все отклонения
              от проекта.
            </p>
          </div>

          {/* Upload Section */}
          <FileUploadSection
            bimFile={bimFile}
            scanFile={scanFile}
            onBimFileChange={setBimFile}
            onScanFileChange={setScanFile}
            onCompare={handleCompare}
          />

          {/* Features */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Простая загрузка</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Перетащите файлы или выберите их. Поддержка IFC, OBJ, FBX форматов.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Точный анализ</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Автоматическое выравнивание моделей и измерение отклонений с точностью до миллиметра.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                <svg className="h-6 w-6 text-chart-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Наглядная визуализация</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Цветовая карта отклонений: зеленый - норма, желтый/красный - проблемные зоны.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
