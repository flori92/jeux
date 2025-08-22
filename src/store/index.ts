// Réexportations des slices
export * from './settingsSlice';
export * from './gameSlice';

// Export du store et des types
import store from './store';
import type { RootState, AppDispatch } from './store';

export { store };
export type { RootState, AppDispatch };

export default store;
