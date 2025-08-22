import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LudoPlayer } from '../types/game.types';

export interface GameState {

  players: LudoPlayer[];
  currentPlayerId: string | null;
  diceValue: number | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: LudoPlayer | null;
  selectedPieceId: string | null;
  possibleMoves: string[];
  canRollDice: boolean;
}

const initialState: GameState = {
  players: [],
  currentPlayerId: null,
  diceValue: null,
  gameStatus: 'waiting',
  winner: null,
  selectedPieceId: null,
  possibleMoves: [],
  canRollDice: true,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<{players: LudoPlayer[]}>) => {
      state.players = action.payload.players;
      state.currentPlayerId = action.payload.players[0]?.id || null;
      state.gameStatus = 'playing';
      state.canRollDice = true;
    },
    rollDice: (state, action: PayloadAction<{playerId: string; value: number}>) => {
      if (state.currentPlayerId !== action.payload.playerId) return;
      
      state.diceValue = action.payload.value;
      state.canRollDice = false;
      
      // Ici, vous pouvez ajouter la logique pour déterminer les mouvements possibles
      // et les stocker dans state.possibleMoves
    },
    selectPiece: (state, action: PayloadAction<{pieceId: string | null}>) => {
      state.selectedPieceId = action.payload.pieceId;
    },
    movePiece: (state, action: PayloadAction<{
      pieceId: string;
      toPosition: number | 'home' | 'start' | 'end';
    }>) => {
      const { pieceId, toPosition } = action.payload;
      
      // Trouver la pièce qui se déplace
      const movingPiece = state.players
        .flatMap(p => p.pieces)
        .find(p => p.id === pieceId);
      
      if (!movingPiece) return;
      
      // Vérifier si la case de destination contient un pion adverse
      const currentPlayer = state.players.find(p => p.id === movingPiece.playerId);
      
      if (!currentPlayer) return;
      
      // Parcourir tous les joueurs sauf le joueur actuel
      state.players.forEach(player => {
        if (player.id === movingPiece.playerId) return;
        
        // Vérifier chaque pion du joueur adverse
        player.pieces.forEach(opponentPiece => {
          // Vérifier si le pion adverse est sur la case de destination
          if (opponentPiece.position === toPosition && 
              typeof toPosition === 'number' && 
              !opponentPiece.isSafe) {
            // Le pion adverse est capturé, on le renvoie à sa position de départ
            opponentPiece.position = 'home';
            opponentPiece.isAtHome = true;
            opponentPiece.isAtStart = false;
            opponentPiece.stepCount = 0;
            
            // Mettre à jour le score du joueur actuel
            currentPlayer.score += 1;
          }
        });
      });
      
      // Déplacer la pièce
      movingPiece.position = toPosition;
      movingPiece.isAtHome = toPosition === 'home';
      movingPiece.isAtStart = toPosition === 'start';
      
      // Mettre à jour le compteur de pas si c'est un nombre
      if (typeof toPosition === 'number') {
        movingPiece.stepCount = toPosition;
      }
      
      state.selectedPieceId = null;
      state.possibleMoves = [];
    },
    endTurn: (state) => {
      if (!state.currentPlayerId) return;
      
      const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
      
      state.currentPlayerId = state.players[nextPlayerIndex]?.id || null;
      state.diceValue = null;
      state.canRollDice = true;
    },
    setWinner: (state, action: PayloadAction<{player: LudoPlayer}>) => {
      state.winner = action.payload.player;
      state.gameStatus = 'finished';
    },
  },
});

export const {
  startGame,
  rollDice,
  selectPiece,
  movePiece,
  endTurn,
  setWinner,
} = gameSlice.actions;

export default gameSlice.reducer;
