"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei"
import { Suspense, useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { loadModelFromFile } from "@/lib/file-loaders"
import { compareModels, type DeviationAnalysis } from "@/lib/model-comparison"
import { DeviationHeatmap } from "./deviation-heatmap"

interface ModelViewerProps {
  bimFile: File
  scanFile: File
  showBim: boolean
  showScan: boolean
  showGrid: boolean
  showDeviations: boolean
  onAnalysisComplete?: (analysis: DeviationAnalysis) => void
  startAnalysis?: boolean
}

function LoadedModel({
  file,
  color,
  opacity,
  visible,
  onLoad,
}: {
  file: File
  color: string
  opacity: number
  visible: boolean
  onLoad?: (model: THREE.Object3D) => void
}) {
  const [model, setModel] = useState<THREE.Object3D | null>(null)
  const [loading, setLoading] = useState(true)
  const loadedFileRef = useRef<string>("")

  useEffect(() => {
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`

    if (loadedFileRef.current === fileKey && model) {
      console.log(`[v0] File ${file.name} already loaded, skipping`)
      return
    }

    console.log(`[v0] Loading file: ${file.name} (${file.name.split(".").pop()})`)
    setLoading(true)

    loadModelFromFile(file)
      .then((loadedModel) => {
        console.log(`[v0] Successfully loaded ${file.name}`)

        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const material = child.material as THREE.MeshStandardMaterial
            if (material) {
              material.color.set(color)
              material.transparent = opacity < 1
              material.opacity = opacity
              material.side = THREE.FrontSide
              material.depthWrite = true
              material.roughness = 0.8
              material.metalness = 0.1
            }
          } else if (child instanceof THREE.Points) {
            const material = child.material as THREE.PointsMaterial
            if (material) {
              material.color.set(color)
              material.transparent = opacity < 1
              material.opacity = opacity
              material.size = 0.05
            }
          }
        })

        setModel(loadedModel)
        setLoading(false)
        loadedFileRef.current = fileKey

        if (onLoad) {
          onLoad(loadedModel)
        }
      })
      .catch((error) => {
        console.error(`[v0] Error loading ${file.name}:`, error)
        setLoading(false)
      })
  }, [file])

  useEffect(() => {
    if (model) {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial
          if (material) {
            material.color.set(color)
            material.transparent = opacity < 1
            material.opacity = opacity
          }
        } else if (child instanceof THREE.Points) {
          const material = child.material as THREE.PointsMaterial
          if (material) {
            material.color.set(color)
            material.transparent = opacity < 1
            material.opacity = opacity
          }
        }
      })
    }
  }, [color, opacity, model])

  if (loading || !model) {
    return null
  }

  return <primitive object={model} visible={visible} />
}

export function ModelViewer({
  bimFile,
  scanFile,
  showBim,
  showScan,
  showGrid,
  showDeviations,
  onAnalysisComplete,
  startAnalysis,
}: ModelViewerProps) {
  const bimModelRef = useRef<THREE.Object3D | null>(null)
  const scanModelRef = useRef<THREE.Object3D | null>(null)
  const [deviationData, setDeviationData] = useState<DeviationAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const analysisCompletedRef = useRef(false)

  useEffect(() => {
    if (startAnalysis && bimModelRef.current && scanModelRef.current && !isAnalyzing && !analysisCompletedRef.current) {
      setIsAnalyzing(true)
      analysisCompletedRef.current = true
      console.log("[v0] Starting comparison analysis...")

      setTimeout(() => {
        try {
          const analysis = compareModels(bimModelRef.current!, scanModelRef.current!, 0.2)
          console.log("[v0] Analysis complete:", analysis.statistics)
          setDeviationData(analysis)

          if (onAnalysisComplete) {
            onAnalysisComplete(analysis)
          }
        } catch (error) {
          console.error("[v0] Analysis error:", error)
        } finally {
          setIsAnalyzing(false)
        }
      }, 100)
    }
  }, [startAnalysis, isAnalyzing, onAnalysisComplete])

  const handleBimLoad = (model: THREE.Object3D) => {
    bimModelRef.current = model
    console.log("[v0] BIM model loaded and stored")
  }

  const handleScanLoad = (model: THREE.Object3D) => {
    scanModelRef.current = model
    console.log("[v0] Scan model loaded and stored")
  }

  return (
    <div className="relative h-full w-full bg-muted/20">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[20, 15, 20]} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

        {/* Мягкий ambient свет для общего освещения */}
        <ambientLight intensity={0.4} />

        {/* Основной направленный свет (имитация солнца) */}
        <directionalLight
          position={[15, 20, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* Заполняющий свет для мягких теней */}
        <directionalLight position={[-10, 8, -8]} intensity={0.3} color="#e0f2ff" />

        {/* Контровой свет для контраста */}
        <directionalLight position={[5, 5, -10]} intensity={0.2} color="#fef3c7" />

        {/* Полусферический свет снизу для естественности */}
        <hemisphereLight intensity={0.3} groundColor="#808080" color="#b8d4ff" />

        {showGrid && <Grid args={[50, 50]} cellSize={1} cellColor="#6b7280" sectionColor="#3b82f6" fadeDistance={30} />}

        <Suspense fallback={null}>
          <LoadedModel
            file={bimFile}
            color="#3b82f6"
            opacity={0.75}
            visible={showBim && !showDeviations}
            onLoad={handleBimLoad}
          />
          <LoadedModel
            file={scanFile}
            color="#f97316"
            opacity={0.7}
            visible={showScan && !showDeviations}
            onLoad={handleScanLoad}
          />

          {showDeviations && deviationData && <DeviationHeatmap data={deviationData} />}
        </Suspense>
      </Canvas>

      {/* Управление */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-1 text-xs font-semibold text-foreground">Управление:</p>
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <p>Вращение: Левая кнопка мыши</p>
          <p>Панорама: Правая кнопка мыши</p>
          <p>Масштаб: Колесо мыши</p>
        </div>
      </div>

      {!showDeviations && (
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-card/95 p-3 shadow-lg backdrop-blur-sm">
          <p className="mb-2 text-xs font-semibold text-foreground">Наложение моделей:</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded bg-[#3b82f6] opacity-75" />
              <span className="text-xs text-muted-foreground">BIM-модель (проект)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded bg-[#f97316] opacity-70" />
              <span className="text-xs text-muted-foreground">3D-скан (реальность)</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Совпадения: фиолетовый оттенок</p>
              <p>Отклонения: видны явно</p>
            </div>
          </div>
        </div>
      )}

      {showDeviations && deviationData && (
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-card/95 p-3 shadow-lg backdrop-blur-sm">
          <p className="mb-2 text-xs font-semibold text-foreground">Тепловая карта отклонений:</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-chart-3" />
              <span className="text-xs text-muted-foreground">{"<"} 10 мм - норма</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-chart-5" />
              <span className="text-xs text-muted-foreground">10-30 мм - внимание</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-destructive" />
              <span className="text-xs text-muted-foreground">{">"} 30 мм - критично</span>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm font-medium text-foreground">Анализ моделей...</p>
            <p className="mt-1 text-xs text-muted-foreground">Вычисление отклонений</p>
          </div>
        </div>
      )}
    </div>
  )
}
