// jumppad's browser half. It draws nothing: each pad's mat is shapes3d's, drawn by solids. It is here
// so `world.shipped.plugins` can list jumppad, which is how its mod for kinematics3d is found.
export function jumppad() {
  return {}
}
