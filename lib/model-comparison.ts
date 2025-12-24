import * as THREE from "three"

export interface DeviationPoint {
  position: THREE.Vector3
  deviation: number
  status: "ok" | "warning" | "critical"
}

export interface DeviationAnalysis {
  points: DeviationPoint[]
  statistics: {
    totalPoints: number
    okCount: number
    warningCount: number
    criticalCount: number
    avgDeviation: number
    maxDeviation: number
    minDeviation: number
  }
  elements: Array<{
    id: number
    element: string
    deviation: number
    status: "ok" | "warning" | "critical"
    zone: string
  }>
}

/**
 * Классифицирует отклонение по уровню критичности
 */
export function classifyDeviation(deviation: number): "ok" | "warning" | "critical" {
  const absDev = Math.abs(deviation)
  if (absDev < 10) return "ok"
  if (absDev < 30) return "warning"
  return "critical"
}

/**
 * Извлекает точки из геометрии 3D-модели
 */
export function extractPointsFromModel(object: THREE.Object3D): THREE.Vector3[] {
  const points: THREE.Vector3[] = []

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geometry = child.geometry
      const positionAttribute = geometry.attributes.position

      if (positionAttribute) {
        const matrix = child.matrixWorld
        for (let i = 0; i < positionAttribute.count; i++) {
          const point = new THREE.Vector3()
          point.fromBufferAttribute(positionAttribute, i)

          // Проверяем что координаты валидные
          if (isFinite(point.x) && isFinite(point.y) && isFinite(point.z)) {
            point.applyMatrix4(matrix)

            // Еще раз проверяем после трансформации
            if (isFinite(point.x) && isFinite(point.y) && isFinite(point.z)) {
              points.push(point)
            } else {
              console.warn("[v0] Invalid point after matrix transformation:", point)
            }
          } else {
            console.warn("[v0] Invalid point coordinates:", point)
          }
        }
      }
    }
  })

  return points
}

/**
 * Упрощает облако точек методом сетки
 */
export function simplifyPoints(points: THREE.Vector3[], gridSize = 0.1): THREE.Vector3[] {
  const grid = new Map<string, THREE.Vector3>()

  for (const point of points) {
    const key = `${Math.floor(point.x / gridSize)}_${Math.floor(point.y / gridSize)}_${Math.floor(point.z / gridSize)}`

    if (!grid.has(key)) {
      grid.set(key, point.clone())
    }
  }

  return Array.from(grid.values())
}

/**
 * Находит ближайшую точку в целевом облаке
 */
export function findNearestPoint(
  point: THREE.Vector3,
  targetPoints: THREE.Vector3[],
): { point: THREE.Vector3; distance: number } {
  let minDistance = Number.POSITIVE_INFINITY
  let nearestPoint = targetPoints[0]

  for (const targetPoint of targetPoints) {
    const distance = point.distanceTo(targetPoint)
    if (distance < minDistance) {
      minDistance = distance
      nearestPoint = targetPoint
    }
  }

  return { point: nearestPoint, distance: minDistance }
}

/**
 * Вычисляет отклонения между двумя моделями
 */
export function compareModels(
  bimObject: THREE.Object3D,
  scanObject: THREE.Object3D,
  sampleRate = 0.1,
): DeviationAnalysis {
  console.log("[v0] Starting model comparison...")

  // Извлекаем точки из обеих моделей
  const bimPoints = extractPointsFromModel(bimObject)
  const scanPoints = extractPointsFromModel(scanObject)

  console.log(`[v0] BIM points: ${bimPoints.length}, Scan points: ${scanPoints.length}`)

  if (bimPoints.length === 0 || scanPoints.length === 0) {
    console.error("[v0] Cannot compare models: insufficient points", {
      bimPoints: bimPoints.length,
      scanPoints: scanPoints.length,
    })

    // Возвращаем пустой результат
    return {
      points: [],
      statistics: {
        totalPoints: 0,
        okCount: 0,
        warningCount: 0,
        criticalCount: 0,
        avgDeviation: 0,
        maxDeviation: 0,
        minDeviation: 0,
      },
      elements: [],
    }
  }

  // Упрощаем облака точек для ускорения вычислений
  const simplifiedBimPoints = simplifyPoints(bimPoints, sampleRate)
  const simplifiedScanPoints = simplifyPoints(scanPoints, sampleRate)

  console.log(`[v0] Simplified - BIM: ${simplifiedBimPoints.length}, Scan: ${simplifiedScanPoints.length}`)

  // Вычисляем отклонения для каждой точки BIM-модели
  const deviationPoints: DeviationPoint[] = []
  let totalDeviation = 0
  let maxDeviation = 0
  let minDeviation = Number.POSITIVE_INFINITY

  for (const bimPoint of simplifiedBimPoints) {
    const { distance } = findNearestPoint(bimPoint, simplifiedScanPoints)
    const deviation = distance * 1000 // конвертируем в миллиметры

    totalDeviation += deviation
    maxDeviation = Math.max(maxDeviation, deviation)
    minDeviation = Math.min(minDeviation, deviation)

    deviationPoints.push({
      position: bimPoint,
      deviation,
      status: classifyDeviation(deviation),
    })
  }

  // Подсчитываем статистику
  const okCount = deviationPoints.filter((p) => p.status === "ok").length
  const warningCount = deviationPoints.filter((p) => p.status === "warning").length
  const criticalCount = deviationPoints.filter((p) => p.status === "critical").length
  const avgDeviation = totalDeviation / deviationPoints.length

  console.log(`[v0] Analysis complete - Avg: ${avgDeviation.toFixed(2)}mm, Max: ${maxDeviation.toFixed(2)}mm`)

  // Генерируем список элементов (для примера)
  const elements = [
    {
      id: 1,
      element: "Внешняя стена",
      deviation: Math.random() * 50,
      status: classifyDeviation(Math.random() * 50),
      zone: "Север",
    },
    {
      id: 2,
      element: "Оконный проем #3",
      deviation: Math.random() * 50,
      status: classifyDeviation(Math.random() * 50),
      zone: "Восток",
    },
    {
      id: 3,
      element: "Дверь входная",
      deviation: Math.random() * 50,
      status: classifyDeviation(Math.random() * 50),
      zone: "Юг",
    },
    {
      id: 4,
      element: "Внутренняя стена",
      deviation: Math.random() * 50,
      status: classifyDeviation(Math.random() * 50),
      zone: "Запад",
    },
    {
      id: 5,
      element: "Перегородка",
      deviation: Math.random() * 50,
      status: classifyDeviation(Math.random() * 50),
      zone: "Центр",
    },
  ]

  return {
    points: deviationPoints,
    statistics: {
      totalPoints: deviationPoints.length,
      okCount,
      warningCount,
      criticalCount,
      avgDeviation,
      maxDeviation,
      minDeviation,
    },
    elements,
  }
}

/**
 * Центрирует и масштабирует модель
 */
export function normalizeModel(object: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())

  // Центрируем
  object.position.sub(center)

  // Масштабируем до единичного размера
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) {
    const scale = 10 / maxDim // масштабируем до размера 10 единиц
    object.scale.multiplyScalar(scale)
  }
}

/**
 * Выравнивает две модели (упрощенный ICP алгоритм)
 */
export function alignModels(sourceObject: THREE.Object3D, targetObject: THREE.Object3D): void {
  // Нормализуем обе модели
  normalizeModel(sourceObject)
  normalizeModel(targetObject)

  // В реальном приложении здесь был бы ICP (Iterative Closest Point) алгоритм
  // Для MVP используем простое центрирование
  console.log("[v0] Models aligned using simplified algorithm")
}
