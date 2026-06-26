import * as THREE from 'three';

const MATERIAL_TEXTURE_KEYS = [
  'alphaMap',
  'aoMap',
  'bumpMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'gradientMap',
  'lightMap',
  'map',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'sheenColorMap',
  'sheenRoughnessMap',
  'specularMap',
  'thicknessMap',
  'transmissionMap',
] as const;

function disposeMaterialTextures(
  material: THREE.Material,
  disposedTextures: Set<THREE.Texture>,
): void {
  const materialRecord = material as unknown as Record<
    (typeof MATERIAL_TEXTURE_KEYS)[number],
    unknown
  >;

  for (const key of MATERIAL_TEXTURE_KEYS) {
    const texture = materialRecord[key];
    if (texture instanceof THREE.Texture && !disposedTextures.has(texture)) {
      texture.dispose();
      disposedTextures.add(texture);
    }
  }
}

function disposeMaterial(
  material: THREE.Material | THREE.Material[],
  disposedTextures: Set<THREE.Texture>,
): void {
  if (Array.isArray(material)) {
    for (const entry of material) {
      disposeMaterialTextures(entry, disposedTextures);
      entry.dispose();
    }
    return;
  }

  disposeMaterialTextures(material, disposedTextures);
  material.dispose();
}

export function disposeObjectTree(root: THREE.Object3D): void {
  const disposedTextures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      disposeMaterial(object.material, disposedTextures);
    }
  });
}
