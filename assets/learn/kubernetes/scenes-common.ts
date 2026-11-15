import {
  all,
  beat,
  frame,
  poke,
  scene,
  sBox,
  sCtr,
  sPod,
  sTag,
  sText,
  show,
  tap,
} from '@/lib/learn/sceneDsl';
import type { SceneActor } from '@/lib/learn/types';

/** Small pod (56x54) with one app container. Children: <id>c. */
export const mini = (
  id: string,
  x: number,
  y: number,
  parent?: string,
  label = 'app'
): SceneActor[] => [
  sPod(id, { parent, x, y, w: 56, h: 54, tone: 'accent' }),
  sCtr(`${id}c`, { parent: id, x: 15, y: 20, w: 26, h: 26, label, color: 'orange' }),
];

/** Pod with a text tag underneath the container (an IP, a label, a version). Children: <id>c, <id>t. */
export const tagged = (
  id: string,
  x: number,
  y: number,
  text: string,
  parent?: string
): SceneActor[] => [
  sPod(id, { parent, x, y, w: 100, h: 72, tone: 'accent' }),
  sCtr(`${id}c`, { parent: id, x: 37, y: 8, w: 26, h: 26, label: 'app', color: 'orange' }),
  sTag(`${id}t`, { parent: id, x: 4, y: 44, w: 92, h: 20, label: text }),
];

/**
 * Tap-to-learn scene: a list of items, tap each to read what it means. Used for statuses,
 * hardening settings and similar glossaries.
 */
export const tapToLearn = (
  id: string,
  title: string,
  intro: string,
  hint: string,
  items: { label: string; info: string }[]
) => {
  const rowH = 36;
  const infoY = 14 + items.length * rowH + 8;
  const actors: SceneActor[] = [
    ...items.map((it, i) =>
      sTag(`i${i}`, { x: 20, y: 14 + i * rowH, w: 300, h: 28, label: it.label, tone: 'normal' })
    ),
    sBox('infobox', { x: 14, y: infoY, w: 312, h: 90, tone: 'dim' }),
    sText('info', { x: 24, y: infoY + 10, w: 292, label: '', fontSize: 11 }),
  ];
  return scene(
    id,
    title,
    actors,
    [
      beat(intro, all(show(...items.map((_, i) => `i${i}`)), show('infobox')), { title }),
      beat('Tap every item to read what it means.', undefined, {
        title,
        poke: poke(
          hint,
          items.map((it, i) =>
            tap(`i${i}`, [
              frame(0, { [`i${i}`]: { tone: 'ok' }, info: { opacity: 1, label: it.info } }),
            ])
          ),
          'all'
        ),
      }),
    ],
    infoY + 100
  );
};
