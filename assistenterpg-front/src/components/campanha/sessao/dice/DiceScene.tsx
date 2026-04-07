'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DiceSceneProps = {
  faces: number;
  isRolling: boolean;
  result: number | null;
  onRollComplete?: () => void;
  reducedMotion?: boolean;
};

type DiceSceneState = {
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  mesh?: THREE.Mesh;
  plane?: THREE.Mesh | undefined;
  cleanup?: () => void;
};

function createD10Geometry() {
  const vertices: number[] = [];
  const indices: number[] = [];
  const radius = 1.2;
  const top = 0.8;
  const bottom = -0.8;

  vertices.push(0, top + 0.4, 0);
  for (let i = 0; i < 5; i += 1) {
    const angle = (i * 2 * Math.PI) / 5;
    vertices.push(Math.cos(angle) * radius, top * 0.2, Math.sin(angle) * radius);
  }
  for (let i = 0; i < 5; i += 1) {
    const angle = ((i + 0.5) * 2 * Math.PI) / 5;
    vertices.push(Math.cos(angle) * radius, bottom * 0.2, Math.sin(angle) * radius);
  }
  vertices.push(0, bottom - 0.4, 0);

  for (let i = 0; i < 5; i += 1) {
    indices.push(0, i + 1, ((i + 1) % 5) + 1);
  }
  for (let i = 0; i < 5; i += 1) {
    indices.push(i + 1, i + 6, ((i + 1) % 5) + 1);
    indices.push(((i + 1) % 5) + 1, i + 6, ((i + 1) % 5) + 6);
  }
  for (let i = 0; i < 5; i += 1) {
    indices.push(11, ((i + 1) % 5) + 6, i + 6);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createDieGeometry(faces: number) {
  switch (faces) {
    case 4:
      return new THREE.TetrahedronGeometry(1.4);
    case 8:
      return new THREE.OctahedronGeometry(1.3);
    case 10:
      return createD10Geometry();
    case 12:
      return new THREE.DodecahedronGeometry(1.2);
    case 20:
      return new THREE.IcosahedronGeometry(1.3);
    default:
      return new THREE.BoxGeometry(1.8, 1.8, 1.8);
  }
}

function getDieColor(faces: number) {
  switch (faces) {
    case 4:
      return { main: 0x22c55e, emissive: 0x0a5e2a };
    case 6:
      return { main: 0xe2b340, emissive: 0x6b4f10 };
    case 8:
      return { main: 0x3b82f6, emissive: 0x1a3a6e };
    case 10:
      return { main: 0xf97316, emissive: 0x6b3008 };
    case 12:
      return { main: 0xa855f7, emissive: 0x4a1d6e };
    case 20:
      return { main: 0xef4444, emissive: 0x6b1a1a };
    default:
      return { main: 0xe2b340, emissive: 0x6b4f10 };
  }
}

function makeNumberTexture(value: number) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.Texture();
  }

  ctx.clearRect(0, 0, size, size);

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    10,
    size / 2,
    size / 2,
    size / 2 - 8,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.30)');
  gradient.addColorStop(1, 'rgba(255,255,255,0.04)');
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  const label = String(value);
  const fontSize = label.length >= 3 ? 180 : label.length === 2 ? 220 : 260;
  ctx.font = `900 ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(label, size / 2, size / 2 + 8);

  return new THREE.CanvasTexture(canvas);
}

function makeD6Materials(faces: number, value: number | null) {
  const { main, emissive } = getDieColor(faces);
  const base = () =>
    new THREE.MeshPhongMaterial({
      color: main,
      emissive,
      emissiveIntensity: 0.3,
      shininess: 90,
    });
  if (value === null) {
    return Array.from({ length: 6 }, () => base());
  }
  const texture = makeNumberTexture(value);
  return Array.from({ length: 6 }, (_, index) =>
    index === 4
      ? new THREE.MeshPhongMaterial({
          color: main,
          emissive,
          emissiveIntensity: 0.3,
          shininess: 90,
          map: texture,
        })
      : base(),
  );
}

function makeFrontPlane(value: number, radius: number) {
  const texture = makeNumberTexture(value);
  const size = radius * 1.1;
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, radius * 0.82);
  plane.renderOrder = 10;
  return plane;
}

function getDieRadius(faces: number) {
  switch (faces) {
    case 4:
      return 1.4;
    case 8:
      return 1.3;
    case 10:
      return 1.2;
    case 12:
      return 1.2;
    case 20:
      return 1.3;
    default:
      return 1.05;
  }
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }
  material.dispose();
}

export function DiceScene({
  faces,
  isRolling,
  result,
  onRollComplete,
  reducedMotion = false,
}: DiceSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<DiceSceneState>({});
  const animRef = useRef<number | null>(null);
  const rollingRef = useRef(false);
  const rollStartRef = useRef(0);
  const hasResultRef = useRef(false);
  const bobTimeRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directional = new THREE.DirectionalLight(0xffffff, 1.2);
    directional.position.set(3, 5, 4);
    scene.add(directional);
    const rim = new THREE.DirectionalLight(0x9ecbff, 0.6);
    rim.position.set(-4, 2, 6);
    scene.add(rim);
    const point = new THREE.PointLight(0xffd700, 0.5, 12);
    point.position.set(-2, 3, 2);
    scene.add(point);

    const geometry = createDieGeometry(faces);
    const { main, emissive } = getDieColor(faces);
    let mesh: THREE.Mesh;

    if (faces === 6) {
      mesh = new THREE.Mesh(geometry, makeD6Materials(faces, null));
    } else {
      mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial({
          color: main,
          emissive,
          emissiveIntensity: 0.3,
          shininess: 90,
          flatShading: true,
        }),
      );
    }

    mesh.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 }),
      ),
    );

    scene.add(mesh);
    stateRef.current = { renderer, scene, camera, mesh };

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const { mesh: currentMesh, plane } = stateRef.current;
      if (!currentMesh) return;

      if (rollingRef.current) {
        const elapsed = (Date.now() - rollStartRef.current) / 1000;
        const duration = reducedMotion ? 0.01 : 0.8;
        if (elapsed < duration) {
          const progress = elapsed / duration;
          const speed = Math.max(0.015, (1 - progress) * 0.3);
          currentMesh.rotation.x += speed * (3 + Math.sin(elapsed * 5));
          currentMesh.rotation.y += speed * (2 + Math.cos(elapsed * 3));
          currentMesh.rotation.z += speed * 1.5;
          currentMesh.position.y =
            Math.abs(Math.sin(elapsed * 6)) * (1 - progress) * 1.2;
        } else {
          rollingRef.current = false;
          currentMesh.position.y = 0;
          if (onRollComplete) onRollComplete();
        }
      } else if (hasResultRef.current) {
        currentMesh.rotation.x += (0 - currentMesh.rotation.x) * 0.06;
        currentMesh.rotation.y += (0 - currentMesh.rotation.y) * 0.06;
        currentMesh.rotation.z += (0 - currentMesh.rotation.z) * 0.06;
        bobTimeRef.current += 0.018;
        currentMesh.position.y = Math.sin(bobTimeRef.current) * 0.07;
        if (plane) {
          const dist =
            Math.abs(currentMesh.rotation.x) +
            Math.abs(currentMesh.rotation.y) +
            Math.abs(currentMesh.rotation.z);
          (plane.material as THREE.Material).opacity = Math.min(1, 1 - dist / 0.5);
        }
      } else {
        currentMesh.rotation.y += 0.004;
        currentMesh.rotation.x += 0.001;
        bobTimeRef.current += 0.012;
        currentMesh.position.y = Math.sin(bobTimeRef.current) * 0.06;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !stateRef.current.renderer || !stateRef.current.camera) {
        return;
      }
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      stateRef.current.camera.aspect = newWidth / newHeight;
      stateRef.current.camera.updateProjectionMatrix();
      stateRef.current.renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    stateRef.current.cleanup = () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (stateRef.current.scene) {
        stateRef.current.scene.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const meshObj = object as THREE.Mesh;
            if (meshObj.geometry) meshObj.geometry.dispose();
            if (meshObj.material) disposeMaterial(meshObj.material);
          }
        });
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      stateRef.current.cleanup?.();
    };
  }, [faces, onRollComplete, reducedMotion]);

  useEffect(() => {
    if (!isRolling) return;
    hasResultRef.current = false;
    rollingRef.current = true;
    rollStartRef.current = Date.now();
    bobTimeRef.current = 0;

    const { mesh, plane } = stateRef.current;
    if (mesh && plane) {
      mesh.remove(plane);
      stateRef.current.plane = undefined;
    }

    if (faces === 6 && mesh) {
      mesh.material = makeD6Materials(faces, null);
    }
  }, [isRolling, faces]);

  useEffect(() => {
    if (result === null || isRolling) return;
    hasResultRef.current = true;
    bobTimeRef.current = 0;

    const { mesh } = stateRef.current;
    if (!mesh) return;

    if (faces === 6) {
      mesh.material = makeD6Materials(faces, result);
      return;
    }

    if (stateRef.current.plane) {
      mesh.remove(stateRef.current.plane);
      stateRef.current.plane = undefined;
    }

    const plane = makeFrontPlane(result, getDieRadius(faces));
    (plane.material as THREE.Material).opacity = 0;
    mesh.add(plane);
    stateRef.current.plane = plane;
  }, [result, isRolling, faces]);

  return <div ref={mountRef} className="w-full h-full" />;
}
