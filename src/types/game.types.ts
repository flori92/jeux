export type Player = {
  id: string;
  name: string;
  color: 'black' | 'white';
};

export type Piece = {
  id: string;
  playerId: string;
  isKing: boolean;
  position: [number, number];
};

export type GameState = {
  id: string;
  board: (Piece | null)[][];
  players: Player[];
  pieces: Record<string, Piece[]>; // Map des pièces par ID de joueur
  currentPlayer: string;
  winner: string | null;
  status: 'waiting' | 'playing' | 'finished';
  gameType?: 'checkers' | 'ludo';
  // Propriétés spécifiques au Ludo
  diceValue?: number;
  possibleMoves?: string[];
  canRollDice?: boolean;
  gameStatus?: 'waiting' | 'playing' | 'finished';
};

export type Move = {
  from: [number, number];
  to: [number, number];
  capturedPiece?: [number, number];
};
