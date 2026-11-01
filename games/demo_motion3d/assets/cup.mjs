// Writes cup.glb beside it: a cup, open at the top, its bottom at its origin, `radius` metres round and
// `height` tall, in `colour`; and an empty `handle` on its side, halfway up, the point a carry sets in the
// hand (motion3d's Carries). Run with `node games/demo_motion3d/assets/cup.mjs`.
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const CUP = { radius: 0.04, height: 0.1, sides: 24, colour: [0.85, 0.85, 0.8, 1] }

const pos = [], nrm = [], idx = []
const ring = (y, ny) => {
  const at = pos.length / 3
  for (let i = 0; i <= CUP.sides; i++) {
    const a = (i / CUP.sides) * Math.PI * 2
    pos.push(Math.cos(a) * CUP.radius, y, Math.sin(a) * CUP.radius)
    if (ny === 0) nrm.push(Math.cos(a), 0, Math.sin(a))
    else nrm.push(0, ny, 0)
  }
  return at
}
// The wall, both faces: out, and in for the open top.
for (const side of [1, -1]) {
  const lo = ring(0, 0), hi = ring(CUP.height, 0)
  if (side < 0) for (let i = lo * 3; i < pos.length; i += 3) nrm.splice(i, 3, -nrm[i], 0, -nrm[i + 2])
  for (let i = 0; i < CUP.sides; i++) {
    const a = lo + i, b = lo + i + 1, c = hi + i, d = hi + i + 1
    if (side > 0) idx.push(a, c, b, b, c, d)
    else idx.push(a, b, c, b, d, c)
  }
}
// The bottom, facing down.
const rim = ring(0, -1)
const mid = pos.length / 3
pos.push(0, 0, 0)
nrm.push(0, -1, 0)
for (let i = 0; i < CUP.sides; i++) idx.push(mid, rim + i, rim + i + 1)

const f32 = a => Buffer.from(new Float32Array(a).buffer)
const u16 = a => Buffer.from(new Uint16Array(a).buffer)
const pad = b => (b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4))]) : b)
const bufs = [pad(f32(pos)), pad(f32(nrm)), pad(u16(idx))]
let off = 0
const views = bufs.map((b, i) => {
  const v = { buffer: 0, byteOffset: off, byteLength: b.length, target: i < 2 ? 34962 : 34963 }
  off += b.length
  return v
})
const xs = pos.filter((_, i) => i % 3 === 0), ys = pos.filter((_, i) => i % 3 === 1), zs = pos.filter((_, i) => i % 3 === 2)
const gltf = {
  asset: { version: '2.0', generator: 'cup.mjs' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [
    { name: 'cup', mesh: 0, children: [1] },
    { name: 'handle', translation: [CUP.radius, CUP.height / 2, 0] },
  ],
  meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
  materials: [{ pbrMetallicRoughness: { baseColorFactor: CUP.colour, metallicFactor: 0, roughnessFactor: 0.6 }, doubleSided: true }],
  buffers: [{ byteLength: off }],
  bufferViews: views,
  accessors: [
    { bufferView: 0, componentType: 5126, count: pos.length / 3, type: 'VEC3', min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)], max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)] },
    { bufferView: 1, componentType: 5126, count: nrm.length / 3, type: 'VEC3' },
    { bufferView: 2, componentType: 5123, count: idx.length, type: 'SCALAR' },
  ],
}
const json = Buffer.from(JSON.stringify(gltf))
const jsonChunk = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)])
const bin = Buffer.concat(bufs)
const head = Buffer.alloc(12)
head.writeUInt32LE(0x46546c67, 0)
head.writeUInt32LE(2, 4)
head.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + bin.length, 8)
const chunk = (data, type) => {
  const h = Buffer.alloc(8)
  h.writeUInt32LE(data.length, 0)
  h.writeUInt32LE(type, 4)
  return Buffer.concat([h, data])
}
const out = path.join(import.meta.dirname, 'cup.glb')
writeFileSync(out, Buffer.concat([head, chunk(jsonChunk, 0x4e4f534a), chunk(bin, 0x004e4942)]))
console.log('wrote', out)
