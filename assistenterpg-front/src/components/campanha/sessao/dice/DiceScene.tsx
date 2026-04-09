'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DiceSceneProps = {
  faces: number;
  isRolling: boolean;
  result: number | null;
  highlight?: 'crit' | 'fumble' | null;
  onRollComplete?: () => void;
  reducedMotion?: boolean;
  rollDurationMs?: number;
};

type DiceSceneState = {
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  mesh?: THREE.Mesh;
  plane?: THREE.Mesh;
  targetQuaternion?: THREE.Quaternion;
  settleStartQuaternion?: THREE.Quaternion;
  spinVelocity?: THREE.Vector3;
  displayFace?: FaceInfo | null;
  accentLight?: THREE.PointLight;
  cleanup?: () => void;
};

type FaceInfo = {
  center: THREE.Vector3;
  normal: THREE.Vector3;
  up: THREE.Vector3;
  area: number;
};

type FaceCluster = {
  normal: THREE.Vector3;
  planeConstant: number;
  area: number;
  weightedCenter: THREE.Vector3;
  vertices: THREE.Vector3[];
};

function createD10Geometry() {
  const top = new THREE.Vector3(0, 1.22, 0);
  const bottom = new THREE.Vector3(0, -1.22, 0);
  const ring: THREE.Vector3[] = [];
  const radius = 1.04;
  const offset = 0.38;

  for (let i = 0; i < 10; i += 1) {
    const angle = (i * Math.PI) / 5;
    ring.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        i % 2 === 0 ? offset : -offset,
        Math.sin(angle) * radius,
      ),
    );
  }

  const vertices = [top, ...ring, bottom];
  const flatVertices = vertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);
  const indices: number[] = [];
  const topIndex = 0;
  const bottomIndex = vertices.length - 1;

  for (let i = 0; i < 10; i += 1) {
    const current = i + 1;
    const next = ((i + 1) % 10) + 1;

    indices.push(topIndex, current, next);
    indices.push(bottomIndex, next, current);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatVertices, 3));
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

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  const disposeSingle = (item: THREE.Material) => {
    const textured = item as THREE.Material & { map?: THREE.Texture | null };
    textured.map?.dispose();
    item.dispose();
  };

  if (Array.isArray(material)) {
    material.forEach(disposeSingle);
    return;
  }

  disposeSingle(material);
}

function uniqueVertexPush(vertices: THREE.Vector3[], candidate: THREE.Vector3) {
  const exists = vertices.some((vertex) => vertex.distanceToSquared(candidate) < 0.0001);
  if (!exists) {
    vertices.push(candidate.clone());
  }
}

function canonicalizeNormal(normal: THREE.Vector3) {
  const output = normal.clone().normalize();
  if (
    output.z < -1e-5 ||
    (Math.abs(output.z) <= 1e-5 && output.y < -1e-5) ||
    (Math.abs(output.z) <= 1e-5 && Math.abs(output.y) <= 1e-5 && output.x < 0)
  ) {
    output.multiplyScalar(-1);
  }
  return output;
}

