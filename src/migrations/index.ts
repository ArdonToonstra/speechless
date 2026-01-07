import * as migration_20251229_150135 from './20251229_150135';
import * as migration_20260107_092728_enable_rls from './20260107_092728_enable_rls';

export const migrations = [
  {
    up: migration_20251229_150135.up,
    down: migration_20251229_150135.down,
    name: '20251229_150135',
  },
  {
    up: migration_20260107_092728_enable_rls.up,
    down: migration_20260107_092728_enable_rls.down,
    name: '20260107_092728_enable_rls'
  },
];
