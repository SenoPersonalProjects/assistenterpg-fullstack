import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { raycastAtlasItemId } from './raycast';

function createElementStub(): HTMLElement {
  return {
    getBoundingClientRect: () =>
      ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect,
  } as HTMLElement;
}

describe('raycastAtlasItemId', () => {
  it('updates camera and world matrices before raycasting', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10);
    const worldGroup = new THREE.Group();
    const cameraSpy = vi.spyOn(camera, 'updateMatrixWorld');
    const worldSpy = vi.spyOn(worldGroup, 'updateMatrixWorld');

    const result = raycastAtlasItemId({
      clientX: 50,
      clientY: 50,
      element: createElementStub(),
      camera,
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      interactiveObjects: [],
      worldGroup,
      visibleItemIds: new Set(),
    });

    expect(result).toBeNull();
    expect(cameraSpy).toHaveBeenCalledWith(true);
    expect(worldSpy).toHaveBeenCalledWith(true);
  });
});
