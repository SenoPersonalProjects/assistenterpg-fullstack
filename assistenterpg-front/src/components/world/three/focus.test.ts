import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GLOBE_TILT_X,
  MAX_FOCUS_TILT,
  calculateAtlasFocusRotation,
  isFocusRotationSettled,
  isGlobeTiltNeutral,
  lerpAngle,
  lerpFocusRotation,
  lerpGlobeTiltToNeutral,
  normalizeAngle,
  shortestAngleDelta,
} from './focus';

describe('focus helpers', () => {
  it('normalizes angles to the -pi..pi interval', () => {
    expect(normalizeAngle(Math.PI * 3)).toBeCloseTo(-Math.PI);
    expect(normalizeAngle(-Math.PI * 3)).toBeCloseTo(-Math.PI);
  });

  it('uses the shortest angular path when interpolating', () => {
    expect(Math.abs(shortestAngleDelta(3.1, -3.1))).toBeLessThan(0.1);
    expect(lerpAngle(3.1, -3.1, 0.5)).toBeGreaterThan(3.1);
  });

  it('calculates finite focus rotation and clamps extreme latitude', () => {
    const rotation = calculateAtlasFocusRotation({ lat: 90, lng: 0 });

    expect(Number.isFinite(rotation.x)).toBe(true);
    expect(Number.isFinite(rotation.y)).toBe(true);
    expect(rotation.x).toBe(MAX_FOCUS_TILT);
    expect(rotation.y).toBeCloseTo(-Math.PI / 2);
  });

  it('settles after repeated focus interpolation', () => {
    const target = calculateAtlasFocusRotation({ lat: 35.6895, lng: 139.6917 });
    let current = { x: 0, y: 0 };

    for (let i = 0; i < 120; i += 1) {
      current = lerpFocusRotation(current, target, 0.12);
    }

    expect(isFocusRotationSettled(current, target)).toBe(true);
  });

  it('interpolates globe tilt back to neutral without touching yaw', () => {
    let tilt = 0.65;
    const yaw = 1.45;

    for (let i = 0; i < 120; i += 1) {
      tilt = lerpGlobeTiltToNeutral(tilt, 0.12);
    }

    expect(Number.isFinite(tilt)).toBe(true);
    expect(isGlobeTiltNeutral(tilt)).toBe(true);
    expect(yaw).toBe(1.45);
    expect(DEFAULT_GLOBE_TILT_X).toBe(0);
  });
});
