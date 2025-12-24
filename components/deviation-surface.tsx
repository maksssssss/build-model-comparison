"use client"

import * as THREE from "three"
import { useMemo } from "react"
import type { DeviationPoint } from "@/lib/model-comparison"

interface DeviationSurfaceProps {
  deviations: DeviationPoint[]
  opacity?: number
}

/**
 * Создает поверхность из точек отклонений для более наглядной визуализации
 */
export function DeviationSurface({ deviations, opacity = 0.8 }: DeviationSurfaceProps) {
  const mesh = useMemo(() => {
    if (deviations.length === 0) return null

    // Создаем облако точек с нормалями
    const positions: number[] = []
    const colors: number[] = []
    const normals: number[] = []

    deviations.forEach((deviation) => {
      positions.push(deviation.position.x, deviation.position.y, deviation.position.z)

      // Цвет на основе отклонения
      const color = getColorForDeviation(deviation.deviation)
      colors.push(color.r, color.g, color.b)

      // Простые нормали (вверх)
      normals.push(0, 1, 0)
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))

    return geometry
  }, [deviations])

  if (!mesh) return null

  return (
    <points geometry={mesh}>
      <pointsMaterial size={0.15} vertexColors transparent opacity={opacity} sizeAttenuation />
    </points>
  )
}

function getColorForDeviation(deviation: number): THREE.Color {
  const absDev = Math.abs(deviation)

  if (absDev < 10) {
    return new THREE.Color(0x22c55e) // Green
  } else if (absDev < 30) {
    const t = (absDev - 10) / 20
    return new THREE.Color().lerpColors(new THREE.Color(0xeab308), new THREE.Color(0xf97316), t)
  } else {
    return new THREE.Color(0xef4444) // Red
  }
}
