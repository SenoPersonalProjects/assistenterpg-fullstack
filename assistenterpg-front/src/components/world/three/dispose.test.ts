import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { disposeObjectTree } from './dispose';

describe('disposeObjectTree', () => {
  it('disposes material textures before disposing the material', () => {
    const texture = new THREE.Texture();
    const textureDisposeSpy = vi.spyOn(texture, 'dispose');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const materialDisposeSpy = vi.spyOn(material, 'dispose');
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1), material);

    disposeObjectTree(mesh);

    expect(textureDisposeSpy).toHaveBeenCalledTimes(1);
    expect(materialDisposeSpy).toHaveBeenCalledTimes(1);
  });

  it('disposes a shared texture only once', () => {
    const texture = new THREE.Texture();
    const textureDisposeSpy = vi.spyOn(texture, 'dispose');
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1), material);

    disposeObjectTree(mesh);

    expect(textureDisposeSpy).toHaveBeenCalledTimes(1);
  });
});
