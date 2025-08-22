import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GameSettings } from '../types/game.types';

export type { GameSettings } from '../types/game.types';

// Paramètres par défaut
const initialState: GameSettings = {
  enableSafeZones: true,
  requireAlignedPiecesForWin: false,
  maxPlayers: 4,
  minPlayers: 2,
  allowAI: true,
  difficulty: 'medium',
  enableSound: true,
  enableAnimations: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      return { ...state, ...action.payload };
    },
    resetSettings: () => {
      return initialState;
    },
  },
});

// Export des actions
export const settingsActions = settingsSlice.actions;

export const { updateSettings, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
