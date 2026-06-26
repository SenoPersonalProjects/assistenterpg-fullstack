import { describe, expect, it } from 'vitest';
import {
  BUTTON_ZOOM_STEP,
  DEFAULT_CAMERA_DISTANCE,
  MAX_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
  clampCameraDistance,
  getWheelCameraDistance,
  zoomCameraDistance,
} from './cameraControls';

describe('cameraControls', () => {
  it('clamps camera distance inside atlas zoom bounds', () => {
    expect(clampCameraDistance(0)).toBe(MIN_CAMERA_DISTANCE);
    expect(clampCameraDistance(99)).toBe(MAX_CAMERA_DISTANCE);
    expect(clampCameraDistance(DEFAULT_CAMERA_DISTANCE)).toBe(
      DEFAULT_CAMERA_DISTANCE,
    );
  });

  it('uses wheel direction to zoom in and out', () => {
    expect(getWheelCameraDistance(DEFAULT_CAMERA_DISTANCE, -100)).toBeLessThan(
      DEFAULT_CAMERA_DISTANCE,
    );
    expect(getWheelCameraDistance(DEFAULT_CAMERA_DISTANCE, 100)).toBeGreaterThan(
      DEFAULT_CAMERA_DISTANCE,
    );
  });

  it('uses fixed button steps for accessible zoom controls', () => {
    expect(zoomCameraDistance(DEFAULT_CAMERA_DISTANCE, 'in')).toBe(
      DEFAULT_CAMERA_DISTANCE - BUTTON_ZOOM_STEP,
    );
    expect(zoomCameraDistance(DEFAULT_CAMERA_DISTANCE, 'out')).toBe(
      DEFAULT_CAMERA_DISTANCE + BUTTON_ZOOM_STEP,
    );
  });
});
