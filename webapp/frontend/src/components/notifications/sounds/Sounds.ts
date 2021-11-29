import { beepSound } from './beep';
import { annoyingSound } from './annoying_alarm_clock';
export const SOUNDS_DICTIONARY = new Map<string, string>();

SOUNDS_DICTIONARY.set('beep', beepSound);
SOUNDS_DICTIONARY.set('annoying alarm clock', annoyingSound);
