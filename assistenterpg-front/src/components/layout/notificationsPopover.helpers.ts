export type NotificationsPopoverViewport = {
  width: number;
  height: number;
};

export type NotificationsPopoverTrigger = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type NotificationsPopoverContent = {
  width: number;
  height: number;
};

export type NotificationsPopoverPosition = {
  left: number;
  maxHeight: number;
  top: number;
  width: number;
};

export const NOTIFICATIONS_POPOVER_BREAKPOINT = 640;

const VIEWPORT_MARGIN = 16;
const TRIGGER_GAP = 12;
const DESKTOP_WIDTH = 416;
const MOBILE_TOP = 80;
const ESTIMATED_CONTENT_HEIGHT = 420;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

export function getNotificationsPopoverPosition({
  viewport,
  trigger,
  content,
}: {
  viewport: NotificationsPopoverViewport;
  trigger: NotificationsPopoverTrigger;
  content?: Partial<NotificationsPopoverContent>;
}): NotificationsPopoverPosition {
  const maxWidth = Math.max(0, viewport.width - VIEWPORT_MARGIN * 2);
  const width = Math.min(
    viewport.width < NOTIFICATIONS_POPOVER_BREAKPOINT
      ? maxWidth
      : content?.width || DESKTOP_WIDTH,
    maxWidth,
  );

  if (viewport.width < NOTIFICATIONS_POPOVER_BREAKPOINT) {
    const top = clamp(MOBILE_TOP, VIEWPORT_MARGIN, viewport.height - VIEWPORT_MARGIN);

    return {
      left: VIEWPORT_MARGIN,
      maxHeight: Math.max(0, viewport.height - top - VIEWPORT_MARGIN),
      top,
      width,
    };
  }

  const contentHeight = content?.height || ESTIMATED_CONTENT_HEIGHT;
  const spaceBelow = viewport.height - trigger.bottom - TRIGGER_GAP - VIEWPORT_MARGIN;
  const spaceAbove = trigger.top - TRIGGER_GAP - VIEWPORT_MARGIN;
  const openAbove = contentHeight > spaceBelow && spaceAbove > spaceBelow;
  const maxHeight = Math.max(0, openAbove ? spaceAbove : spaceBelow);
  const visibleHeight = Math.min(contentHeight, maxHeight);

  return {
    left: clamp(
      trigger.right - width,
      VIEWPORT_MARGIN,
      viewport.width - VIEWPORT_MARGIN - width,
    ),
    maxHeight,
    top: openAbove
      ? clamp(
          trigger.top - TRIGGER_GAP - visibleHeight,
          VIEWPORT_MARGIN,
          viewport.height - VIEWPORT_MARGIN - visibleHeight,
        )
      : clamp(
          trigger.bottom + TRIGGER_GAP,
          VIEWPORT_MARGIN,
          viewport.height - VIEWPORT_MARGIN - visibleHeight,
        ),
    width,
  };
}
