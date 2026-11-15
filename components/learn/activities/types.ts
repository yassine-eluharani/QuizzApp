export interface ActivityProps<S> {
  step: S;
  challenge: boolean; // boss lesson: mistakes cost hearts
  onMistake: () => void;
  onDone: () => void;
}
