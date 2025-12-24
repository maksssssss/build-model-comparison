"use client"

import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useRef, useMemo } from "react"
import type { DeviationAnalysis } from "@/lib/model-comparison"

interface DeviationHeatmapProps {
  data: DeviationAnalysis
  opacity?: number
}

export function DeviationHeatmap({ data, opacity = 1 }: DeviationHeatmapProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const deviations = data.points

    const validDeviations = deviations.filter((deviation) => {
      const pos = deviation.position
      const isValid =
        pos &&
        typeof pos.x === "number" &&
        isFinite(pos.x) &&
        typeof pos.y === "number" &&
        isFinite(pos.y) &&
        typeof pos.z === "number" &&
        isFinite(pos.z)

      if (!isValid) {
        console.warn("[v0] Invalid position found:", pos)
      }
      return isValid
    })

    console.log(`[v0] Creating heatmap geometry: ${validDeviations.length} valid points out of ${deviations.length}`)

    if (validDeviations.length === 0) {
      console.error("[v0] No valid points for heatmap!")
      // Возвращаем пустую геометрию
      return new THREE.BufferGeometry()
    }

    const positions = new Float32Array(validDeviations.length * 3)
    const colors = new Float32Array(validDeviations.length * 3)

    validDeviations.forEach((deviation, i) => {
      positions[i * 3] = deviation.position.x
      positions[i * 3 + 1] = deviation.position.y
      positions[i * 3 + 2] = deviation.position.z

      const color = getDeviationColor(deviation.deviation)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    return geo
  }, [data])

  // Плавная анимация появления
  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime()
      pointsRef.current.material.opacity = Math.min(opacity, time / 2)
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function getDeviationColor(deviation: number): THREE.Color {
  const absDev = Math.abs(deviation)

  if (absDev < 10) {
    return new THREE.Color(0x22c55e) // Зеленый - норма
  } else if (absDev < 30) {
    // Плавный переход от желтого к оранжевому
    const t = (absDev - 10) / 20
    return new THREE.Color().lerpColors(new THREE.Color(0xeab308), new THREE.Color(0xf97316), t)
  } else {
    return new THREE.Color(0xef4444) // Красный - критично
  }
}
