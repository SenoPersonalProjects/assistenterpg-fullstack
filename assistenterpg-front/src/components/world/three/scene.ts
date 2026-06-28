import * as THREE from 'three';
import { createWorldGlobe } from './createGlobe';

export type WorldSceneResources = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  worldGroup: THREE.Group;
  disposeTextureLoading: () => void;
};

export function createWorldScene(): WorldSceneResources {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100);
  const worldGroup = new THREE.Group();

  camera.position.set(0, 0.25, 4.6);
  scene.add(worldGroup);
  scene.add(new THREE.AmbientLight(0x9f7aea, 1.6));

  const pointLight = new THREE.PointLight(0x7c3aed, 3, 10);
  pointLight.position.set(3, 2, 4);
  scene.add(pointLight);

  const globe = createWorldGlobe();
  worldGroup.add(globe.group);

  return {
    scene,
    camera,
    worldGroup,
    disposeTextureLoading: globe.disposeTextureLoading,
  };
}
