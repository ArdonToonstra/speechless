import * as migration_20251229_150135 from './20251229_150135';

export const migrations = [
  {
    up: migration_20251229_150135.up,
    down: migration_20251229_150135.down,
    name: '20251229_150135'
  },
];
