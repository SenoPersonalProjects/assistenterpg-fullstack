export type TooltipPlacementInput = {
  pointerX: number;
  pointerY: number;
  containerWidth: number;
  containerHeight: number;
  tooltipWidth?: number;
  tooltipHeight?: number;
  offset?: number;
  padding?: number;
};

export type TooltipPlacement = {
  left: number;
  top: number;
};

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

export function calcularTooltipAtlasPosition({
  pointerX,
  pointerY,
  containerWidth,
  containerHeight,
  tooltipWidth = 220,
  tooltipHeight = 44,
  offset = 14,
  padding = 12,
}: TooltipPlacementInput): TooltipPlacement {
  const rightSpace = containerWidth - pointerX - padding;
  const preferredLeft =
    rightSpace >= tooltipWidth + offset
      ? pointerX + offset
      : pointerX - tooltipWidth - offset;

  return {
    left: clamp(preferredLeft, padding, containerWidth - tooltipWidth - padding),
    top: clamp(
      pointerY - tooltipHeight / 2,
      padding,
      containerHeight - tooltipHeight - padding,
    ),
  };
}
