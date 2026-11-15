// Authoring helpers for scenes. Stage is 340 units wide; positions are relative to `parent` if given.
import type {
  ActorKind,
  SceneActor,
  SceneBeat,
  SceneFrame,
  ScenePoke,
  ScenePokeAction,
  SceneState,
  SceneStep,
} from './types';

type Props = Omit<SceneActor, 'id' | 'kind'>;
const make =
  (kind: ActorKind) =>
  (id: string, props: Props): SceneActor => ({ id, kind, ...props });

export const sBox = make('box'); // machine, node, cluster, namespace (add label)
export const sPod = make('pod'); // dashed pod outline
export const sCtr = make('ctr'); // container square with a short label
export const sTag = make('tag'); // pill with text
export const sUser = make('user'); // round badge (laptop, users)
export const sDot = make('dot'); // traffic packet
export const sArrow = make('arrow'); // needs dir
export const sText = make('text');
export const sCode = make('code'); // needs lines
export const sBar = make('bar'); // usage bar, fill 0-1

/** Show actors (opacity 1) with optional extra state. */
export const show = (...ids: string[]): Record<string, SceneState> =>
  Object.fromEntries(ids.map((id) => [id, { opacity: 1 }]));

export const hide = (...ids: string[]): Record<string, SceneState> =>
  Object.fromEntries(ids.map((id) => [id, { opacity: 0 }]));

/** Combine several set-maps; later ones win per field. */
export const all = (...sets: Record<string, SceneState>[]): Record<string, SceneState> => {
  const out: Record<string, SceneState> = {};
  for (const s of sets)
    for (const [id, st] of Object.entries(s)) out[id] = { ...(out[id] ?? {}), ...st };
  return out;
};

export const frame = (
  after: number,
  set: Record<string, SceneState>,
  caption?: string
): SceneFrame => ({
  after,
  set,
  ...(caption ? { caption } : {}),
});

export const tap = (target: string, frames: SceneFrame[]): ScenePokeAction => ({ target, frames });
export const press = (label: string, frames: SceneFrame[]): ScenePokeAction => ({ label, frames });
export const poke = (
  hint: string,
  actions: ScenePokeAction[],
  need: 'any' | 'all' = 'any'
): ScenePoke => ({
  hint,
  actions,
  need,
});

export const beat = (
  caption: string,
  set?: Record<string, SceneState>,
  extra: { title?: string; poke?: ScenePoke } = {}
): SceneBeat => ({ caption, ...(set ? { set } : {}), ...extra });

export const scene = (
  id: string,
  title: string,
  actors: SceneActor[],
  beats: SceneBeat[],
  stageHeight?: number
): SceneStep => ({
  type: 'scene',
  id,
  title,
  actors,
  beats,
  ...(stageHeight ? { stageHeight } : {}),
});
