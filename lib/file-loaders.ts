import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"
import { IFCLoader } from "web-ifc-three/IFCLoader"

/**
 * Улучшенный парсер OBJ файлов с поддержкой граней и нормалей
 */
function parseOBJ(text: string): THREE.BufferGeometry {
  const vertices: THREE.Vector3[] = []
  const normals: THREE.Vector3[] = []
  const faces: number[][] = []
  const faceNormals: number[][] = []

  const lines = text.split("\n")

  // Первый проход: собираем вершины и нормали
  for (const line of lines) {
    const parts = line.trim().split(/\s+/)

    if (parts[0] === "v") {
      // Вершина: v x y z
      vertices.push(
        new THREE.Vector3(Number.parseFloat(parts[1]), Number.parseFloat(parts[2]), Number.parseFloat(parts[3])),
      )
    } else if (parts[0] === "vn") {
      // Нормаль: vn x y z
      normals.push(
        new THREE.Vector3(Number.parseFloat(parts[1]), Number.parseFloat(parts[2]), Number.parseFloat(parts[3])),
      )
    } else if (parts[0] === "f") {
      // Грань: f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
      const face: number[] = []
      const faceNormal: number[] = []

      for (let i = 1; i < parts.length; i++) {
        const vertexData = parts[i].split("/")
        const vertexIndex = Number.parseInt(vertexData[0]) - 1
        const normalIndex = vertexData[2] ? Number.parseInt(vertexData[2]) - 1 : -1

        face.push(vertexIndex)
        faceNormal.push(normalIndex)
      }

      faces.push(face)
      faceNormals.push(faceNormal)
    }
  }

  // Создаем буферную геометрию
  const positions: number[] = []
  const normalsList: number[] = []

  // Триангуляция граней (если грань имеет больше 3 вершин)
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]
    const faceNormal = faceNormals[i]

    // Триангуляция веерным методом
    for (let j = 1; j < face.length - 1; j++) {
      const indices = [face[0], face[j], face[j + 1]]
      const normalIndices = [faceNormal[0], faceNormal[j], faceNormal[j + 1]]

      for (let k = 0; k < 3; k++) {
        const vIdx = indices[k]
        const nIdx = normalIndices[k]

        if (vIdx >= 0 && vIdx < vertices.length) {
          const v = vertices[vIdx]
          positions.push(v.x, v.y, v.z)

          // Если есть нормали в файле, используем их
          if (nIdx >= 0 && nIdx < normals.length) {
            const n = normals[nIdx]
            normalsList.push(n.x, n.y, n.z)
          }
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))

  // Если нормали были в файле, используем их
  if (normalsList.length === positions.length) {
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normalsList, 3))
  } else {
    // Иначе вычисляем автоматически
    geometry.computeVertexNormals()
  }

  console.log(`[v0] Parsed OBJ: ${positions.length / 3} vertices, ${faces.length} faces`)
  return geometry
}

/**
 * Простой парсер PLY файлов (ASCII формат)
 */
function parsePLY(text: string): THREE.BufferGeometry {
  const vertices: number[] = []
  const colors: number[] = []

  const lines = text.split("\n")
  let vertexCount = 0
  let inHeader = true
  let currentVertex = 0

  for (const line of lines) {
    if (inHeader) {
      if (line.startsWith("element vertex")) {
        vertexCount = Number.parseInt(line.split(/\s+/)[2])
      } else if (line.startsWith("end_header")) {
        inHeader = false
      }
      continue
    }

    if (currentVertex < vertexCount) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 3) {
        vertices.push(Number.parseFloat(parts[0]), Number.parseFloat(parts[1]), Number.parseFloat(parts[2]))

        // Цвет если есть (RGB)
        if (parts.length >= 6) {
          colors.push(Number.parseInt(parts[3]) / 255, Number.parseInt(parts[4]) / 255, Number.parseInt(parts[5]) / 255)
        }
        currentVertex++
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))

  if (colors.length > 0) {
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  }

  console.log(`[v0] Parsed PLY: ${vertices.length / 3} points`)
  return geometry
}

/**
 * Загружает 3D-модель из файла
 */
export async function loadModelFromFile(file: File): Promise<THREE.Object3D> {
  const extension = file.name.split(".").pop()?.toLowerCase()
  const url = URL.createObjectURL(file)

  console.log(`[v0] Loading file: ${file.name} (${extension})`)

  try {
    return await new Promise((resolve, reject) => {
      switch (extension) {
        case "glb":
        case "gltf": {
          const loader = new GLTFLoader()
          loader.load(url, (gltf) => {
            URL.revokeObjectURL(url)
            resolve(gltf.scene)
          }, undefined, reject)
          break
        }

        case "fbx": {
          const loader = new FBXLoader()
          loader.load(url, (object) => {
            URL.revokeObjectURL(url)
            resolve(object)
          }, undefined, reject)
          break
        }

        case "stl": {
          const loader = new STLLoader()
          loader.load(url, (geometry) => {
            URL.revokeObjectURL(url)
            const material = new THREE.MeshStandardMaterial({ color: 0x888888 })
            resolve(new THREE.Mesh(geometry, material))
          }, undefined, reject)
          break
        }

        case "ifc": {
          const loader = new IFCLoader()
          // Настройка пути к WASM файлам web-ifc
          loader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.36/")
          loader.load(url, (object) => {
            URL.revokeObjectURL(url)
            resolve(object)
          }, undefined, reject)
          break
        }

        case "obj": {
          const reader = new FileReader()
          reader.onload = (e) => {
            const text = e.target?.result as string
            const geometry = parseOBJ(text)
            const material = new THREE.MeshStandardMaterial({ color: 0x888888 })
            URL.revokeObjectURL(url)
            resolve(new THREE.Mesh(geometry, material))
          }
          reader.onerror = reject
          reader.readAsText(file)
          break
        }

        case "ply": {
          const reader = new FileReader()
          reader.onload = (e) => {
            const text = typeof e.target?.result === "string" ? e.target?.result : new TextDecoder().decode(e.target?.result as ArrayBuffer)
            const geometry = parsePLY(text)
            const material = new THREE.PointsMaterial({
              size: 0.02,
              vertexColors: !!geometry.attributes.color
            })
            URL.revokeObjectURL(url)
            resolve(new THREE.Points(geometry, material))
          }
          reader.onerror = reject
          reader.readAsText(file)
          break
        }

        default:
          URL.revokeObjectURL(url)
          reject(new Error(`Неподдерживаемый формат: ${extension}`))
      }
    })
  } catch (error) {
    console.error(`[v0] Error loading file:`, error)
    URL.revokeObjectURL(url)
    throw error
  }
}

export const loadModelFile = loadModelFromFile

/**
 * Проверяет поддержку формата
 */
export function isSupportedFormat(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase()
  return ["glb", "gltf", "obj", "ply", "fbx", "ifc", "stl", "pcd", "e57"].includes(extension || "")
}

/**
 * Описание формата
 */
export function getFormatDescription(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase()

  const descriptions: Record<string, string> = {
    ifc: "Industry Foundation Classes (BIM)",
    obj: "Wavefront OBJ",
    fbx: "Autodesk FBX",
    glb: "Binary glTF",
    gltf: "GL Transmission Format",
    ply: "Polygon File Format (Point Cloud)",
    pcd: "Point Cloud Data",
    e57: "ASTM E57 (Laser Scan)",
  }

  return descriptions[extension || ""] || "Unknown format"
}
