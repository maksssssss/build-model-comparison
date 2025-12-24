import * as THREE from "three"

export interface AlignmentResult {
  translation: THREE.Vector3
  scale: number
  rotation: THREE.Euler
}

export function computeBoundingBox(model: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3()
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geometry = child.geometry
      if (!geometry.boundingBox) {
        geometry.computeBoundingBox()
      }
      if (geometry.boundingBox) {
        const meshBox = geometry.boundingBox.clone()
        meshBox.applyMatrix4(child.matrixWorld)
        box.union(meshBox)
      }
    } else if (child instanceof THREE.Points && child.geometry) {
      const geometry = child.geometry
      if (!geometry.boundingBox) {
        geometry.computeBoundingBox()
      }
      if (geometry.boundingBox) {
        const pointsBox = geometry.boundingBox.clone()
        pointsBox.applyMatrix4(child.matrixWorld)
        box.union(pointsBox)
      }
    }
  })
  return box
}

export function centerModel(model: THREE.Object3D): THREE.Vector3 {
  const box = computeBoundingBox(model)
  const center = new THREE.Vector3()
  box.getCenter(center)

  model.position.sub(center)
  model.updateMatrixWorld(true)

  console.log("[v0] Model centered at:", center)
  return center
}

export function scaleModelToFit(model: THREE.Object3D, targetSize = 10): number {
  const box = computeBoundingBox(model)
  const size = new THREE.Vector3()
  box.getSize(size)

  const maxDimension = Math.max(size.x, size.y, size.z)
  const scale = maxDimension > 0 ? targetSize / maxDimension : 1

  model.scale.multiplyScalar(scale)
  model.updateMatrixWorld(true)

  console.log("[v0] Model scaled by:", scale)
  return scale
}

export function alignModels(
  bimModel: THREE.Object3D,
  scanModel: THREE.Object3D,
): {
  bimAlignment: AlignmentResult
  scanAlignment: AlignmentResult
} {
  console.log("[v0] Starting model alignment...")

  const bimCenter = centerModel(bimModel)
  const scanCenter = centerModel(scanModel)

  const bimScale = scaleModelToFit(bimModel, 10)
  const scanScale = scaleModelToFit(scanModel, 10)

  const bimAlignment: AlignmentResult = {
    translation: bimCenter,
    scale: bimScale,
    rotation: new THREE.Euler(0, 0, 0),
  }

  const scanAlignment: AlignmentResult = {
    translation: scanCenter,
    scale: scanScale,
    rotation: new THREE.Euler(0, 0, 0),
  }

  console.log("[v0] Alignment complete:", { bimAlignment, scanAlignment })

  return { bimAlignment, scanAlignment }
}

export function alignToGround(model: THREE.Object3D): void {
  const box = computeBoundingBox(model)
  const minY = box.min.y

  model.position.y -= minY
  model.updateMatrixWorld(true)

  console.log("[v0] Model aligned to ground, shifted by:", -minY)
}
