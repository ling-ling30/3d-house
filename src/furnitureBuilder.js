import * as THREE from 'three';

// Clean architectural empty layout (furniture removed as requested)
export function buildFurniture(scene, colliders, enabled = false) {
  const furnitureGroup = new THREE.Group();
  furnitureGroup.name = "furnitureGroup";

  if (!enabled) {
    scene.add(furnitureGroup);
    return furnitureGroup;
  }

  // (Optional furniture can be re-enabled later once layout plan is finalized)
  scene.add(furnitureGroup);
  return furnitureGroup;
}
