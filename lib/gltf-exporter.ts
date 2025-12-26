import * as THREE from "three"

export class GLTFExporter {
  async parse(object: THREE.Object3D): Promise<ArrayBuffer> {
    const gltf = this.buildGLTF(object)
    return this.toGLB(gltf)
  }

  private buildGLTF(object: THREE.Object3D): any {
    const buffers: ArrayBuffer[] = []
    const meshes: any[] = []
    const nodes: any[] = []
    const materials: any[] = []

    let bufferByteLength = 0

    // Обход всех mesh объектов
    object.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
        const geometry = child.geometry

        if (!geometry.attributes.position) return

        const positions = geometry.attributes.position
        const normals = geometry.attributes.normal
        const indices = geometry.index

        // Добавляем буферы
        const positionBuffer = positions.array.buffer
        const positionView = {
          buffer: buffers.length,
          byteOffset: bufferByteLength,
          byteLength: positionBuffer.byteLength,
        }
        buffers.push(positionBuffer)
        bufferByteLength += positionBuffer.byteLength

        let normalView = null
        if (normals) {
          const normalBuffer = normals.array.buffer
          normalView = {
            buffer: buffers.length,
            byteOffset: bufferByteLength,
            byteLength: normalBuffer.byteLength,
          }
          buffers.push(normalBuffer)
          bufferByteLength += normalBuffer.byteLength
        }

        let indicesView = null
        if (indices) {
          const indicesBuffer = indices.array.buffer
          indicesView = {
            buffer: buffers.length,
            byteOffset: bufferByteLength,
            byteLength: indicesBuffer.byteLength,
          }
          buffers.push(indicesBuffer)
          bufferByteLength += indicesBuffer.byteLength
        }

        // Создаем primitive
        const primitive: any = {
          attributes: {
            POSITION: meshes.length * 2,
          },
          mode: child instanceof THREE.Points ? 0 : 4, // 0=POINTS, 4=TRIANGLES
        }

        if (normalView) {
          primitive.attributes.NORMAL = meshes.length * 2 + 1
        }

        if (indicesView) {
          primitive.indices = meshes.length * 2 + (normalView ? 2 : 1)
        }

        // Материал
        const material = child.material as THREE.Material
        const materialIndex = materials.length
        materials.push({
          pbrMetallicRoughness: {
            baseColorFactor:
              material instanceof THREE.MeshStandardMaterial
                ? [material.color.r, material.color.g, material.color.b, material.opacity]
                : [0.8, 0.8, 0.8, 1.0],
            metallicFactor: 0.0,
            roughnessFactor: 1.0,
          },
          doubleSided: true,
        })

        primitive.material = materialIndex

        meshes.push({
          primitives: [primitive],
        })

        nodes.push({
          mesh: meshes.length - 1,
          translation: [child.position.x, child.position.y, child.position.z],
          rotation: [child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w],
          scale: [child.scale.x, child.scale.y, child.scale.z],
        })
      }
    })

    // Собираем GLTF структуру
    const gltf: any = {
      asset: {
        version: "2.0",
        generator: "BIM Compare GLB Exporter",
      },
      scene: 0,
      scenes: [{ nodes: nodes.map((_, i) => i) }],
      nodes,
      meshes,
      materials,
      buffers: [{ byteLength: bufferByteLength }],
      bufferViews: [],
      accessors: [],
    }

    // Создаем bufferViews и accessors
    let currentOffset = 0
    meshes.forEach((mesh, meshIndex) => {
      const primitive = mesh.primitives[0]

      // Position accessor
      const posBuffer = buffers[meshIndex * (primitive.indices ? 3 : 2)]
      gltf.bufferViews.push({
        buffer: 0,
        byteOffset: currentOffset,
        byteLength: posBuffer.byteLength,
        target: 34962, // ARRAY_BUFFER
      })
      gltf.accessors.push({
        bufferView: gltf.bufferViews.length - 1,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: posBuffer.byteLength / 12,
        type: "VEC3",
        max: [10, 10, 10],
        min: [-10, -10, -10],
      })
      currentOffset += posBuffer.byteLength

      // Normal accessor (if exists)
      if (primitive.attributes.NORMAL !== undefined) {
        const normBuffer = buffers[meshIndex * 3 + 1]
        gltf.bufferViews.push({
          buffer: 0,
          byteOffset: currentOffset,
          byteLength: normBuffer.byteLength,
          target: 34962,
        })
        gltf.accessors.push({
          bufferView: gltf.bufferViews.length - 1,
          byteOffset: 0,
          componentType: 5126,
          count: normBuffer.byteLength / 12,
          type: "VEC3",
        })
        currentOffset += normBuffer.byteLength
      }

      // Indices accessor (if exists)
      if (primitive.indices !== undefined) {
        const indBuffer = buffers[meshIndex * 3 + 2]
        gltf.bufferViews.push({
          buffer: 0,
          byteOffset: currentOffset,
          byteLength: indBuffer.byteLength,
          target: 34963, // ELEMENT_ARRAY_BUFFER
        })
        gltf.accessors.push({
          bufferView: gltf.bufferViews.length - 1,
          byteOffset: 0,
          componentType: 5123, // UNSIGNED_SHORT
          count: indBuffer.byteLength / 2,
          type: "SCALAR",
        })
        currentOffset += indBuffer.byteLength
      }
    })

    gltf.combinedBuffer = this.combineBuffers(buffers)

    return gltf
  }

  private combineBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    let totalLength = 0
    for (const buffer of buffers) {
      totalLength += buffer.byteLength
    }

    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const buffer of buffers) {
      combined.set(new Uint8Array(buffer), offset)
      offset += buffer.byteLength
    }

    return combined.buffer
  }

  private toGLB(gltf: any): ArrayBuffer {
    const jsonString = JSON.stringify(gltf)
    const jsonBuffer = new TextEncoder().encode(jsonString)

    // Выравнивание по 4 байта
    const jsonLength = Math.ceil(jsonBuffer.length / 4) * 4
    const jsonPadded = new Uint8Array(jsonLength)
    jsonPadded.set(jsonBuffer)
    for (let i = jsonBuffer.length; i < jsonLength; i++) {
      jsonPadded[i] = 0x20 // пробел
    }

    const binaryBuffer = gltf.combinedBuffer
    const binaryLength = Math.ceil(binaryBuffer.byteLength / 4) * 4
    const binaryPadded = new Uint8Array(binaryLength)
    binaryPadded.set(new Uint8Array(binaryBuffer))

    // GLB формат: заголовок + JSON chunk + Binary chunk
    const totalLength = 12 + 8 + jsonLength + 8 + binaryLength
    const glb = new ArrayBuffer(totalLength)
    const view = new DataView(glb)

    let offset = 0

    // Заголовок GLB
    view.setUint32(offset, 0x46546c67, true) // magic: "glTF"
    offset += 4
    view.setUint32(offset, 2, true) // version: 2
    offset += 4
    view.setUint32(offset, totalLength, true) // length
    offset += 4

    // JSON chunk
    view.setUint32(offset, jsonLength, true) // chunkLength
    offset += 4
    view.setUint32(offset, 0x4e4f534a, true) // chunkType: "JSON"
    offset += 4
    new Uint8Array(glb, offset, jsonLength).set(jsonPadded)
    offset += jsonLength

    // Binary chunk
    view.setUint32(offset, binaryLength, true) // chunkLength
    offset += 4
    view.setUint32(offset, 0x004e4942, true) // chunkType: "BIN\0"
    offset += 4
    new Uint8Array(glb, offset, binaryLength).set(binaryPadded)

    return glb
  }
}

export async function convertToGLB(object: THREE.Object3D): Promise<Blob> {
  const exporter = new GLTFExporter()
  const glbBuffer = await exporter.parse(object)
  return new Blob([glbBuffer], { type: "model/gltf-binary" })
}
