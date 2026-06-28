'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { WorldFallbackMap } from '@/components/world/WorldFallbackMap';
import {
  DEFAULT_CAMERA_DISTANCE,
  ZOOM_LERP,
  getWheelCameraDistance,
  zoomCameraDistance,
} from '@/components/world/three/cameraControls';
import { disposeObjectTree } from '@/components/world/three/dispose';
import {
  type AtlasFocusRotation,
  DEFAULT_GLOBE_TILT_X,
  calculateAtlasFocusRotation,
  isFocusRotationSettled,
  isGlobeTiltNeutral,
  lerpFocusRotation,
  lerpGlobeTiltToNeutral,
} from '@/components/world/three/focus';
import {
  type AtlasMarkerRecord,
  createAtlasMarker,
  updateAtlasMarkerVisibility,
} from '@/components/world/three/markers';
import { raycastAtlasItemId } from '@/components/world/three/raycast';
import { createWorldScene } from '@/components/world/three/scene';
import { calcularTooltipAtlasPosition } from '@/components/world/three/tooltip';
import {
  type WorldAtlasItem,
  type WorldAtlasMarkerDisplayState,
  type WorldDetailLevel,
  getWorldDetailLevel,
} from '@/lib/world';

type WorldGlobeCanvasProps = {
  items: WorldAtlasItem[];
  markerStates: WorldAtlasMarkerDisplayState[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onClearSelection: () => void;
  onHoverItem: (itemId: string | null) => void;
  onDetailLevelChange?: (level: WorldDetailLevel) => void;
};

type TooltipState = {
  label: string;
  left: number;
  top: number;
} | null;

const CLICK_DRAG_THRESHOLD = 8;
const AUTO_ROTATE_SPEED = 0.0012;
const AUTO_ROTATE_RESUME_DELAY_MS = 2500;
const KEYBOARD_ROTATE_STEP = 0.08;
const KEYBOARD_TILT_STEP = 0.06;
const GLOBE_TILT_LIMIT = 0.75;

function hasWebGlSupport(): boolean {
  const canvas = document.createElement('canvas');
  const context =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  return Boolean(window.WebGLRenderingContext && context);
}

function releasePointerCaptureSafely(
  element: HTMLElement,
  pointerId: number,
): void {
  try {
    element.releasePointerCapture(pointerId);
  } catch {
    // Pointer capture may already be released by the browser.
  }
}

export function WorldGlobeCanvas({
  items,
  markerStates,
  selectedItemId,
  onSelectItem,
  onClearSelection,
  onHoverItem,
  onDetailLevelChange,
}: WorldGlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedItemIdRef = useRef<string | null>(selectedItemId);
  const hoveredItemIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({
    onSelectItem,
    onClearSelection,
    onHoverItem,
    onDetailLevelChange,
  });
  const visibleItemIdsRef = useRef(
    new Set(
      markerStates
        .filter((state) => state.visible)
        .map((state) => state.itemId),
    ),
  );
  const focusableItemIdsRef = useRef(
    new Set(
      markerStates
        .filter((state) => state.filterEnabled)
        .map((state) => state.itemId),
    ),
  );
  const markerStateByIdRef = useRef(
    new Map(markerStates.map((state) => [state.itemId, state])),
  );
  const markerRecordsRef = useRef<AtlasMarkerRecord[]>([]);
  const currentCameraDistanceRef = useRef(DEFAULT_CAMERA_DISTANCE);
  const targetCameraDistanceRef = useRef(DEFAULT_CAMERA_DISTANCE);
  const detailLevelRef = useRef<WorldDetailLevel>(
    getWorldDetailLevel(DEFAULT_CAMERA_DISTANCE),
  );
  const autoRotateEnabledRef = useRef(true);
  const focusTargetRef = useRef<AtlasFocusRotation | null>(null);
  const focusActiveRef = useRef(false);
  const tiltResetActiveRef = useRef(false);
  const focusedItemIdRef = useRef<string | null>(null);
  const resumeAutoRotateTimerRef = useRef<number | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const visibleItems = useMemo(() => {
    const visibleSet = new Set(
      markerStates
        .filter((state) => state.visible)
        .map((state) => state.itemId),
    );
    return items.filter((item) => visibleSet.has(item.id));
  }, [items, markerStates]);

  useEffect(() => {
    const previousSelectedItemId = selectedItemIdRef.current;

    selectedItemIdRef.current = selectedItemId;

    if (previousSelectedItemId && selectedItemId === null) {
      focusTargetRef.current = null;
      focusActiveRef.current = false;
      tiltResetActiveRef.current = true;
      focusedItemIdRef.current = null;
      autoRotateEnabledRef.current = true;
    }
  }, [selectedItemId]);

  useEffect(() => {
    callbacksRef.current = {
      onSelectItem,
      onClearSelection,
      onHoverItem,
      onDetailLevelChange,
    };
  }, [onSelectItem, onClearSelection, onHoverItem, onDetailLevelChange]);

  const clearResumeAutoRotateTimer = useCallback(() => {
    if (resumeAutoRotateTimerRef.current !== null) {
      window.clearTimeout(resumeAutoRotateTimerRef.current);
      resumeAutoRotateTimerRef.current = null;
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    targetCameraDistanceRef.current = zoomCameraDistance(
      targetCameraDistanceRef.current,
      'in',
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    targetCameraDistanceRef.current = zoomCameraDistance(
      targetCameraDistanceRef.current,
      'out',
    );
  }, []);

  const handleResetView = useCallback(() => {
    clearResumeAutoRotateTimer();
    targetCameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;
    focusTargetRef.current = null;
    focusActiveRef.current = false;
    tiltResetActiveRef.current = true;
    focusedItemIdRef.current = null;
    selectedItemIdRef.current = null;
    hoveredItemIdRef.current = null;
    autoRotateEnabledRef.current = true;
    callbacksRef.current.onClearSelection();
    callbacksRef.current.onHoverItem(null);
    setTooltip(null);
  }, [clearResumeAutoRotateTimer]);

  useEffect(() => {
    const visibleSet = new Set(
      markerStates
        .filter((state) => state.visible)
        .map((state) => state.itemId),
    );
    const focusableSet = new Set(
      markerStates
        .filter((state) => state.filterEnabled)
        .map((state) => state.itemId),
    );
    const stateById = new Map(
      markerStates.map((state) => [state.itemId, state]),
    );
    let tooltipResetId: number | null = null;

    visibleItemIdsRef.current = visibleSet;
    focusableItemIdsRef.current = focusableSet;
    markerStateByIdRef.current = stateById;
    updateAtlasMarkerVisibility(markerRecordsRef.current, stateById);

    if (
      hoveredItemIdRef.current &&
      !visibleSet.has(hoveredItemIdRef.current)
    ) {
      hoveredItemIdRef.current = null;
      callbacksRef.current.onHoverItem(null);
      tooltipResetId = window.setTimeout(() => setTooltip(null), 0);
    }

    if (
      selectedItemIdRef.current &&
      !focusableSet.has(selectedItemIdRef.current)
    ) {
      selectedItemIdRef.current = null;
      focusTargetRef.current = null;
      focusActiveRef.current = false;
      tiltResetActiveRef.current = true;
      focusedItemIdRef.current = null;
      autoRotateEnabledRef.current = true;
      clearResumeAutoRotateTimer();
      callbacksRef.current.onClearSelection();
    }

    return () => {
      if (tooltipResetId !== null) {
        window.clearTimeout(tooltipResetId);
      }
    };
  }, [clearResumeAutoRotateTimer, markerStates]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer === null) return;
    const containerElement: HTMLDivElement = currentContainer;

    let active = true;
    let disposed = false;
    let animationFrameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    const setCanvasErrorAsync = (message: string | null) => {
      window.setTimeout(() => {
        if (active) {
          setCanvasError(message);
        }
      }, 0);
    };

    setCanvasErrorAsync(null);

    if (!hasWebGlSupport()) {
      setCanvasErrorAsync('WebGL não está disponível neste navegador.');
      return () => {
        active = false;
      };
    }

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setCanvasErrorAsync('Não foi possível criar o renderizador WebGL.');
      return () => {
        active = false;
      };
    }

    const { scene, camera, worldGroup, disposeTextureLoading } =
      createWorldScene();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactiveObjects: THREE.Object3D[] = [];
    const markerRecords: AtlasMarkerRecord[] = [];
    const itemById = new Map(items.map((item) => [item.id, item]));
    const highlightColor = new THREE.Color(0xf8f0ff);
    const draggingRef = { current: false };
    const lastPointerRef = { current: { x: 0, y: 0 } };
    const dragDistanceRef = { current: 0 };

    function cleanupRenderer(options: { forceContextLoss: boolean }): void {
      if (disposed) return;

      disposed = true;
      window.cancelAnimationFrame(animationFrameId);
      clearResumeAutoRotateTimer();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener(
        'pointercancel',
        handlePointerCancel,
      );
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('keydown', handleCanvasKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost,
      );
      disposeTextureLoading();
      disposeObjectTree(scene);
      renderer.dispose();

      if (options.forceContextLoss) {
        renderer.forceContextLoss();
      }

      if (renderer.domElement.parentElement === containerElement) {
        containerElement.removeChild(renderer.domElement);
      }

      markerRecordsRef.current = [];
    }

    function scheduleAutoRotateResume(): void {
      clearResumeAutoRotateTimer();
      resumeAutoRotateTimerRef.current = window.setTimeout(() => {
        if (!selectedItemIdRef.current && !draggingRef.current) {
          autoRotateEnabledRef.current = true;
        }
        resumeAutoRotateTimerRef.current = null;
      }, AUTO_ROTATE_RESUME_DELAY_MS);
    }

    function pauseAutoRotate(): void {
      clearResumeAutoRotateTimer();
      autoRotateEnabledRef.current = false;
    }

    function resumeAutoRotateImmediately(): void {
      clearResumeAutoRotateTimer();
      autoRotateEnabledRef.current = true;
    }

    function setFocusTargetForItem(itemId: string | null): void {
      if (!itemId) {
        focusTargetRef.current = null;
        focusActiveRef.current = false;
        tiltResetActiveRef.current = false;
        focusedItemIdRef.current = null;
        return;
      }

      const item = itemById.get(itemId);

      if (!item || !focusableItemIdsRef.current.has(itemId)) {
        focusTargetRef.current = null;
        focusActiveRef.current = false;
        tiltResetActiveRef.current = false;
        focusedItemIdRef.current = null;
        return;
      }

      focusTargetRef.current = calculateAtlasFocusRotation({
        lat: item.lat,
        lng: item.lng,
      });
      focusActiveRef.current = true;
      tiltResetActiveRef.current = false;
      focusedItemIdRef.current = itemId;
    }

    function selectItemAndFocus(itemId: string): void {
      selectedItemIdRef.current = itemId;
      pauseAutoRotate();
      setFocusTargetForItem(itemId);
      callbacksRef.current.onSelectItem(itemId);
    }

    function clearSelectionAndResume(): void {
      selectedItemIdRef.current = null;
      hoveredItemIdRef.current = null;
      focusTargetRef.current = null;
      focusActiveRef.current = false;
      tiltResetActiveRef.current = true;
      focusedItemIdRef.current = null;
      callbacksRef.current.onClearSelection();
      callbacksRef.current.onHoverItem(null);
      setTooltip(null);
      resumeAutoRotateImmediately();
    }

    function syncSelectedFocus(): void {
      const selectedId = selectedItemIdRef.current;

      if (selectedId === focusedItemIdRef.current) return;

      if (selectedId && focusableItemIdsRef.current.has(selectedId)) {
        pauseAutoRotate();
        setFocusTargetForItem(selectedId);
        return;
      }

      focusTargetRef.current = null;
      focusActiveRef.current = false;
      tiltResetActiveRef.current = false;
      focusedItemIdRef.current = selectedId;

      if (!selectedId && !draggingRef.current) {
        resumeAutoRotateImmediately();
      }
    }

    function updateSize() {
      const width = Math.max(containerElement.clientWidth, 320);
      const height = Math.max(containerElement.clientHeight, 420);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function getItemIdAtPointer(event: PointerEvent): string | null {
      return raycastAtlasItemId({
        clientX: event.clientX,
        clientY: event.clientY,
        element: renderer.domElement,
        camera,
        raycaster,
        pointer,
        interactiveObjects,
        worldGroup,
        visibleItemIds: visibleItemIdsRef.current,
      });
    }

    function updateHover(id: string | null, event?: PointerEvent) {
      hoveredItemIdRef.current = id;
      callbacksRef.current.onHoverItem(id);

      if (!id || !event) {
        setTooltip(null);
        renderer.domElement.style.cursor = draggingRef.current ? 'grabbing' : 'grab';
        return;
      }

      const item = itemById.get(id);
      if (!item) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const position = calcularTooltipAtlasPosition({
        pointerX,
        pointerY,
        containerWidth: rect.width,
        containerHeight: rect.height,
      });

      renderer.domElement.style.cursor = draggingRef.current ? 'grabbing' : 'pointer';
      setTooltip({
        label: item.nome,
        left: position.left,
        top: position.top,
      });
    }

    function updateRaycast(event: PointerEvent) {
      updateHover(getItemIdAtPointer(event), event);
    }

    function handlePointerDown(event: PointerEvent) {
      renderer.domElement.focus({ preventScroll: true });
      pauseAutoRotate();
      focusActiveRef.current = false;
      tiltResetActiveRef.current = false;
      draggingRef.current = true;
      dragDistanceRef.current = 0;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      renderer.domElement.style.cursor = 'grabbing';
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: PointerEvent) {
      if (draggingRef.current) {
        const dx = event.clientX - lastPointerRef.current.x;
        const dy = event.clientY - lastPointerRef.current.y;

        worldGroup.rotation.y += dx * 0.006;
        worldGroup.rotation.x = THREE.MathUtils.clamp(
          worldGroup.rotation.x + dy * 0.004,
          -GLOBE_TILT_LIMIT,
          GLOBE_TILT_LIMIT,
        );
        dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
      }

      updateRaycast(event);
    }

    function handlePointerUp(event: PointerEvent) {
      const isClick = dragDistanceRef.current <= CLICK_DRAG_THRESHOLD;
      draggingRef.current = false;
      releasePointerCaptureSafely(renderer.domElement, event.pointerId);

      const itemId = getItemIdAtPointer(event);
      updateHover(itemId, event);

      if (isClick && itemId) {
        selectItemAndFocus(itemId);
        return;
      }

      if (isClick && !itemId) {
        clearSelectionAndResume();
        return;
      }

      if (!selectedItemIdRef.current) {
        scheduleAutoRotateResume();
      }
    }

    function handlePointerCancel(event: PointerEvent) {
      draggingRef.current = false;
      releasePointerCaptureSafely(renderer.domElement, event.pointerId);
      updateHover(null);

      if (!selectedItemIdRef.current) {
        scheduleAutoRotateResume();
      }
    }

    function handlePointerLeave() {
      draggingRef.current = false;
      updateHover(null);

      if (!selectedItemIdRef.current) {
        scheduleAutoRotateResume();
      }
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      targetCameraDistanceRef.current = getWheelCameraDistance(
        targetCameraDistanceRef.current,
        event.deltaY,
      );
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && selectedItemIdRef.current) {
        clearSelectionAndResume();
      }
    }

    function handleCanvasKeyDown(event: KeyboardEvent) {
      const shouldHandle =
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === '+' ||
        event.key === '=' ||
        event.key === '-' ||
        event.key === 'Escape';

      if (!shouldHandle) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        if (selectedItemIdRef.current) {
          clearSelectionAndResume();
        }
        return;
      }

      pauseAutoRotate();
      focusActiveRef.current = false;
      tiltResetActiveRef.current = false;

      if (event.key === 'ArrowLeft') {
        worldGroup.rotation.y -= KEYBOARD_ROTATE_STEP;
      } else if (event.key === 'ArrowRight') {
        worldGroup.rotation.y += KEYBOARD_ROTATE_STEP;
      } else if (event.key === 'ArrowUp') {
        worldGroup.rotation.x = THREE.MathUtils.clamp(
          worldGroup.rotation.x - KEYBOARD_TILT_STEP,
          -GLOBE_TILT_LIMIT,
          GLOBE_TILT_LIMIT,
        );
      } else if (event.key === 'ArrowDown') {
        worldGroup.rotation.x = THREE.MathUtils.clamp(
          worldGroup.rotation.x + KEYBOARD_TILT_STEP,
          -GLOBE_TILT_LIMIT,
          GLOBE_TILT_LIMIT,
        );
      } else if (event.key === '+' || event.key === '=') {
        targetCameraDistanceRef.current = zoomCameraDistance(
          targetCameraDistanceRef.current,
          'in',
        );
      } else if (event.key === '-') {
        targetCameraDistanceRef.current = zoomCameraDistance(
          targetCameraDistanceRef.current,
          'out',
        );
      }

      if (!selectedItemIdRef.current) {
        scheduleAutoRotateResume();
      }
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      cleanupRenderer({ forceContextLoss: false });
      setCanvasError('O contexto WebGL foi perdido. Reabra o atlas para tentar novamente.');
    }

    function animate() {
      if (disposed) return;

      animationFrameId = window.requestAnimationFrame(animate);
      syncSelectedFocus();

      currentCameraDistanceRef.current = THREE.MathUtils.lerp(
        currentCameraDistanceRef.current,
        targetCameraDistanceRef.current,
        ZOOM_LERP,
      );
      camera.position.z = currentCameraDistanceRef.current;
      const nextDetailLevel = getWorldDetailLevel(
        currentCameraDistanceRef.current,
      );

      if (nextDetailLevel !== detailLevelRef.current) {
        detailLevelRef.current = nextDetailLevel;
        callbacksRef.current.onDetailLevelChange?.(nextDetailLevel);
      }

      const shouldApplyFocus =
        focusActiveRef.current &&
        focusTargetRef.current &&
        !draggingRef.current;

      if (shouldApplyFocus && focusTargetRef.current) {
        const nextRotation = lerpFocusRotation(
          {
            x: worldGroup.rotation.x,
            y: worldGroup.rotation.y,
          },
          focusTargetRef.current,
        );

        worldGroup.rotation.x = nextRotation.x;
        worldGroup.rotation.y = nextRotation.y;

        if (
          isFocusRotationSettled(
            {
              x: worldGroup.rotation.x,
              y: worldGroup.rotation.y,
            },
            focusTargetRef.current,
          )
        ) {
          focusActiveRef.current = false;
        }
      } else if (tiltResetActiveRef.current && !draggingRef.current) {
        worldGroup.rotation.x = lerpGlobeTiltToNeutral(worldGroup.rotation.x);

        if (isGlobeTiltNeutral(worldGroup.rotation.x)) {
          worldGroup.rotation.x = DEFAULT_GLOBE_TILT_X;
          tiltResetActiveRef.current = false;
        }
      }

      if (
        autoRotateEnabledRef.current &&
        !draggingRef.current &&
        !shouldApplyFocus
      ) {
        worldGroup.rotation.y += AUTO_ROTATE_SPEED;
      }

      for (const record of markerRecords) {
        if (!record.group.visible) continue;

        const active = record.itemId === selectedItemIdRef.current;
        const hovered = record.itemId === hoveredItemIdRef.current;
        const markerState = markerStateByIdRef.current.get(record.itemId);
        const detailScale = markerState?.scaleMultiplier ?? 1;
        const targetScale = detailScale * (active ? 1.35 : hovered ? 1.16 : 1);
        const nextScale =
          record.group.scale.x + (targetScale - record.group.scale.x) * 0.18;

        record.group.scale.setScalar(nextScale);
        for (const visualMaterial of record.visualMaterials) {
          visualMaterial.material.opacity +=
            (visualMaterial.baseOpacity *
              (markerState?.opacityMultiplier ?? 1) -
              visualMaterial.material.opacity) *
            0.18;
        }
        record.material.color.lerpColors(
          record.baseColor,
          highlightColor,
          active ? 0.72 : hovered ? 0.36 : 0,
        );
      }

      renderer.render(scene, camera);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('role', 'application');
    renderer.domElement.setAttribute(
      'aria-label',
      'Globo 3D interativo do Atlas do Mundo. Use setas para rotacionar, mais e menos para zoom, e Escape para limpar seleção.',
    );
    containerElement.appendChild(renderer.domElement);

    for (const item of items) {
      const record = createAtlasMarker(item, interactiveObjects);
      markerRecords.push(record);
      worldGroup.add(record.group);
    }

    markerRecordsRef.current = markerRecords;
    updateAtlasMarkerVisibility(markerRecords, markerStateByIdRef.current);

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    renderer.domElement.addEventListener('pointercancel', handlePointerCancel);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.addEventListener('keydown', handleCanvasKeyDown);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    window.addEventListener('keydown', handleKeyDown);

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerElement);
    } else {
      window.addEventListener('resize', updateSize);
    }

    updateSize();
    animate();

    return () => {
      active = false;
      cleanupRenderer({ forceContextLoss: true });
    };
  }, [clearResumeAutoRotateTimer, items]);

  if (canvasError) {
    return (
      <WorldFallbackMap
        items={visibleItems}
        selectedItemId={selectedItemId}
        reason={canvasError}
        onSelectItem={onSelectItem}
      />
    );
  }

  return (
    <div className="relative min-h-[32rem] overflow-hidden rounded-3xl border border-app-border bg-[radial-gradient(circle_at_50%_35%,rgba(var(--primary-rgb),0.16),transparent_42%),linear-gradient(180deg,rgba(11,8,20,0.9),rgba(6,4,12,0.96))]">
      <div
        ref={containerRef}
        className="h-[62vh] min-h-[32rem] max-h-[45rem] w-full touch-none"
        aria-label="Globo 3D do Atlas do Mundo"
      />

      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-app-primary/30 bg-app-bg/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-app-primary backdrop-blur">
        Three.js direto
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-2xl border border-app-border/70 bg-app-bg/75 p-2 shadow-lg shadow-black/20 backdrop-blur">
        <button
          type="button"
          aria-label="Aproximar o globo"
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-primary/30 bg-app-primary/10 text-lg font-black text-app-primary transition-all hover:bg-app-primary/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-app-primary/50"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Afastar o globo"
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-primary/30 bg-app-primary/10 text-lg font-black text-app-primary transition-all hover:bg-app-primary/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-app-primary/50"
        >
          -
        </button>
        <button
          type="button"
          aria-label="Resetar visão do globo"
          onClick={handleResetView}
          className="hidden h-9 items-center justify-center rounded-xl border border-app-border bg-app-surface/80 px-3 text-[10px] font-black uppercase tracking-widest text-app-muted transition-all hover:border-app-primary/40 hover:text-app-fg active:scale-95 focus:outline-none focus:ring-2 focus:ring-app-primary/50 sm:flex"
        >
          Resetar
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-col gap-2 rounded-2xl border border-app-border/70 bg-app-bg/70 p-3 text-xs text-app-muted backdrop-blur md:left-auto md:max-w-sm">
        <span className="font-bold text-app-fg">
          Arraste para rotacionar. Use scroll ou os botões para aproximar.
        </span>
        <span>
          Clique em um ponto para focar o dossiê; clique no vazio para retomar o
          giro.
        </span>
        <span>
          Com foco no globo: setas rotacionam, + aproxima, - afasta e Esc limpa.
        </span>
      </div>

      {tooltip ? (
        <div
          className="pointer-events-none absolute z-20 max-w-[13.75rem] rounded-xl border border-app-primary/30 bg-app-bg/90 px-3 py-2 text-xs font-bold text-app-fg shadow-xl shadow-black/30 backdrop-blur"
          style={{
            left: tooltip.left,
            top: tooltip.top,
          }}
        >
          {tooltip.label}
        </div>
      ) : null}
    </div>
  );
}
