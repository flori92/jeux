import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['game/movePiece', 'game/selectPiece'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['game.players', 'game.pieces'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {game: GameState, settings: SettingsState}

export type AppDispatch = typeof store.dispatch;

export default store;
