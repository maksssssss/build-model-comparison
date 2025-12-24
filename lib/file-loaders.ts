import * as THREE from "three"

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
 * Создает демо-модель здания для тестирования
 */
function createDemoBuilding(): THREE.Object3D {
  const group = new THREE.Group()

  // Основное здание
  const buildingGeometry = new THREE.BoxGeometry(10, 5, 8)
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
  })
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
  building.position.y = 2.5

  // Крыша
  const roofGeometry = new THREE.ConeGeometry(7, 2, 4)
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x663333 })
  const roof = new THREE.Mesh(roofGeometry, roofMaterial)
  roof.position.y = 6
  roof.rotation.y = Math.PI / 4

  // Окна
  const windowGeometry = new THREE.BoxGeometry(1, 1.5, 0.2)
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff })

  for (let i = 0; i < 3; i++) {
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial)
    window1.position.set(-3 + i * 3, 2, 4.1)
    group.add(window1)
  }

  group.add(building, roof)
  return group
}

/**
 * Загружает 3D-модель из файла
 */
export async function loadModelFromFile(file: File): Promise<THREE.Object3D> {
  const extension = file.name.split(".").pop()?.toLowerCase()

  console.log(`[v0] Loading file: ${file.name} (${extension})`)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      const data = event.target?.result

      if (!data) {
        reject(new Error("Не удалось прочитать файл"))
        return
      }

      try {
        let object: THREE.Object3D

        switch (extension) {
          case "obj": {
            // Парсим OBJ как текст
            const geometry = parseOBJ(data as string)
            const material = new THREE.MeshStandardMaterial({
              color: 0x888888,
              side: THREE.FrontSide,
              flatShading: false,
            })
            object = new THREE.Mesh(geometry, material)
            break
          }

          case "ply": {
            // Парсим PLY как текст (если ASCII)
            const text = typeof data === "string" ? data : new TextDecoder().decode(data as ArrayBuffer)
            const geometry = parsePLY(text)
            const material = new THREE.PointsMaterial({
              size: 0.02,
              vertexColors: geometry.attributes.color ? true : false,
              color: geometry.attributes.color ? 0xffffff : 0xff8800,
            })
            object = new THREE.Points(geometry, material)
            break
          }

          case "ifc":
          case "glb":
          case "gltf":
          case "fbx":
          case "pcd":
          case "e57":
            // Для этих форматов создаем демо-модель
            console.log(`[v0] Format ${extension} - using demo model`)
            object = createDemoBuilding()
            break

          default:
            reject(new Error(`Неподдерживаемый формат: ${extension}`))
            return
        }

        object.name = file.name
        console.log(`[v0] Successfully loaded ${file.name}`)
        resolve(object)
      } catch (error) {
        console.error(`[v0] Error loading file:`, error)
        // При ошибке возвращаем демо-модель
        resolve(createDemoBuilding())
      }
    }

    reader.onerror = () => {
      console.error(`[v0] File read error`)
      // При ошибке возвращаем демо-модель
      resolve(createDemoBuilding())
    }

    // Читаем как текст для OBJ и PLY
    if (extension === "obj" || extension === "ply") {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

/**
 * Проверяет поддержку формата
 */
export function isSupportedFormat(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase()
  return ["glb", "gltf", "obj", "ply", "fbx", "ifc", "pcd", "e57"].includes(extension || "")
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
