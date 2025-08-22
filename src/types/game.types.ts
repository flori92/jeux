// Types de base
export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type PlayerStatus = 'waiting' | 'ready' | 'playing' | 'finished';

// Types pour les paramètres du jeu
export interface GameSettings {
  // Activer/désactiver les cases sécurisées
  enableSafeZones: boolean;
  // Exiger l'alignement des pions avant d'entrer dans la case finale
  requireAlignedPiecesForWin: boolean;
  // Autres paramètres existants
  maxPlayers: number;
  minPlayers: number;
  allowAI: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  enableSound: boolean;
  enableAnimations: boolean;
}

// Interface pour un joueur
export interface LudoPlayer {
  id: string;
  name: string;
  color: PlayerColor;
  score: number;
  status: PlayerStatus;
  isAI: boolean;
  pieces: LudoPiece[];
  startPosition: number;
  endPosition: number;
  homePosition: number;
  path: number[];
}

// Interface pour une pièce de jeu
export interface LudoPiece {
  id: string;
  playerId: string;
  position: number | 'home' | 'start' | 'end';
  isAtHome: boolean;
  isAtStart: boolean;
  isAtEnd: boolean;
  isSafe: boolean;
  isMovable: boolean;
  isSelected: boolean;
  pathIndex: number;
  stepCount: number;
}

// Interface pour le lancer de dé
export interface DiceRoll {
  value: number;
  timestamp: number;
  playerId: string;
  isDouble: boolean;
}

// Interface pour un mouvement de pièce
export interface LudoMove {
  pieceId: string;
  fromPosition: number | 'home' | 'start' | 'end';
  toPosition: number | 'home' | 'start' | 'end';
  playerId: string;
  timestamp: number;
  isCapture: boolean;
  capturedPieceId?: string;
}

// Interface pour l'état du jeu
export interface LudoGameState {
  id: string;
  players: LudoPlayer[];
  currentPlayerId: string | null;
  diceValue: number | null;
  diceRolls: DiceRoll[];
  moves: LudoMove[];
  status: GameStatus;
  winner: LudoPlayer | null;
  turn: number;
  round: number;
  selectedPieceId: string | null;
  possibleMoves: string[];
  canRollDice: boolean;
  lastMove: LudoMove | null;
  settings: {
    maxPlayers: number;
    minPlayers: number;
    allowAI: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    enableSound: boolean;
    enableAnimations: boolean;
  };
}

// Interface pour la configuration d'une partie
export interface LudoGameConfig {
  playerCount: number;
  playerNames?: string[];
  playerColors?: PlayerColor[];
  allowAI: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  enableSound: boolean;
  enableAnimations: boolean;
  maxTurns?: number;
  victoryCondition: 'firstToFinish' | 'points' | 'time';
}

// Interface pour les événements du jeu
export interface LudoGameEvent {
  type: 'dice_roll' | 'piece_move' | 'piece_capture' | 'game_start' | 'game_end' | 'player_turn' | 'player_win';
  playerId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

// Interface pour les statistiques de jeu
export interface LudoGameStats {
  totalGames: number;
  wins: Record<string, number>; // playerId -> nombre de victoires
  totalMoves: number;
  averageGameDuration: number;
  longestGame: number;
  shortestGame: number;
  mostCommonWinningColor: PlayerColor | null;
  averageDiceRoll: number;
  totalCaptures: number;
  mostCapturesInGame: number;
}

// Types pour les actions Redux
export const LudoActionTypes = {
  ROLL_DICE: 'ludo/ROLL_DICE',
  MOVE_PIECE: 'ludo/MOVE_PIECE',
  SELECT_PIECE: 'ludo/SELECT_PIECE',
  END_TURN: 'ludo/END_TURN',
  START_GAME: 'ludo/START_GAME',
  RESET_GAME: 'ludo/RESET_GAME',
  ADD_PLAYER: 'ludo/ADD_PLAYER',
  REMOVE_PLAYER: 'ludo/REMOVE_PLAYER',
  UNDO_MOVE: 'ludo/UNDO_MOVE',
  REDO_MOVE: 'ludo/REDO_MOVE',
  SAVE_GAME: 'ludo/SAVE_GAME',
  GAME_OVER: 'ludo/GAME_OVER',
  UPDATE_SETTINGS: 'ludo/UPDATE_SETTINGS',
  LOAD_GAME: 'ludo/LOAD_GAME'
} as const;


// Interface pour l'action de lancer de dé
export interface RollDiceAction {
  type: typeof LudoActionTypes.ROLL_DICE;
  payload: {
    playerId: string;
    value: number;
  };
}

// Interface pour l'action de déplacement de pièce
export interface MovePieceAction {
  type: typeof LudoActionTypes.MOVE_PIECE;
  payload: {
    pieceId: string;
    fromPosition: number | 'home' | 'start' | 'end';
    toPosition: number | 'home' | 'start' | 'end';
    playerId: string;
    isCapture?: boolean;
    capturedPieceId?: string;
  };
}

// Interface pour l'action de sélection de pièce
export interface SelectPieceAction {
  type: typeof LudoActionTypes.SELECT_PIECE;
  payload: {
    pieceId: string | null;
    playerId: string;
  };
}

// Type d'union pour toutes les actions du jeu
export type LudoAction =
  | RollDiceAction
  | MovePieceAction
  | SelectPieceAction
  | {
      type: typeof LudoActionTypes.END_TURN |
            typeof LudoActionTypes.START_GAME |
            typeof LudoActionTypes.RESET_GAME |
            typeof LudoActionTypes.UNDO_MOVE |
            typeof LudoActionTypes.REDO_MOVE |
            typeof LudoActionTypes.SAVE_GAME |
            typeof LudoActionTypes.GAME_OVER;
      payload?: Record<string, unknown>;
    }
  | {
      type: typeof LudoActionTypes.ADD_PLAYER |
            typeof LudoActionTypes.REMOVE_PLAYER;
      payload: LudoPlayer;
    }
  | {
      type: typeof LudoActionTypes.UPDATE_SETTINGS;
      payload: Partial<LudoGameState['settings']>;
    }
  | {
      type: typeof LudoActionTypes.LOAD_GAME;
      payload: LudoGameState;
    };

// Types utilitaires
export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Bounds = Position & Size;

export type AnimationState = 'idle' | 'moving' | 'rolling' | 'celebrating';

export type GamePhase = 'setup' | 'playing' | 'gameOver';

// Types pour les props des composants
export interface WithPlayerProps {
  player: LudoPlayer;
  currentPlayerId: string | null;
  isCurrentPlayer: boolean;
}

export interface WithGameStateProps {
  gameState: LudoGameState;
  dispatch: React.Dispatch<LudoAction>;
}

// Types pour les événements utilisateur
export type PieceClickHandler = (pieceId: string, event: React.MouseEvent) => void;
export type DiceRollHandler = () => void;
export type EndTurnHandler = () => void;

// Types pour les fonctions utilitaires
export type PositionCalculator = (piece: LudoPiece) => Position;
export type MoveValidator = (pieceId: string, targetPosition: number) => boolean;
export type MoveGenerator = (pieceId: string, diceValue: number) => number[];
