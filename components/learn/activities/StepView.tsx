import React from 'react';
import { DiagramView, FillView, OrderView } from './FillOrderDiagram';
import { ReadView, SpotView } from './ReadAndSpot';
import TerminalView from './TerminalView';
import TriageView from './TriageView';
import type { Step } from '@/lib/learn/types';

interface Props {
  step: Step;
  challenge: boolean;
  onMistake: () => void;
  onDone: () => void;
}

/** One component per step type; adding an activity means one case here. */
export default function StepView({ step, challenge, onMistake, onDone }: Props) {
  const p = { challenge, onMistake, onDone };
  switch (step.type) {
    case 'read':
      return <ReadView step={step} {...p} />;
    case 'fill':
      return <FillView step={step} {...p} />;
    case 'order':
      return <OrderView step={step} {...p} />;
    case 'spot':
      return <SpotView step={step} {...p} />;
    case 'triage':
      return <TriageView step={step} {...p} />;
    case 'diagram':
      return <DiagramView step={step} {...p} />;
    case 'terminal':
      return <TerminalView step={step} {...p} />;
  }
}
