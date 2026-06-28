import * as THREE from 'three';
import { WORLD_GLOBE_RADIUS } from '../../../lib/world';

export const WORLD_GLOBE_TEXTURE_PATHS = {
  base: [
    '/images/world/earth-atlas-base-4k.webp',
    '/images/world/earth-atlas-base.png',
  ],
  borders: [
    '/images/world/earth-atlas-borders-4k.webp',
    '/images/world/earth-atlas-borders.png',
  ],
} as const;

export const WORLD_GLOBE_LAYER_RADII = {
  base: WORLD_GLOBE_RADIUS,
  borders: WORLD_GLOBE_RADIUS + 0.006,
  wireframe: WORLD_GLOBE_RADIUS + 0.012,
  atmosphere: WORLD_GLOBE_RADIUS + 0.18,
} as const;

export type WorldGlobeLayers = {
  baseGlobeMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  borderOverlayMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  wireframeMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  atmosphereMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
};

export type WorldGlobeResources = {
  group: THREE.Group;
  layers: WorldGlobeLayers;
  disposeTextureLoading: () => void;
};

type AtlasTextureLoader = Pick<THREE.TextureLoader, 'load'>;
type AtlasTexturePath =
  (typeof WORLD_GLOBE_TEXTURE_PATHS)[keyof typeof WORLD_GLOBE_TEXTURE_PATHS][number];

export function areGlobeLayerRadiiOrdered(): boolean {
  return (
    WORLD_GLOBE_LAYER_RADII.base < WORLD_GLOBE_LAYER_RADII.borders &&
    WORLD_GLOBE_LAYER_RADII.borders < WORLD_GLOBE_LAYER_RADII.wireframe &&
    WORLD_GLOBE_LAYER_RADII.wireframe < WORLD_GLOBE_LAYER_RADII.atmosphere
  );
}

export function configureAtlasTexture(texture: THREE.Texture): THREE.Texture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.max(texture.anisotropy, 4);
  texture.needsUpdate = true;
  return texture;
}

export function applyBaseTexture(
  material: THREE.MeshStandardMaterial,
  texture: THREE.Texture,
): void {
  material.map?.dispose();
  material.map = configureAtlasTexture(texture);
  material.color.set(0xffffff);
  material.emissive.set(0x150f24);
  material.emissiveIntensity = 0.18;
  material.needsUpdate = true;
}

export function applyBorderTexture(
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>,
  texture: THREE.Texture,
): void {
  mesh.material.map?.dispose();
  mesh.material.map = configureAtlasTexture(texture);
  mesh.material.opacity = 0.58;
  mesh.material.needsUpdate = true;
  mesh.visible = true;
}

function loadTextureWithFallback(
  textureLoader: AtlasTextureLoader,
  paths: readonly AtlasTexturePath[],
  onLoad: (texture: THREE.Texture) => void,
): void {
  const [currentPath, ...fallbackPaths] = paths;
  if (!currentPath) return;

  textureLoader.load(
    currentPath,
    onLoad,
    undefined,
    () => {
      loadTextureWithFallback(textureLoader, fallbackPaths, onLoad);
    },
  );
}

export function createWorldGlobe(
  textureLoader: AtlasTextureLoader = new THREE.TextureLoader(),
): WorldGlobeResources {
  const group = new THREE.Group();
  let disposed = false;

  const baseGlobeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(WORLD_GLOBE_LAYER_RADII.base, 72, 72),
    new THREE.MeshStandardMaterial({
      color: 0x14111f,
      roughness: 0.82,
      metalness: 0.12,
      emissive: 0x1f1238,
      emissiveIntensity: 0.38,
    }),
  );

  const borderOverlayMesh = new THREE.Mesh(
    new THREE.SphereGeometry(WORLD_GLOBE_LAYER_RADII.borders, 72, 72),
    new THREE.MeshBasicMaterial({
      color: 0xbdd7ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  borderOverlayMesh.visible = false;

  const wireframeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(WORLD_GLOBE_LAYER_RADII.wireframe, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    }),
  );

  const atmosphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(WORLD_GLOBE_LAYER_RADII.atmosphere, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );

  group.add(baseGlobeMesh, borderOverlayMesh, wireframeMesh, atmosphereMesh);

  loadTextureWithFallback(
    textureLoader,
    WORLD_GLOBE_TEXTURE_PATHS.base,
    (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      applyBaseTexture(baseGlobeMesh.material, texture);
    },
  );

  loadTextureWithFallback(
    textureLoader,
    WORLD_GLOBE_TEXTURE_PATHS.borders,
    (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      applyBorderTexture(borderOverlayMesh, texture);
    },
  );

  return {
    group,
    layers: {
      baseGlobeMesh,
      borderOverlayMesh,
      wireframeMesh,
      atmosphereMesh,
    },
    disposeTextureLoading: () => {
      disposed = true;
    },
  };
}
