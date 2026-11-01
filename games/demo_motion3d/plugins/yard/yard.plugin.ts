// yard: demo_motion3d's own plugin, what the yard's stations have that no shape is, drawn from the rows
// every seat has. It has no row, no server half and no numbers of its own: it reads each off the
// definition of the kind whose row it draws (`assets/demo_motion3d.json`), which the yard's writer fills
// (`assets/yard.mjs`).
//   swingzone  the swing's rope, its definition's `rope` `{ colour, radius }`, from where it hangs, its
//              `pivot` [x, y, z] metres from the zone's row: to the middle of the hands of a body
//              swinging from it (in the zone's `swing` activity), as this page draws them; else
//              hanging straight down its `length` metres
//   pool       the water, its definition's `look` `{ colour, opacity }`, a sheet `water.size` [across,
//              along] metres, its middle `water.at` [x, y, z] from the pool's row
// It draws in its `afterTick`, once motion3d has drawn the bodies and bent their limbs, so it is
// listed after them (as `shipped`, with `yard` in `world.shipped.plugins`), and before render3d. Its mod
// for motion3d, `yard.motion3d.ts`, hands motion3d the frame the car is drawn in.
import type * as THREE from 'three'
import type { Plugins } from '#engine/browser.ts'
import type { Row } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'

type Three = typeof import('three')

export function yard() {
  const ropes = new Map<number, THREE.Mesh>()
  const waters = new Map<number, THREE.Mesh>()
  const owned: { dispose(): void }[] = []
  let scene: THREE.Scene | undefined

  // A row's place as a three.js vector, `at` from it.
  const from = (T: Three, r: Row, at: number[]) => new T.Vector3(r.data.pos[0] + at[0], r.data.pos[1] + at[1], r.data.pos[2] + at[2])

  // The middle of a body's hands as this page draws it, or undefined while it has no model.
  function hands(T: Three, plugins: Plugins, id: number): THREE.Vector3 | undefined {
    const l = plugins.motion3d.socket(id, 'LeftHand'), r = plugins.motion3d.socket(id, 'RightHand')
    if (!l || !r) return undefined
    return l.getWorldPosition(new T.Vector3()).add(r.getWorldPosition(new T.Vector3())).multiplyScalar(0.5)
  }

  function rope(T: Three, plugins: Plugins, zone: Row) {
    const k = def(plugins.wire, zone.kind)
    let mesh = ropes.get(zone.id)
    if (!mesh) {
      const geometry = new T.CylinderGeometry(k.rope.radius, k.rope.radius, 1, 6)
      geometry.translate(0, 0.5, 0)
      const material = new T.MeshStandardMaterial({ color: k.rope.colour, roughness: 0.9 })
      plugins.render3d.dress(material)
      owned.push(geometry, material)
      mesh = new T.Mesh(geometry, material)
      mesh.castShadow = true
      scene!.add(mesh)
      ropes.set(zone.id, mesh)
    }
    const top = from(T, zone, k.pivot)
    const swinging = plugins.wire.rows.find(r => r.data.activity === 'swing' && r.data.space === zone.id)
    const end = (swinging && hands(T, plugins, swinging.id)) ?? top.clone().add(new T.Vector3(0, -k.length, 0))
    // From the end up to the pivot: the cylinder's length along its up.
    const along = top.clone().sub(end)
    mesh.position.copy(end)
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), along.clone().normalize())
    mesh.scale.set(1, along.length(), 1)
    mesh.updateMatrixWorld(true)
  }

  function water(T: Three, plugins: Plugins, pool: Row) {
    const k = def(plugins.wire, pool.kind)
    let mesh = waters.get(pool.id)
    if (!mesh) {
      const geometry = new T.PlaneGeometry(k.water.size[0], k.water.size[1])
      geometry.rotateX(-Math.PI / 2)
      const material = new T.MeshStandardMaterial({ color: k.look.colour, roughness: 0.1, transparent: true, opacity: k.look.opacity, depthWrite: false })
      plugins.render3d.dress(material)
      owned.push(geometry, material)
      mesh = new T.Mesh(geometry, material)
      mesh.receiveShadow = true
      scene!.add(mesh)
      waters.set(pool.id, mesh)
    }
    mesh.position.copy(from(T, pool, k.water.at))
    mesh.updateMatrixWorld(true)
  }

  return {
    afterTick(plugins: Plugins) {
      if (!plugins.render3d) throw new Error('yard draws through render3d, which this scene does not list')
      const T: Three = plugins.render3d.THREE
      scene = plugins.render3d.scene
      const seen = new Set<number>()
      for (const r of plugins.wire.rows) {
        if (r.kind === 'swingzone') rope(T, plugins, r)
        else if (r.kind === 'pool') water(T, plugins, r)
        else continue
        seen.add(r.id)
      }
      for (const [id, mesh] of [...ropes, ...waters]) {
        if (seen.has(id)) continue
        mesh.removeFromParent()
        ropes.delete(id)
        waters.delete(id)
      }
    },
    close() {
      for (const mesh of [...ropes.values(), ...waters.values()]) mesh.removeFromParent()
      for (const o of owned) o.dispose()
      ropes.clear()
      waters.clear()
      owned.length = 0
    },
  }
}
