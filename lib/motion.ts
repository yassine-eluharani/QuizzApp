import { Easing } from 'react-native-reanimated';

// Strong ease-out: instant-feeling start, soft landing. Use for everything that enters.
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