function getFaceInfos(geometry: THREE.BufferGeometry) {
  const cached = geometry.userData.faceInfos as FaceInfo[] | undefined;
  if (cached) return cached;

  const position = geometry.getAttribute('position');
  if (!position) return [];

  const index = geometry.getIndex();
  const indices = index ? Array.from(index.array as Iterable<number>) : null;
  const count = indices ? indices.length : position.count;

  const clusters: FaceCluster[] = [];
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const edgeAB = new THREE.Vector3();
  const edgeAC = new THREE.Vector3();
  const triNormal = new THREE.Vector3();

  for (let i = 0; i < count; i += 3) {
    const iA = indices ? indices[i] : i;
    const iB = indices ? indices[i + 1] : i + 1;
    const iC = indices ? indices[i + 2] : i + 2;

    vA.fromBufferAttribute(position, iA);
    vB.fromBufferAttribute(position, iB);
    vC.fromBufferAttribute(position, iC);

    edgeAB.subVectors(vB, vA);
    edgeAC.subVectors(vC, vA);
    triNormal.copy(edgeAB).cross(edgeAC);
    const area = triNormal.length() * 0.5;
    if (area <= 1e-6) continue;

    const normal = canonicalizeNormal(triNormal);
    const planeConstant = normal.dot(vA);
    const center = new THREE.Vector3().add(vA).add(vB).add(vC).multiplyScalar(1 / 3);

    let cluster = clusters.find(
      (item) =>
        item.normal.dot(normal) > 0.999 &&
        Math.abs(item.planeConstant - planeConstant) < 0.02,
    );

    if (!cluster) {
      cluster = {
        normal: normal.clone(),
        planeConstant,
        area: 0,
        weightedCenter: new THREE.Vector3(),
        vertices: [],
      };
      clusters.push(cluster);
    }

    cluster.area += area;
    cluster.weightedCenter.addScaledVector(center, area);
    uniqueVertexPush(cluster.vertices, vA);
    uniqueVertexPush(cluster.vertices, vB);
    uniqueVertexPush(cluster.vertices, vC);
  }

  const faces = clusters
    .map((cluster) => {
      const center = cluster.weightedCenter.clone().multiplyScalar(1 / cluster.area);
      let up = new THREE.Vector3();
      let bestScore = -Infinity;

      cluster.vertices.forEach((vertex) => {
        const candidate = vertex.clone().sub(center);
        candidate.addScaledVector(cluster.normal, -candidate.dot(cluster.normal));
        const lengthSq = candidate.lengthSq();
        if (lengthSq <= 1e-6) return;
        const score = vertex.y * 10 + vertex.z;
        if (score > bestScore) {
          bestScore = score;
          up = candidate;
        }
      });

      if (up.lengthSq() <= 1e-6 && cluster.vertices[0]) {
        up = cluster.vertices[0].clone().sub(center);
        up.addScaledVector(cluster.normal, -up.dot(cluster.normal));
      }

      if (up.lengthSq() <= 1e-6) {
        up = new THREE.Vector3(0, 1, 0);
      } else {
        up.normalize();
      }

      return {
        center,
        normal: cluster.normal.clone().normalize(),
        up,
        area: cluster.area,
      } satisfies FaceInfo;
    })
    .sort((left, right) => right.area - left.area || right.center.z - left.center.z);

  geometry.userData.faceInfos = faces;
  return faces;
}

function getDisplayFace(geometry: THREE.BufferGeometry) {
  const faces = getFaceInfos(geometry);
  if (faces.length === 0) return null;

  return faces.reduce((best, current) => {
    const bestScore = best.area * 4 + best.normal.z + best.center.z * 0.25;
    const currentScore = current.area * 4 + current.normal.z + current.center.z * 0.25;
    return currentScore > bestScore ? current : best;
  });
}

function makeFrontPlane(value: number, radius: number, face: FaceInfo | null) {
  const texture = makeNumberTexture(value);
  const size = face
    ? THREE.MathUtils.clamp(Math.sqrt(face.area) * 0.95, radius * 0.55, radius * 1.05)
    : radius * 0.8;
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
    opacity: 0,
  });
  const plane = new THREE.Mesh(geometry, material);

  if (face) {
    const offset = face.normal.clone().multiplyScalar(0.03);
    plane.position.copy(face.center).add(offset);
    const faceRotation = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      face.normal,
    );
    plane.quaternion.copy(faceRotation);

    const rotatedUp = face.up.clone().applyQuaternion(faceRotation).normalize();
    const projectedUp = rotatedUp.projectOnPlane(new THREE.Vector3(0, 0, 1));
    if (projectedUp.lengthSq() > 1e-6) {
      projectedUp.normalize();
      const angle = Math.atan2(projectedUp.x, projectedUp.y);
      plane.rotateZ(-angle);
    }
  } else {
    plane.position.set(0, 0, radius * 0.82);
  }

  plane.renderOrder = 10;
  return plane;
}

function computeTargetQuaternion(face: FaceInfo | null) {
  if (!face) return new THREE.Quaternion();

  const forward = new THREE.Vector3(0, 0, 1);
  const firstRotation = new THREE.Quaternion().setFromUnitVectors(face.normal.clone().normalize(), forward);
  const rotatedUp = face.up.clone().applyQuaternion(firstRotation).normalize();
  const projectedUp = rotatedUp.projectOnPlane(forward);

  if (projectedUp.lengthSq() <= 1e-6) {
    return firstRotation;
  }

  projectedUp.normalize();
  const angle = Math.atan2(projectedUp.x, projectedUp.y);
  const secondRotation = new THREE.Quaternion().setFromAxisAngle(forward, -angle);
  return secondRotation.multiply(firstRotation);
}

