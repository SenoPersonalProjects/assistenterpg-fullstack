import { describe, expect, it } from 'vitest';
import { calcularTooltipAtlasPosition } from './tooltip';

describe('calcularTooltipAtlasPosition', () => {
  it('places tooltip to the right when there is room', () => {
    const position = calcularTooltipAtlasPosition({
      pointerX: 80,
      pointerY: 120,
      containerWidth: 500,
      containerHeight: 300,
      tooltipWidth: 120,
      tooltipHeight: 40,
      offset: 10,
      padding: 8,
    });

    expect(position.left).toBe(90);
    expect(position.top).toBe(100);
  });

  it('flips tooltip to the left near the right edge', () => {
    const position = calcularTooltipAtlasPosition({
      pointerX: 470,
      pointerY: 120,
      containerWidth: 500,
      containerHeight: 300,
      tooltipWidth: 120,
      tooltipHeight: 40,
      offset: 10,
      padding: 8,
    });

    expect(position.left).toBe(340);
    expect(position.top).toBe(100);
  });

  it('keeps tooltip inside small containers', () => {
    const position = calcularTooltipAtlasPosition({
      pointerX: 20,
      pointerY: 280,
      containerWidth: 160,
      containerHeight: 120,
      tooltipWidth: 140,
      tooltipHeight: 50,
      padding: 8,
    });

    expect(position.left).toBe(8);
    expect(position.top).toBe(62);
  });
});
