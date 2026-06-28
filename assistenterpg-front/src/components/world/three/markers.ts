import * as THREE from 'three';
import type { WorldAtlasItem, WorldAtlasKind } from '@/lib/world';
import {
  WORLD_GLOBE_RADIUS,
  getAtlasItemCategory,
  latLngToVector3Data,
} from '@/lib/world';

type MarkerMaterial = THREE.SpriteMaterial | THREE.MeshBasicMaterial;

export type AtlasMarkerRecord = {
  itemId: string;
  group: THREE.Group;
  material: MarkerMaterial;
  baseColor: THREE.Color;
};

type MarkerVisualStyle = {
  color: number;
  scale: number;
  opacity: number;
};

const CATEGORY_STYLES: Record<WorldAtlasKind, MarkerVisualStyle> = {
  LOCAL: {
    color: 0x7dd3fc,
    scale: 0.18,
    opacity: 0.9,
  },
  SUBLOCAL: {
    color: 0xc4b5fd,
    scale: 0.11,
    opacity: 0.78,
  },
  INSTITUICAO: {
    color: 0xa78bfa,
    scale: 0.145,
    opacity: 0.88,
  },
  BARREIRA: {
    color: 0x38bdf8,
    scale: 0.16,
    opacity: 0.22,
  },
};

const VISUAL_COLOR_BY_KEY: Record<NonNullable<WorldAtlasItem['corVisual']>, number> = {
  cinza: 0x94a3b8,
  roxo: 0xa78bfa,
  coral: 0xfb7185,
  ciano: 0x67e8f9,
  dourado: 0xfacc15,
};

function createVectorFromItem(
  item: WorldAtlasItem,
  radius: number,
): THREE.Vector3 {
  const point = latLngToVector3Data(item.lat, item.lng, radius);
  return new THREE.Vector3(point.x, point.y, point.z);
}

function getMarkerStyle(item: WorldAtlasItem): MarkerVisualStyle {
  const category = getAtlasItemCategory(item);
  const base = CATEGORY_STYLES[category];
  const color = item.corVisual ? VISUAL_COLOR_BY_KEY[item.corVisual] : base.color;

  return {
    ...base,
    color,
  };
}

function drawMarkerTexture(
  item: WorldAtlasItem,
  canvas: HTMLCanvasElement,
): void {
  const context = canvas.getContext('2d');
  if (!context) return;

  const size = canvas.width;
  const center = size / 2;

  context.clearRect(0, 0, size, size);
  context.save();
  context.translate(center, center);
  context.strokeStyle = 'rgba(255, 255, 255, 0.82)';
  context.fillStyle = 'rgba(255, 255, 255, 0.94)';
  context.shadowColor = 'rgba(255, 255, 255, 0.75)';
  context.shadowBlur = item.kind === 'SUBLOCAL' ? 10 : 16;

  if (item.kind === 'INSTITUICAO') {
    context.beginPath();
    context.moveTo(0, -31);
    context.lineTo(31, 0);
    context.lineTo(0, 31);
    context.lineTo(-31, 0);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 5;
    context.stroke();
    context.beginPath();
    context.arc(0, 0, 8, 0, Math.PI * 2);
    context.fillStyle = 'rgba(8, 5, 18, 0.82)';
    context.fill();
    context.restore();
    return;
  }

  if (item.kind === 'SUBLOCAL') {
    context.beginPath();
    context.moveTo(0, -18);
    context.lineTo(18, 0);
    context.lineTo(0, 18);
    context.lineTo(-18, 0);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 3;
    context.stroke();
    context.restore();
    return;
  }

  context.beginPath();
  context.arc(0, 0, 24, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.lineWidth = 4;
  context.stroke();
  context.beginPath();
  context.arc(0, 0, 8, 0, Math.PI * 2);
  context.fillStyle = 'rgba(8, 5, 18, 0.82)';
  context.fill();
  context.restore();
}

function createMarkerSprite(
  item: WorldAtlasItem,
  style: MarkerVisualStyle,
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  drawMarkerTexture(item, canvas);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    color: style.color,
    transparent: true,
    opacity: style.opacity,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(style.scale);
  sprite.userData.itemId = item.id;

  return sprite;
}

function orientGroupToGlobe(group: THREE.Group, position: THREE.Vector3): void {
  group.position.copy(position);
  group.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    position.clone().normalize(),
  );
}

function createBarrierField(
  item: WorldAtlasItem,
  style: MarkerVisualStyle,
  interactiveObjects: THREE.Object3D[],
): {
  group: THREE.Group;
  material: THREE.MeshBasicMaterial;
  baseColor: THREE.Color;
} {
  const isGreatBarrier =
    item.kind === 'BARREIRA' && item.barrierType === 'GRANDE_BARREIRA';
  const group = new THREE.Group();
  const color = new THREE.Color(style.color);
  const fieldRadius = isGreatBarrier ? 0.23 : 0.13;
  const ringOuterRadius = isGreatBarrier ? 0.285 : 0.165;
  const ringInnerRadius = isGreatBarrier ? 0.245 : 0.138;

  group.userData.itemId = item.id;
  orientGroupToGlobe(
    group,
    createVectorFromItem(item, WORLD_GLOBE_RADIUS + 0.06),
  );

  const fillMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: isGreatBarrier ? 0.13 : 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ringMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: isGreatBarrier ? 0.22 : 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const fill = new THREE.Mesh(
    new THREE.CircleGeometry(fieldRadius, 64),
    fillMaterial,
  );
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, 72),
    ringMaterial,
  );

  fill.userData.itemId = item.id;
  ring.userData.itemId = item.id;
  group.add(fill, ring);
  interactiveObjects.push(fill, ring);

  return {
    group,
    material: ringMaterial,
    baseColor: color,
  };
}

export function createAtlasMarker(
  item: WorldAtlasItem,
  interactiveObjects: THREE.Object3D[],
): AtlasMarkerRecord {
  const style = getMarkerStyle(item);

  if (item.kind === 'BARREIRA') {
    const barrier = createBarrierField(item, style, interactiveObjects);

    return {
      itemId: item.id,
      ...barrier,
    };
  }

  const group = new THREE.Group();
  const color = new THREE.Color(style.color);
  const sprite = createMarkerSprite(item, style);

  group.userData.itemId = item.id;
  orientGroupToGlobe(
    group,
    createVectorFromItem(item, WORLD_GLOBE_RADIUS + 0.075),
  );
  group.add(sprite);
  interactiveObjects.push(sprite);

  return {
    itemId: item.id,
    group,
    material: sprite.material,
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
