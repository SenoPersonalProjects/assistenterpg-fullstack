import * as THREE from 'three';
import type { WorldAtlasCategory, WorldAtlasItem } from '@/lib/world';
import {
  WORLD_GLOBE_RADIUS,
  getAtlasItemCategory,
  latLngToVector3Data,
} from '@/lib/world';

export type AtlasMarkerRecord = {
  itemId: string;
  group: THREE.Group;
  material: THREE.MeshBasicMaterial;
  baseColor: THREE.Color;
};

const CATEGORY_COLORS: Record<WorldAtlasCategory, number> = {
  ESCOLA: 0x8b5cf6,
  BARREIRA: 0x38bdf8,
  ORGANIZACAO: 0xf97316,
  REGIAO_OCULTA: 0xef4444,
};

function createVectorFromItem(
  item: WorldAtlasItem,
  radius: number,
): THREE.Vector3 {
  const point = latLngToVector3Data(item.lat, item.lng, radius);
  return new THREE.Vector3(point.x, point.y, point.z);
}

export function createAtlasMarker(
  item: WorldAtlasItem,
  interactiveObjects: THREE.Object3D[],
): AtlasMarkerRecord {
  const category = getAtlasItemCategory(item);
  const color = new THREE.Color(CATEGORY_COLORS[category]);
  const group = new THREE.Group();
  group.userData.itemId = item.id;

  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.96,
    depthTest: true,
  });

  const position = createVectorFromItem(item, WORLD_GLOBE_RADIUS + 0.055);
  group.position.copy(position);
  group.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    position.clone().normalize(),
  );

  if (category === 'BARREIRA') {
    const isGreatBarrier =
      item.kind === 'barrier' && item.barrierType === 'GRANDE_BARREIRA';
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(
        isGreatBarrier ? 0.068 : 0.052,
        isGreatBarrier ? 0.13 : 0.096,
        48,
      ),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isGreatBarrier ? 0.72 : 0.85,
        side: THREE.DoubleSide,
      }),
    );

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(isGreatBarrier ? 0.032 : 0.026, 16, 16),
      material,
    );

    if (isGreatBarrier) {
      const outerPulse = new THREE.Mesh(
        new THREE.RingGeometry(0.145, 0.17, 48),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        }),
      );
      group.add(outerPulse);
    }

    group.add(ring, core);
    interactiveObjects.push(ring, core);
  } else if (category === 'REGIAO_OCULTA') {
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.074, 0),
      material,
    );
    group.add(marker);
    interactiveObjects.push(marker);
  } else {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 20, 20),
      material,
    );
    group.add(marker);
    interactiveObjects.push(marker);
  }

  return {
    itemId: item.id,
    group,
    material,
    baseColor: color,
  };
}

export function updateAtlasMarkerVisibility(
  records: AtlasMarkerRecord[],
  visibleItemIds: Set<string>,
): void {
  for (const record of records) {
    record.group.visible = visibleItemIds.has(record.itemId);
  }
}
