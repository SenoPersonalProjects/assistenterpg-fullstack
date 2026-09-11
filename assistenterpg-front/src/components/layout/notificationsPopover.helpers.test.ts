import { describe, expect, it } from 'vitest';
import { getNotificationsPopoverPosition } from './notificationsPopover.helpers';

describe('getNotificationsPopoverPosition', () => {
  const trigger = { top: 12, right: 1230, bottom: 52, left: 1190 };

  it('alinha o painel ao sino no desktop sem ultrapassar a viewport', () => {
    expect(
      getNotificationsPopoverPosition({
        viewport: { width: 1280, height: 900 },
        trigger,
        content: { width: 416, height: 320 },
      }),
    ).toEqual({ left: 814, maxHeight: 820, top: 64, width: 416 });
  });

  it('mantém o painel seguro na viewport em telas pequenas', () => {
    expect(
      getNotificationsPopoverPosition({
        viewport: { width: 375, height: 812 },
        trigger,
      }),
    ).toEqual({ left: 16, maxHeight: 716, top: 80, width: 343 });
  });

  it('abre acima do sino quando não há espaço suficiente abaixo', () => {
    expect(
      getNotificationsPopoverPosition({
        viewport: { width: 1280, height: 500 },
        trigger: { top: 440, right: 1230, bottom: 480, left: 1190 },
        content: { width: 416, height: 320 },
      }),
    ).toEqual({ left: 814, maxHeight: 412, top: 108, width: 416 });
  });
});
