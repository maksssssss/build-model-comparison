"use client"

import * as THREE from "three"
import { useMemo } from "react"
import type { DeviationAnalysis } from "@/lib/model-comparison"

interface ColoredDeviationModelProps {
  model: THREE.Object3D
  deviationData: DeviationAnalysis
  modelType: "bim" | "scan"
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

export function ColoredDeviationModel({ model, deviationData, modelType }: ColoredDeviationModelProps) {
  const coloredModel = useMemo(() => {
    const clonedModel = model.clone(true)

    console.log(`[v0] Coloring ${modelType} model with ${deviationData.points.length} deviation points`)

    // Создаем карту отклонений для быстрого поиска
    const deviationMap = new Map<string, number>()
    deviationData.points.forEach((point) => {
      const key = `${point.position.x.toFixed(2)}_${point.position.y.toFixed(2)}_${point.position.z.toFixed(2)}`
      deviationMap.set(key, point.deviation)
    })

    clonedModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry.clone()
        const positionAttribute = geometry.attributes.position

        if (positionAttribute) {
          const colors = new Float32Array(positionAttribute.count * 3)
          const worldMatrix = child.matrixWorld

          // Для каждой вершины находим ближайшее отклонение
          for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3()
            vertex.fromBufferAttribute(positionAttribute, i)
            vertex.applyMatrix4(worldMatrix)

            // Ищем ближайшую точку отклонения
            let closestDeviation = 0
            let minDistance = Number.POSITIVE_INFINITY

            for (const deviationPoint of deviationData.points) {
              const distance = vertex.distanceTo(deviationPoint.position)
              if (distance < minDistance) {
                minDistance = distance
                closestDeviation = deviationPoint.deviation
              }
            }

            // Получаем цвет на основе отклонения
            const color = getDeviationColor(closestDeviation)

            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
          }

          geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

          const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            roughness: 0.7,
            metalness: 0.1,
          })

          child.geometry = geometry
          child.material = material
        }
      }
    })

    return clonedModel
  }, [model, deviationData, modelType])

  return <primitive object={coloredModel} />
}