function getDieRadius(faces: number) {
  switch (faces) {
    case 4:
      return 1.4;
    case 8:
      return 1.3;
    case 10:
      return 1.22;
    case 12:
      return 1.2;
    case 20:
      return 1.3;
    default:
      return 1.05;
  }
}

function getHighlightProfile(faces: number) {
  switch (faces) {
    case 20:
      return { critMesh: 1.2, critLight: 1.25, fumbleMesh: 1.08, fumbleLight: 1.12 };
    case 12:
      return { critMesh: 1.08, critLight: 1.12, fumbleMesh: 1.02, fumbleLight: 1.05 };
    case 10:
      return { critMesh: 1.02, critLight: 1.06, fumbleMesh: 0.98, fumbleLight: 1.02 };
    case 8:
      return { critMesh: 0.98, critLight: 1.02, fumbleMesh: 0.94, fumbleLight: 0.98 };
    case 6:
      return { critMesh: 0.95, critLight: 0.98, fumbleMesh: 0.92, fumbleLight: 0.95 };
    case 4:
      return { critMesh: 0.92, critLight: 0.95, fumbleMesh: 0.88, fumbleLight: 0.92 };
    default:
      return { critMesh: 1, critLight: 1, fumbleMesh: 1, fumbleLight: 1 };
  }
}

function setMeshAccent(
  mesh: THREE.Mesh,
  faces: number,
  accent: 'crit' | 'fumble' | null,
  pulse: number,
) {
  const material = mesh.material;
  const defaultEmissive = getDieColor(faces).emissive;
  const profile = getHighlightProfile(faces);
  const emissiveIntensity =
    accent === 'crit'
      ? 0.3 + pulse * 0.9 * profile.critMesh
      : accent === 'fumble'
        ? 0.24 + pulse * 0.6 * profile.fumbleMesh
        : 0.3;

  const applyToMaterial = (item: THREE.Material) => {
    const phong = item as THREE.MeshPhongMaterial;
    if (!('emissive' in phong)) return;
    if (accent === 'crit') {
      phong.emissive.setHex(0x8a5b00);
    } else if (accent === 'fumble') {
      phong.emissive.setHex(0x5a1020);
    } else {
      phong.emissive.setHex(defaultEmissive);
    }
    phong.emissiveIntensity = emissiveIntensity;
  };

  if (Array.isArray(material)) {
    material.forEach(applyToMaterial);
    return;
  }

  applyToMaterial(material);
}

