import * as THREE from 'three';
import type {
  WorldAtlasItem,
  WorldAtlasMarkerDisplayState,
} from '@/lib/world';
import { WORLD_GLOBE_RADIUS, latLngToVector3Data } from '@/lib/world';

type MarkerMaterial = THREE.SpriteMaterial | THREE.MeshBasicMaterial;

export type AtlasMarkerRecord = {
  itemId: string;
  group: THREE.Group;
  material: MarkerMaterial;
  visualMaterials: Array<{
    material: MarkerMaterial;
    baseOpacity: number;
  }>;
  baseColor: THREE.Color;
  baseOpacity: number;
  baseScale: number;
};

type MarkerVisualStyle = {
  color: number;
  scale: number;
  opacity: number;
};

const PLACE_SCALE_STYLES = {
  REGIAO: {
    color: 0x7dd3fc,
    scale: 0.14,
    opacity: 0.86,
  },
  ZONA: {
    color: 0x67e8f9,
    scale: 0.12,
    opacity: 0.84,
  },
  SETOR: {
    color: 0xc4b5fd,
    scale: 0.075,
    opacity: 0.78,
  },
} satisfies Record<string, MarkerVisualStyle>;

const INSTITUTION_STYLE: MarkerVisualStyle = {
  color: 0xa78bfa,
  scale: 0.105,
  opacity: 0.86,
};

const BARRIER_STYLE: MarkerVisualStyle = {
  color: 0x38bdf8,
  scale: 0.12,
  opacity: 0.2,
};

const VISUAL_COLOR_BY_KEY: Record<
  NonNullable<WorldAtlasItem['corVisual']>,
  number
> = {
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
  if (item.kind === 'BARREIRA') return BARRIER_STYLE;
  if (item.kind === 'INSTITUICAO') return INSTITUTION_STYLE;

  const base = PLACE_SCALE_STYLES[item.escala];
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
  context.shadowBlur =
    item.kind === 'LUGAR' && item.escala === 'SETOR' ? 8 : 13;

  if (item.kind === 'INSTITUICAO') {
    context.beginPath();
    context.moveTo(0, -29);
    context.lineTo(29, 0);
    context.lineTo(0, 29);
    context.lineTo(-29, 0);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 5;
    context.stroke();
    context.beginPath();
    context.arc(0, 0, 7, 0, Math.PI * 2);
    context.fillStyle = 'rgba(8, 5, 18, 0.82)';
    context.fill();
    context.restore();
    return;
  }

  if (item.kind === 'LUGAR' && item.escala === 'SETOR') {
    context.beginPath();
    context.moveTo(0, -17);
    context.lineTo(17, 0);
    context.lineTo(0, 17);
    context.lineTo(-17, 0);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 3;
    context.stroke();
    context.restore();
    return;
  }

  const radius = item.kind === 'LUGAR' && item.escala === 'REGIAO' ? 22 : 19;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.lineWidth = 4;
  context.stroke();
  context.beginPath();
  context.arc(0, 0, 7, 0, Math.PI * 2);
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
): AtlasMarkerRecord {
  const isGreatBarrier =
    item.kind === 'BARREIRA' && item.barrierType === 'GRANDE_BARREIRA';
  const group = new THREE.Group();
  const color = new THREE.Color(style.color);
  const fieldRadius = isGreatBarrier ? 0.19 : 0.105;
  const ringOuterRadius = isGreatBarrier ? 0.235 : 0.132;
  const ringInnerRadius = isGreatBarrier ? 0.203 : 0.11;

  group.userData.itemId = item.id;
  orientGroupToGlobe(
    group,
    createVectorFromItem(item, WORLD_GLOBE_RADIUS + 0.06),
  );

  const fillMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: isGreatBarrier ? 0.12 : 0.08,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ringMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: isGreatBarrier ? 0.22 : 0.14,
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
    itemId: item.id,
    group,
    material: ringMaterial,
    visualMaterials: [
      {
        material: fillMaterial,
        baseOpacity: fillMaterial.opacity,
      },
      {
        material: ringMaterial,
        baseOpacity: ringMaterial.opacity,
      },
    ],
    baseColor: color,
    baseOpacity: ringMaterial.opacity,
    baseScale: style.scale,
  };
}

export function createAtlasMarker(
  item: WorldAtlasItem,
  interactiveObjects: THREE.Object3D[],
): AtlasMarkerRecord {
  const style = getMarkerStyle(item);

  if (item.kind === 'BARREIRA') {
    return createBarrierField(item, style, interactiveObjects);
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
    visualMaterials: [
      {
        material: sprite.material,
        baseOpacity: style.opacity,
      },
    ],
    baseColor: color,
    baseOpacity: style.opacity,
    baseScale: style.scale,
  };
}

export function updateAtlasMarkerVisibility(
  records: AtlasMarkerRecord[],
  markerStateById: Map<string, WorldAtlasMarkerDisplayState>,
): void {
  for (const record of records) {
    const markerState = markerStateById.get(record.itemId);
    record.group.visible = Boolean(markerState?.visible);

    if (markerState) {
      record.group.scale.setScalar(markerState.scaleMultiplier);
      for (const visualMaterial of record.visualMaterials) {
        visualMaterial.material.opacity =
          visualMaterial.baseOpacity * markerState.opacityMultiplier;
      }
    }
  }
}
