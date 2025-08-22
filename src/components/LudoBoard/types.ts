import type { LudoPiece, LudoPlayer } from '../../types/game.types';

export interface LudoBoardProps {
  // Propriétés du composant LudoBoard
  onPieceSelect?: (pieceId: string) => void;
  onDiceRoll?: () => void;
  onMovePiece?: (pieceId: string, targetPosition: number) => void;
  onEndTurn?: () => void;
  currentPlayer?: LudoPlayer | null;
  players?: LudoPlayer[];
  diceValue?: number | null;
  isRolling?: boolean;
  gameStatus?: 'waiting' | 'playing' | 'finished';
  winner?: LudoPlayer | null;
  selectedPieceId?: string | null;
  possibleMoves?: string[];
}

export interface HouseProps {
  houseNumber: number;
  pieces: LudoPiece[];
  color: string;
  disabled?: boolean;
  onPieceClick?: (pieceId: string) => void;
  selectedPieceId?: string | null;
}

export interface RailProps {
  color: string;
  pieces: LudoPiece[];
  disabled?: boolean;
  onPieceClick?: (pieceId: string) => void;
  selectedPieceId?: string | null;
}

export interface SideBoardProps {
  currentPlayer?: LudoPlayer | null;
  players?: LudoPlayer[];
  diceValue?: number | null;
  gameStatus?: 'waiting' | 'playing' | 'finished';
  winner?: LudoPlayer | null;
  onRollDice?: () => void;
  onEndTurn?: () => void;
  canRollDice?: boolean;
  canEndTurn?: boolean;
}

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
