import * as THREE from 'three';

function findMarkerRoot(object: THREE.Object3D | null): THREE.Object3D | null {
  let current = object;
  let matched: THREE.Object3D | null = null;

  while (current) {
    if (typeof current.userData.itemId === 'string') {
      matched = current;
    }
    current = current.parent;
  }

  return matched;
}

function isVisibleInHierarchy(object: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }

  return true;
}

export function raycastAtlasItemId(params: {
  clientX: number;
  clientY: number;
  element: HTMLElement;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  interactiveObjects: THREE.Object3D[];
  worldGroup: THREE.Object3D;
  visibleItemIds: Set<string>;
}): string | null {
  const {
    clientX,
    clientY,
    element,
    camera,
    raycaster,
    pointer,
    interactiveObjects,
    worldGroup,
    visibleItemIds,
  } = params;
  const rect = element.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) return null;

  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  camera.updateMatrixWorld(true);
  worldGroup.updateMatrixWorld(true);
  raycaster.setFromCamera(pointer, camera);

  const intersections = raycaster.intersectObjects(interactiveObjects, true);

  for (const hit of intersections) {
    const root = findMarkerRoot(hit.object);
    const itemId =
      typeof root?.userData.itemId === 'string' ? root.userData.itemId : null;

    if (
      root &&
      itemId &&
      isVisibleInHierarchy(root) &&
      visibleItemIds.has(itemId)
    ) {
      return itemId;
    }
  }

  return null;
}
