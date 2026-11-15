// Learn: data model. A Path contains Units, Units contain Lessons, Lessons contain Steps.
// Lessons are plain TypeScript data; one component per step type renders them.

export type IconName =
  | 'box'
  | 'gate'
  | 'key'
  | 'layers'
  | 'disk'
  | 'rocket'
  | 'shield'
  | 'eye'
  | 'grid'
  | 'alert'
  | 'wheel'
  | 'cluster';

export interface ReadStep {
  type: 'read';
  id: string;
  title: string;
  body: string[]; // paragraphs
  code?: string; // optional monospace block (manifest, command output)
  callout?: string; // "In production" takeaway
}

/** A code/text block with [[slot]] markers, filled by dropping chips (fill, order and diagram all use this). */
export interface SlotDef {
  answer: string;
  why: string; // production reason, shown after checking
}

export interface FillStep {
  type: 'fill';
  id: string;
  title: string;
  prompt: string;
  code: string; // contains [[slotId]] markers
  slots: Record<string, SlotDef>;
  chips: string[]; // every answer plus distractors
}

/** Put items in the right order: slot "1".."n", answer is the item that belongs there. */
export interface OrderStep {
  type: 'order';
  id: string;
  title: string;
  prompt: string;
  items: string[]; // correct order
  distractors?: string[];
  why: string;
}

export interface SpotStep {
  type: 'spot';
  id: string;
  title: string;
  prompt: string;
  lines: string[]; // code lines (1 line per entry)
  bugs: { line: number; why: string }[]; // 0-based line indexes that are risky
  clean?: string; // shown when everything is selected right
}

export interface TriageChoice {
  cmd: string;
  hint: string;
  next: string; // node id
  good: boolean;
  cost: number; // minutes of customer impact added
}
export interface TriageNode {
  output: string; // terminal-style output shown for this node
  question?: string;
  choices?: TriageChoice[];
  end?: { rootCause: string; fix: string; lesson: string };
}
export interface TriageStep {
  type: 'triage';
  id: string;
  title: string;
  alert: string;
  start: string;
  par: number; // minutes of impact for the best path
  nodes: Record<string, TriageNode>;
}

export interface DiagramNode {
  id: string;
  label?: string; // fixed box
  slot?: SlotDef; // empty box to fill
  note?: string;
}
export interface DiagramStep {
  type: 'diagram';
  id: string;
  title: string;
  prompt: string;
  rows: DiagramNode[][]; // each row is drawn left-to-right, rows connect top to bottom
  chips: string[];
}

export interface TerminalCommand {
  match: string; // regex source, tested against the normalised command
  output: string;
  goal?: boolean; // running this finishes the step
  mistake?: string; // running this is a mistake; message explains why
}
export interface TerminalStep {
  type: 'terminal';
  id: string;
  title: string;
  prompt: string;
  goal: string;
  try: string[]; // suggested commands (tappable chips)
  commands: TerminalCommand[];
}

// ---- Visual lessons: animated scenes -------------------------------------------------------
// A scene is a small stage with actors (boxes, pods, containers, dots...) and a list of beats.
// Each beat changes some actors (they animate there) and shows a caption. A beat can also be a
// "poke": the learner taps an actor or a button and a timed sequence of frames plays.

export type Tone = 'normal' | 'accent' | 'ok' | 'warn' | 'danger' | 'dim';
export type ActorKind =
  | 'box'
  | 'ctr'
  | 'pod'
  | 'tag'
  | 'user'
  | 'dot'
  | 'arrow'
  | 'text'
  | 'code'
  | 'bar';

export interface SceneActor {
  id: string;
  kind: ActorKind;
  x: number; // stage units (the stage is 340 wide); relative to `parent` when set
  y: number;
  w?: number;
  h?: number;
  label?: string;
  tone?: Tone;
  color?: 'orange' | 'paper' | 'teal' | 'blue';
  parent?: string; // must be declared earlier
  dir?: 'right' | 'down' | 'left' | 'up'; // arrow
  lines?: string[]; // code
  limit?: number; // bar: marker position 0-1
  fontSize?: number;
}

/** Animatable state. Anything left out keeps its previous value. Actors start hidden (opacity 0). */
export interface SceneState {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  opacity?: number;
  scale?: number;
  tone?: Tone;
  label?: string;
  hl?: number[]; // code: highlighted line indexes
  fill?: number; // bar: 0-1
}

export interface SceneFrame {
  after: number; // ms after the tap
  set: Record<string, SceneState>;
  caption?: string;
}

export interface ScenePokeAction {
  target?: string; // tap this actor...
  label?: string; // ...or press this button
  frames: SceneFrame[];
}

export interface ScenePoke {
  hint: string;
  actions: ScenePokeAction[];
  need?: 'any' | 'all'; // how many actions must run before Next unlocks (default any)
}

export interface SceneBeat {
  title?: string;
  caption: string; // **bold** is supported
  set?: Record<string, SceneState>;
  poke?: ScenePoke;
}

export interface SceneStep {
  type: 'scene';
  id: string;
  title: string; // short, shown above the stage
  stageHeight?: number; // stage units, default 300
  actors: SceneActor[];
  beats: SceneBeat[];
}

export type Step =
  | SceneStep
  | ReadStep
  | FillStep
  | OrderStep
  | SpotStep
  | TriageStep
  | DiagramStep
  | TerminalStep;

export interface Lesson {
  id: string;
  title: string;
  boss?: boolean; // challenge lesson: hearts apply, doubles as the unit's test-out
  steps: Step[];
}

export interface Unit {
  id: string;
  title: string;
  blurb: string;
  icon: IconName;
  badge: { id: string; title: string };
  lessons: Lesson[];
}

export interface LearnPath {
  id: string;
  title: string;
  story: string; // one-line story, e.g. "Run Bubbled Shop in production"
  units: Unit[];
}

export interface LessonResult {
  mistakes: number;
  stepCount: number;
  failed?: boolean; // ran out of hearts in a boss lesson
}
