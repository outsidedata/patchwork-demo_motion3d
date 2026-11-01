// demo_motion3d's bake, `yarn bake demo_motion3d` (core's `scripts/bake.ts`): every built file the
// scene's catalogue names, written where the catalogue reads it.
//   xbot.glb             Mixamo's X Bot (the library's `characters/xbot/xbot.fbx`) with every clip of
//                        `xbot.rig.json` baked onto it by anim's export (`plugins/anim/anim.export.py`),
//                        which packs it with gltfpack
//   xbot.rig.baked.json  the rig's measured `table`, `ends`, `grips` and `touches`, gathered by the mixamo
//                        skill's `merge-table.mjs`; `xbot.rig.json` is never written
//   the yard's stations  `main.scene.json`'s shapes3d kinds, prefabs and actors of the stations past the
//                        wall and the chair, and `demo_motion3d.json`'s car, pool and rope swing, each
//                        sized to the clips just measured (`yard.mjs`)
//   the offsets          `xbot.motion3d.baked.json`, each clip's two offsets for each body, from the
//                        clips just measured, each clip's sidecar and `xbot.motion3d.json`'s `moves` and
//                        `turns` (motion3d's `motion3d.offsets.ts`)
//   cup.glb              the cup the X Bot carries, with its `handle` (`cup.mjs`)
//   the stances' props   greatsword.glb, sword.glb, shield.glb, axe.glb, pistol.glb, bow.glb,
//                        torch.glb and wand.glb, the stand-ins each stance carries, with their `grip`
//                        and, held in two hands, `second` (`props.mjs`)
//   checker-1024.webp    the ground's checkerboard, drawn here from nothing: `squares`
//                        squares a side in two greys, `light` and `dark`, each with a `line` pixel rim
//                        of `rim` grey, so a repeat of the map is `squares` squares across
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import type { Tools } from '#scripts/bake.ts'

const here = import.meta.dirname
const root = path.join(here, '..', '..', '..')

const SIZE = 1024
const CHECKER = { squares: 2, light: 0xd4, dark: 0xa8, rim: 0x86, line: 3 }

const node = (args: string[]) =>
  new Promise<string>((done, fail) => execFile(process.execPath, args, (e, stdout, stderr) =>
    e ? fail(new Error(`node ${args.join(' ')} failed:\n${stdout}${stderr}`)) : done(`${stdout}${stderr}`)))

// A PNG of grey pixels, `size` a side: its signature, IHDR, one IDAT of the filtered rows, IEND.
function png(size: number, grey: (x: number, y: number) => number): Buffer {
  const table = new Uint32Array(256).map((_, n) => {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  })
  const crc = (b: Buffer) => {
    let c = 0xffffffff
    for (const v of b) c = table[(c ^ v) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type: string, data: Buffer) => {
    const head = Buffer.alloc(4)
    head.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const tail = Buffer.alloc(4)
    tail.writeUInt32BE(crc(body))
    return Buffer.concat([head, body, tail])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bits a sample
  ihdr[9] = 0 // greyscale
  const rows = Buffer.alloc(size * (size + 1))
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) rows[y * (size + 1) + 1 + x] = grey(x, y)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

export default async ({ blender, webp, scratch }: Tools) => {
  // the checkerboard
  const cell = SIZE / CHECKER.squares
  const raw = scratch('checker.png')
  fs.writeFileSync(raw, png(SIZE, (x, y) => {
    const i = Math.floor(x / cell), j = Math.floor(y / cell)
    const u = x - i * cell, v = y - j * cell
    const edge = Math.min(u, v, cell - 1 - u, cell - 1 - v) < CHECKER.line
    return edge ? CHECKER.rim : (i + j) % 2 ? CHECKER.dark : CHECKER.light
  }))
  const checker = path.join(here, `checker-${SIZE}.webp`)
  await webp(raw, checker, SIZE)
  console.log('wrote', path.relative(root, checker))

  // the X Bot and its clips, and the rig's measures
  const rig = path.join(here, 'xbot.rig.json')
  const table = scratch('xbot.table.json')
  const glb = path.join(here, 'xbot.glb')
  console.log(await blender(['--factory-startup', '--python-exit-code', '1', '--python', path.join(root, 'plugins', 'anim', 'anim.export.py'), '--', rig, table, `xbot=${glb}`]))
  const merged = scratch('xbot.merged.json')
  console.log(await node([path.join(root, '.claude', 'skills', 'using-mixamo-assets', 'scripts', 'merge-table.mjs'), rig, table, merged]))
  const { table: measured, ends, grips, touches } = JSON.parse(fs.readFileSync(merged, 'utf8'))
  const baked = path.join(here, 'xbot.rig.baked.json')
  fs.writeFileSync(baked, JSON.stringify({ table: measured, ends, grips, touches }) + '\n')
  console.log('wrote', path.relative(root, baked))
  console.log('wrote', path.relative(root, glb))
  // the yard's stations, sized to the clips just measured
  console.log(await node([path.join(here, 'yard.mjs')]))
  // the cup the X Bot carries
  console.log(await node([path.join(here, 'cup.mjs')]))
  // the stand-ins the stances carry
  console.log(await node([path.join(here, 'props.mjs')]))
  // each held clip's offsets for each body, from the clips just measured, into xbot.motion3d.baked.json
  console.log(await node(['--experimental-strip-types', path.join(root, 'plugins', 'motion3d', 'motion3d.offsets.ts'), rig, path.join(here, 'xbot.motion3d.json')]))
}
