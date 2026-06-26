import * as THREE from 'three';
import { degreesToRadians } from '../../../lib/world';

export type AtlasFocusRotation = {
  x: number;
  y: number;
};

export const MAX_FOCUS_TILT = 0.75;
export const FOCUS_LERP = 0.08;
export const FOCUS_EPSILON = 0.004;
export const DEFAULT_GLOBE_TILT_X = 0;

const TWO_PI = Math.PI * 2;

export function normalizeAngle(angle: number): number {
  return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

export function shortestAngleDelta(from: number, to: number): number {
  return normalizeAngle(to - from);
}

export function lerpAngle(from: number, to: number, alpha: number): number {
  return from + shortestAngleDelta(from, to) * alpha;
}

export function calculateAtlasFocusRotation(params: {
  lat: number;
  lng: number;
}): AtlasFocusRotation {
  return {
    x: THREE.MathUtils.clamp(
      degreesToRadians(params.lat),
      -MAX_FOCUS_TILT,
      MAX_FOCUS_TILT,
    ),
    y: normalizeAngle(-degreesToRadians(params.lng) - Math.PI / 2),
  };
}

export function lerpFocusRotation(
  current: AtlasFocusRotation,
  target: AtlasFocusRotation,
  alpha = FOCUS_LERP,
): AtlasFocusRotation {
  return {
    x: lerpAngle(current.x, target.x, alpha),
    y: lerpAngle(current.y, target.y, alpha),
  };
}

export function isFocusRotationSettled(
  current: AtlasFocusRotation,
  target: AtlasFocusRotation,
): boolean {
  return (
    Math.abs(shortestAngleDelta(current.x, target.x)) <= FOCUS_EPSILON &&
    Math.abs(shortestAngleDelta(current.y, target.y)) <= FOCUS_EPSILON
  );
}

export function lerpGlobeTiltToNeutral(
  currentTiltX: number,
  alpha = FOCUS_LERP,
): number {
  return THREE.MathUtils.lerp(currentTiltX, DEFAULT_GLOBE_TILT_X, alpha);
}

export function isGlobeTiltNeutral(currentTiltX: number): boolean {
  return Math.abs(currentTiltX - DEFAULT_GLOBE_TILT_X) <= FOCUS_EPSILON;
}
