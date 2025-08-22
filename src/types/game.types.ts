export interface Player {
  id: string;
  name: string;
  color: 'black' | 'white' | 'red' | 'blue' | 'yellow' | 'green';
};

export type Piece = {
  id: string;
  playerId: string;
  isKing: boolean;
  position: [number, number];
};

export type GameState = {
  id: string;
  players: Player[];
  currentPlayer: string;
  status: 'waiting' | 'playing' | 'finished' | 'active';
  board?: (Piece | null)[][] | null;
  winner?: string;
  gameType?: 'checkers' | 'ludo';
  diceValue?: number | null;
  possibleMoves?: string[];
  canRollDice?: boolean;
  gameStatus?: 'waiting' | 'playing' | 'finished' | 'active';
};

export type Move = {
  from: [number, number];
  to: [number, number];
  capturedPiece?: [number, number];
};
