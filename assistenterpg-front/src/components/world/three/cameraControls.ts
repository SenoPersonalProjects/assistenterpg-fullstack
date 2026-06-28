export const DEFAULT_CAMERA_DISTANCE = 4.6;
export const MIN_CAMERA_DISTANCE = 2.05;
export const MAX_CAMERA_DISTANCE = 7.2;
export const WHEEL_ZOOM_SPEED = 0.0028;
export const BUTTON_ZOOM_STEP = 0.45;
export const ZOOM_LERP = 0.12;

export function clampCameraDistance(distance: number): number {
  return Math.min(
    MAX_CAMERA_DISTANCE,
    Math.max(MIN_CAMERA_DISTANCE, distance),
  );
}

export function getWheelCameraDistance(
  currentTargetDistance: number,
  wheelDeltaY: number,
): number {
  return clampCameraDistance(
    currentTargetDistance + wheelDeltaY * WHEEL_ZOOM_SPEED,
  );
}

export function zoomCameraDistance(
  currentTargetDistance: number,
  direction: 'in' | 'out',
): number {
  return clampCameraDistance(
    currentTargetDistance +
      (direction === 'in' ? -BUTTON_ZOOM_STEP : BUTTON_ZOOM_STEP),
  );
}