export function DiceScene({
  faces,
  isRolling,
  result,
  highlight = null,
  onRollComplete,
  reducedMotion = false,
  rollDurationMs = 800,
}: DiceSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<DiceSceneState>({});
  const animRef = useRef<number | null>(null);
  const rollingRef = useRef(false);
  const rollStartRef = useRef(0);
  const hasResultRef = useRef(false);
  const bobTimeRef = useRef(0);
  const highlightRef = useRef<'crit' | 'fumble' | null>(highlight);

  useEffect(() => {
    highlightRef.current = highlight;
  }, [highlight]);

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
    const accentLight = new THREE.PointLight(0xffffff, 0, 10);
    accentLight.position.set(0, 0.6, 2.4);
    scene.add(accentLight);

    const geometry = createDieGeometry(faces);
    const { main, emissive } = getDieColor(faces);
    const mesh =
      faces === 6
        ? new THREE.Mesh(geometry, makeD6Materials(faces, null))
        : new THREE.Mesh(
            geometry,
            new THREE.MeshPhongMaterial({
              color: main,
              emissive,
              emissiveIntensity: 0.3,
              shininess: 90,
              flatShading: true,
            }),
          );

    mesh.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 }),
      ),
    );

    scene.add(mesh);
    stateRef.current = {
      renderer,
      scene,
      camera,
      mesh,
      spinVelocity: new THREE.Vector3(0.24, 0.2, 0.16),
      accentLight,
    };

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const { mesh: currentMesh, plane, renderer: currentRenderer, scene: currentScene, camera: currentCamera } = stateRef.current;
      if (!currentMesh || !currentRenderer || !currentScene || !currentCamera) return;
      const resetScale = () => currentMesh.scale.setScalar(1);
      const accent = highlightRef.current;
      const accentLightRef = stateRef.current.accentLight;

      if (rollingRef.current) {
        const elapsed = (performance.now() - rollStartRef.current) / 1000;
        const duration = reducedMotion ? 0.01 : Math.max(0.16, rollDurationMs / 1000);
        const settleAt = duration * 0.72;
        const profile = getHighlightProfile(faces);

        if (elapsed < settleAt) {
          const progress = elapsed / settleAt;
          const easedProgress = Math.pow(progress, 1.18);
          const intensity = THREE.MathUtils.lerp(1.16, 0.22, easedProgress);
          const wobble = 1 + Math.sin(progress * Math.PI * 2.4) * 0.08;
          currentMesh.rotation.x += (stateRef.current.spinVelocity?.x ?? 0.22) * intensity * wobble;
          currentMesh.rotation.y += (stateRef.current.spinVelocity?.y ?? 0.18) * intensity;
          currentMesh.rotation.z +=
            (stateRef.current.spinVelocity?.z ?? 0.14) *
            intensity *
            (0.92 + Math.cos(progress * Math.PI * 1.8) * 0.06);
          currentMesh.position.y =
            Math.sin(progress * Math.PI) * 0.16 +
            Math.sin(progress * Math.PI * 4) * (1 - progress) * 0.028;
          resetScale();
          setMeshAccent(currentMesh, faces, null, 0);
          if (accentLightRef) accentLightRef.intensity = 0;
          if (plane) {
            (plane.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        } else {
          if (!stateRef.current.settleStartQuaternion) {
            stateRef.current.settleStartQuaternion = currentMesh.quaternion.clone();
          }

          const settleDuration = Math.max(duration - settleAt, 0.08);
          const settleProgress = THREE.MathUtils.clamp((elapsed - settleAt) / settleDuration, 0, 1);
          const eased = THREE.MathUtils.smootherstep(settleProgress, 0, 1);
          const bounce =
            Math.sin(settleProgress * Math.PI) *
            Math.pow(1 - settleProgress, 1.35) *
            0.05;

          if (stateRef.current.targetQuaternion) {
            currentMesh.quaternion.slerpQuaternions(
              stateRef.current.settleStartQuaternion,
              stateRef.current.targetQuaternion,
              eased,
            );
            const snapAngle =
              Math.sin(settleProgress * Math.PI * 2.1) *
              Math.pow(1 - settleProgress, 2.2) *
              0.06;
            const snapQuaternion = new THREE.Quaternion().setFromAxisAngle(
              new THREE.Vector3(0, 0, 1),
              snapAngle,
            );
            currentMesh.quaternion.multiply(snapQuaternion);
          }
          currentMesh.position.y = bounce;
          const punch =
            THREE.MathUtils.smoothstep(settleProgress, 0.08, 0.42) *
            Math.sin(settleProgress * Math.PI) *
            0.045;
          currentMesh.scale.setScalar(1 + punch);
          const glowPulse = THREE.MathUtils.smoothstep(settleProgress, 0.2, 0.8);
          setMeshAccent(currentMesh, faces, accent, glowPulse);
          if (accentLightRef) {
            if (accent === 'crit') {
              accentLightRef.color.setHex(0xfbbf24);
              accentLightRef.intensity = glowPulse * 1.15 * profile.critLight;
            } else if (accent === 'fumble') {
              accentLightRef.color.setHex(0xf43f5e);
              accentLightRef.intensity = glowPulse * 0.75 * profile.fumbleLight;
            } else {
              accentLightRef.intensity = 0;
            }
          }

          if (plane) {
            (plane.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.smoothstep(
              settleProgress,
              0.28,
              0.9,
            );
          }

          if (settleProgress >= 1) {
            rollingRef.current = false;
            stateRef.current.settleStartQuaternion = undefined;
            currentMesh.position.y = 0;
            resetScale();
            if (stateRef.current.targetQuaternion) {
              currentMesh.quaternion.copy(stateRef.current.targetQuaternion);
            }
            if (plane) {
              (plane.material as THREE.MeshBasicMaterial).opacity = 1;
            }
            onRollComplete?.();
          }
        }
      } else if (hasResultRef.current) {
        if (stateRef.current.targetQuaternion) {
          currentMesh.quaternion.slerp(stateRef.current.targetQuaternion, 0.08);
        }
        bobTimeRef.current += 0.012;
        currentMesh.position.y = Math.sin(bobTimeRef.current) * 0.025;
        currentMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        const pulse = accent ? 0.55 + (Math.sin(bobTimeRef.current * 2.2) + 1) * 0.17 : 0;
        const profile = getHighlightProfile(faces);
        setMeshAccent(currentMesh, faces, accent, pulse);
        if (accentLightRef) {
          if (accent === 'crit') {
            accentLightRef.color.setHex(0xfbbf24);
            accentLightRef.intensity = (0.5 + pulse * 0.7) * profile.critLight;
          } else if (accent === 'fumble') {
            accentLightRef.color.setHex(0xf43f5e);
            accentLightRef.intensity = (0.35 + pulse * 0.45) * profile.fumbleLight;
          } else {
            accentLightRef.intensity = 0;
          }
        }
        if (plane) {
          (plane.material as THREE.MeshBasicMaterial).opacity = 1;
        }
      } else {
        currentMesh.rotation.y += 0.004;
        currentMesh.rotation.x += 0.001;
        bobTimeRef.current += 0.012;
        currentMesh.position.y = Math.sin(bobTimeRef.current) * 0.05;
        resetScale();
        setMeshAccent(currentMesh, faces, null, 0);
        if (accentLightRef) accentLightRef.intensity = 0;
      }

      currentRenderer.render(currentScene, currentCamera);
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
            const meshObject = object as THREE.Mesh;
            meshObject.geometry?.dispose();
            if (meshObject.material) {
              disposeMaterial(meshObject.material);
            }
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
  }, [faces, onRollComplete, reducedMotion, rollDurationMs]);

  useEffect(() => {
    const { mesh, plane } = stateRef.current;
    if (!mesh) return;

    if (plane) {
      mesh.remove(plane);
      stateRef.current.plane = undefined;
    }

    stateRef.current.displayFace = undefined;
    stateRef.current.targetQuaternion = undefined;

    if (result === null) {
      hasResultRef.current = false;
      if (faces === 6) {
        mesh.material = makeD6Materials(faces, null);
      }
      return;
    }

    hasResultRef.current = true;

    if (faces === 6) {
      mesh.material = makeD6Materials(faces, isRolling ? null : result);
      stateRef.current.targetQuaternion = new THREE.Quaternion();
      return;
    }

    const displayFace = getDisplayFace(mesh.geometry as THREE.BufferGeometry);
    stateRef.current.displayFace = displayFace;
    stateRef.current.targetQuaternion = computeTargetQuaternion(displayFace);

    const nextPlane = makeFrontPlane(result, getDieRadius(faces), displayFace);
    (nextPlane.material as THREE.MeshBasicMaterial).opacity = isRolling ? 0 : 1;
    mesh.add(nextPlane);
    stateRef.current.plane = nextPlane;

    if (!isRolling && stateRef.current.targetQuaternion) {
      mesh.quaternion.copy(stateRef.current.targetQuaternion);
      mesh.position.y = 0;
    }
  }, [faces, isRolling, result]);

  useEffect(() => {
    if (!isRolling) return;

    rollingRef.current = true;
    rollStartRef.current = performance.now();
    bobTimeRef.current = 0;
    stateRef.current.settleStartQuaternion = undefined;
    stateRef.current.spinVelocity = new THREE.Vector3(
      0.2 + Math.random() * 0.05,
      0.17 + Math.random() * 0.04,
      0.115 + Math.random() * 0.04,
    );

    const { mesh, plane } = stateRef.current;
    if (!mesh) return;

    mesh.position.y = 0;
    mesh.scale.setScalar(1);

    if (faces === 6) {
      mesh.material = makeD6Materials(faces, null);
    }

    if (plane) {
      (plane.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }, [faces, isRolling]);

  return <div ref={mountRef} className="w-full h-full" />;
}
