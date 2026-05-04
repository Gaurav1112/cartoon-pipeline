import { describe, it, expect } from 'vitest';
import { enforceSideProfile } from '../../src/compositions/episode1/side-profile-enforcer';
import type { ViralScene } from '../../src/compositions/episode1/types';

const baseScene = (chars: ViralScene['chars']): ViralScene => ({
  id: 't',
  bg: 'forest',
  time: 'day',
  dur: 'auto',
  chars,
  cam: 'static',
  camI: 0.5,
  dialogue: [],
});

describe('side-profile enforcer (Peppa M8)', () => {
  it('left-position character faces right (flip=false)', () => {
    const out = enforceSideProfile([
      baseScene([
        { id: 'arjun', pos: 'left', pose: 'idle_stand', expr: 'neutral' },
        { id: 'kaaliya', pos: 'right', pose: 'angry', expr: 'angry' },
      ]),
    ]);
    expect(out[0].chars[0].flip).toBe(false);
    expect(out[0].chars[1].flip).toBe(true);
  });

  it('center character faces the partner side', () => {
    const out = enforceSideProfile([
      // partner only on left → center should face left (flip=true)
      baseScene([
        { id: 'arjun', pos: 'left',   pose: 'idle_stand', expr: 'neutral' },
        { id: 'meera', pos: 'center', pose: 'talk_gesture', expr: 'happy' },
      ]),
      // partner only on right → center should face right (flip=false)
      baseScene([
        { id: 'meera', pos: 'center', pose: 'talk_gesture', expr: 'happy' },
        { id: 'arjun', pos: 'right',  pose: 'idle_stand', expr: 'neutral' },
      ]),
    ]);
    expect(out[0].chars[1].flip).toBe(true);
    expect(out[1].chars[0].flip).toBe(false);
  });

  it('three-character scene with both sides leaves center flip undefined', () => {
    const out = enforceSideProfile([
      baseScene([
        { id: 'arjun', pos: 'left',   pose: 'idle_stand', expr: 'neutral' },
        { id: 'meera', pos: 'center', pose: 'talk_gesture', expr: 'happy' },
        { id: 'bablu', pos: 'right',  pose: 'idle_stand', expr: 'neutral' },
      ]),
    ]);
    expect(out[0].chars[0].flip).toBe(false);
    expect(out[0].chars[1].flip).toBeUndefined();
    expect(out[0].chars[2].flip).toBe(true);
  });

  it('respects author override (does not overwrite explicit flip)', () => {
    const out = enforceSideProfile([
      baseScene([
        { id: 'arjun', pos: 'left',  pose: 'idle_stand', expr: 'neutral', flip: true },
        { id: 'kaaliya', pos: 'right', pose: 'angry',  expr: 'angry' },
      ]),
    ]);
    expect(out[0].chars[0].flip).toBe(true);
  });

  it('solo scene leaves flip untouched (no partner to face)', () => {
    const out = enforceSideProfile([
      baseScene([
        { id: 'kaaliya', pos: 'right', pose: 'angry', expr: 'angry' },
      ]),
    ]);
    expect(out[0].chars[0].flip).toBeUndefined();
  });

  it('is pure — does not mutate input scenes', () => {
    const input: ViralScene[] = [
      baseScene([
        { id: 'arjun', pos: 'left',  pose: 'idle_stand', expr: 'neutral' },
        { id: 'kaaliya', pos: 'right', pose: 'angry',  expr: 'angry' },
      ]),
    ];
    const before = JSON.stringify(input);
    enforceSideProfile(input);
    expect(JSON.stringify(input)).toBe(before);
  });
});
