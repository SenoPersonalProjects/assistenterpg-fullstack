import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import {
  WORLD_GLOBE_LAYER_RADII,
  WORLD_GLOBE_TEXTURE_PATHS,
  areGlobeLayerRadiiOrdered,
  createWorldGlobe,
} from './createGlobe';

describe('createWorldGlobe', () => {
  it('keeps globe layer radii ordered to avoid z-fighting', () => {
    expect(areGlobeLayerRadiiOrdered()).toBe(true);
    expect(WORLD_GLOBE_LAYER_RADII.borders).toBeGreaterThan(
      WORLD_GLOBE_LAYER_RADII.base,
    );
    expect(WORLD_GLOBE_LAYER_RADII.wireframe).toBeGreaterThan(
      WORLD_GLOBE_LAYER_RADII.borders,
    );
  });

  it('loads preferred base texture and keeps border overlay hidden when border texture fails', () => {
    const baseTexture = new THREE.Texture();
    const loader = {
      load: (
        url: string,
        onLoad?: (texture: THREE.Texture) => void,
        _onProgress?: (event: ProgressEvent) => void,
        onError?: (error: unknown) => void,
      ) => {
        if (url === WORLD_GLOBE_TEXTURE_PATHS.base[0]) {
          onLoad?.(baseTexture);
        } else {
          onError?.(new Error('missing optional texture'));
        }
        return new THREE.Texture();
      },
    };

    const globe = createWorldGlobe(loader);

    expect(globe.layers.baseGlobeMesh.material.map).toBe(baseTexture);
    expect(globe.layers.baseGlobeMesh.material.color.getHex()).toBe(0xffffff);
    expect(globe.layers.borderOverlayMesh.visible).toBe(false);
  });

  it('falls back to PNG texture when preferred WebP texture fails', () => {
    const fallbackTexture = new THREE.Texture();
    const attemptedUrls: string[] = [];
    const loader = {
      load: (
        url: string,
        onLoad?: (texture: THREE.Texture) => void,
        _onProgress?: (event: ProgressEvent) => void,
        onError?: (error: unknown) => void,
      ) => {
        attemptedUrls.push(url);
        if (url === WORLD_GLOBE_TEXTURE_PATHS.base[1]) {
          onLoad?.(fallbackTexture);
        } else {
          onError?.(new Error('missing texture'));
        }
        return new THREE.Texture();
      },
    };

    const globe = createWorldGlobe(loader);

    expect(attemptedUrls).toContain(WORLD_GLOBE_TEXTURE_PATHS.base[0]);
    expect(attemptedUrls).toContain(WORLD_GLOBE_TEXTURE_PATHS.base[1]);
    expect(globe.layers.baseGlobeMesh.material.map).toBe(fallbackTexture);
  });

  it('disposes late textures instead of applying them after cleanup', () => {
    const pendingLoads: Array<(texture: THREE.Texture) => void> = [];
    const loader = {
      load: (
        _url: string,
        onLoad?: (texture: THREE.Texture) => void,
      ) => {
        if (onLoad) pendingLoads.push(onLoad);
        return new THREE.Texture();
      },
    };
    const lateTexture = new THREE.Texture();
    const disposeSpy = vi.spyOn(lateTexture, 'dispose');

    const globe = createWorldGlobe(loader);
    globe.disposeTextureLoading();
    pendingLoads[0]?.(lateTexture);

    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(globe.layers.baseGlobeMesh.material.map).toBeNull();
  });
});
