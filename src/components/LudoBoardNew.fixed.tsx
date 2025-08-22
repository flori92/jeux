import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC, JSX } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import './LudoBoardNew.css';

// Types spécifiques pour le jeu de Ludo
type LudoPosition = 'base' | 'finished' | number | 'home' | 'track';
type LudoColor = 'red' | 'blue' | 'yellow' | 'green';

interface LudoPiece {
  id: string;
  playerId: string;
  isKing: boolean;
  position: LudoPosition;
  isInPlay?: boolean;
  distanceTraveled?: number;
}

interface LudoPlayer {
  id: string;
  name: string;
  color: LudoColor;
  pieces: LudoPiece[];
  finishedPieces: number;
  isActive: boolean;
  isAI?: boolean;
}

interface LudoGameState {
  id: string;
  players: LudoPlayer[];
  currentPlayer: LudoPlayer;
  currentPlayerIndex: number;
  status: 'waiting' | 'playing' | 'finished' | 'active';
  board?: null;
  pieces?: Record<string, LudoPiece[]>;
  winner: LudoPlayer | null;
  gameType: 'ludo';
  diceValue: number | null;
  canRollDice: boolean;
  possibleMoves: string[];
  gameStatus: 'waiting' | 'playing' | 'finished' | 'active';
  settings?: {
    allowBackwardInEndZone: boolean;
    requireAllPiecesInEndZone: boolean;
  };
}

interface LudoBoardNewProps {
  gameState: LudoGameState;
  playerId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: string, direction: 'forward' | 'backward', rules: unknown) => void;
  isCurrentPlayer?: boolean;
  isMultiplayer?: boolean;
}

// Type guard pour vérifier si un objet est un LudoPlayer
const isLudoPlayer = (player: unknown): player is LudoPlayer => {
  if (typeof player !== 'object' || player === null) return false;
  const p = player as Record<string, unknown>;
  
  return (
    'pieces' in p && Array.isArray(p.pieces) &&
    'color' in p && ['red', 'blue', 'yellow', 'green'].includes(p.color as string) &&
    'id' in p && typeof p.id === 'string' &&
    'name' in p && typeof p.name === 'string' &&
    'isActive' in p && typeof p.isActive === 'boolean'
  );
};

const LudoBoardNew: FC<LudoBoardNewProps> = ({ 
  gameState, 
  playerId, 
  onRollDice, 
  onMovePiece 
}): JSX.Element => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const { showInfo } = useNotifications();
  
  // Mémorisation des valeurs calculées
  const isPlayerTurn = useMemo(
    () => gameState.players.some(p => p.id === playerId && p.isActive),
    [gameState.players, playerId]
  );
  
  // Calcul des dimensions du plateau
  const boardSize = Math.min(window.innerHeight * 0.9, 800);
  // Suppression des variables non utilisées
  // const houseSize = boardSize * 0.4;
  // const seedSize = boardSize * 0.06;

  // Gestion des mouvements possibles
  useEffect(() => {
    if (gameState.diceValue && gameState.currentPlayer?.id === playerId) {
      const movablePieces: string[] = [];
      
      if (!isLudoPlayer(gameState.currentPlayer)) {
        console.error('Le joueur actuel n\'a pas de pièces valides');
        return;
      }
      
      gameState.currentPlayer.pieces.forEach((piece) => {
        if (piece.position === 'base' && gameState.diceValue === 6) {
          movablePieces.push(piece.id);
        } else if (piece.position !== 'base' && piece.position !== 'finished') {
          if (gameState.diceValue !== null) {
            const currentPos = typeof piece.position === 'number' ? piece.position : 0;
            const newPos = currentPos + gameState.diceValue;
            if (newPos <= 51) {
              movablePieces.push(piece.id);
            }
          }
        }
      });
      
      setPossibleMoves(movablePieces);
      
      if (movablePieces.length === 0 && gameState.diceValue) {
        showInfo('Aucun mouvement possible', `Avec un ${gameState.diceValue}, aucun pion ne peut bouger.`);
      }
    } else {
      setPossibleMoves([]);
    }
  }, [gameState.diceValue, gameState.currentPlayer, playerId, showInfo]);

  // Gestion du clic sur une pièce
  const handlePieceClick = useCallback((pieceId: string) => {
    if (!isPlayerTurn) return;

    // Vérifier si un mouvement de capture est possible
    const isCapture = gameState.possibleMoves.includes(pieceId) && 
      gameState.players.some(player => 
        player.pieces.some(p => 
          p.position === gameState.diceValue && 
          p.playerId !== playerId
        )
      );

    // Si une pièce est déjà sélectionnée, on tente de la déplacer
    if (selectedPiece) {
      if (possibleMoves.includes(pieceId)) {
        onMovePiece(pieceId, 'forward', { 
          diceValue: gameState.diceValue,
          isCapture
        });
        setSelectedPiece(null);
        setPossibleMoves([]);
      } else {
        // Si on clique sur une autre pièce, on la sélectionne
        setSelectedPiece(pieceId);
      }
    } else {
      // Sélection d'une nouvelle pièce
      setSelectedPiece(pieceId);
      showInfo(`Pièce ${pieceId} sélectionnée`, 'info');
    }
  }, [isPlayerTurn, selectedPiece, possibleMoves, onMovePiece, gameState.diceValue, gameState.possibleMoves, gameState.players, playerId, showInfo]);

  // Rendu des pièces dans les maisons
  const renderHousePieces = (player: LudoPlayer): JSX.Element => {
    const housePieces = player.pieces.filter(piece => piece.position === 'base');
    
    return (
      <div 
        key={`house-${player.id}`}
        className={`house ${player.color}-house`}
      >
        {housePieces.map(piece => (
          <div
            key={piece.id}
            className={`piece ${player.color} ${selectedPiece === piece.id ? 'selected' : ''}`}
            onClick={() => handlePieceClick(piece.id)}
          />
        ))}
      </div>
    );
  };

  // Rendu des pièces sur les rails
  const renderRailPieces = useCallback((color: LudoColor): JSX.Element => {
    // Récupérer toutes les pièces sur le rail de la couleur spécifiée
    const railPieces = gameState.players.flatMap(player => 
      player.pieces
        .filter(piece => piece.position === 'track' && player.color === color)
        .map(piece => ({
          ...piece,
          playerColor: player.color
        }))
    );

    return (
      <div className={`rail-container rail-${color}`}>
        {railPieces.map(piece => {
          const isMovable = possibleMoves.includes(piece.id);
          const isSelected = selectedPiece === piece.id;
          
          return (
            <div 
              key={`rail-${piece.id}`}
              className={`piece ${piece.playerColor} ${isSelected ? 'selected' : ''} ${isMovable ? 'movable' : ''}`}
              onClick={() => {
                if (isPlayerTurn) {
                  if (isSelected) {
                    setSelectedPiece(null);
                  } else if (isMovable) {
                    onMovePiece(piece.id, 'forward', {
                      diceValue: gameState.diceValue,
                      isCapture: false // À implémenter si nécessaire
                    });
                    setSelectedPiece(null);
                    setPossibleMoves([]);
                  } else {
                    setSelectedPiece(piece.id);
                  }
                }
              }}
              title={isMovable ? 'Cliquez pour déplacer cette pièce' : ''}
            />
          );
        })}
      </div>
    );
  }, [gameState.players, gameState.diceValue, isPlayerTurn, onMovePiece, possibleMoves, selectedPiece]);

  // Rendu des dés
  const renderDice = useCallback((): JSX.Element | null => {
    if (!isPlayerTurn) return null;

    return (
      <div className="dice-container">
        <button 
          className="dice" 
          onClick={onRollDice}
          disabled={!gameState.canRollDice}
        >
          {gameState.diceValue || '🎲'}
        </button>
      </div>
    );
  }, [isPlayerTurn, gameState.canRollDice, gameState.diceValue, onRollDice]);

  // Vérification de l'état de chargement
  if (!gameState || !gameState.players) {
    return <div>Chargement du plateau de jeu...</div>;
  }

  // Rendu du plateau de jeu
  return (
    <div className="ludo-board" style={{ width: boardSize, height: boardSize }}>
      {/* Maisons des joueurs */}
      {gameState.players.map((player, index) => (
        <div 
          key={`house-${index}`}
          className={`ludo-house ludo-house-${player.color} ${player.isActive ? 'active' : ''}`}
          style={{
            gridArea: `house-${index + 1}`,
            border: player.isActive ? '3px solid white' : 'none',
            backgroundColor: player.color,
            borderRadius: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {renderHousePieces(player)}
        </div>
      ))}
      
      {/* Rails */}
      <div className="ludo-rails">
        {gameState.players.map((player, index) => (
          <div 
            key={`rail-${index}`}
            className={`ludo-rail ludo-rail-${player.color}`}
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '10px',
              margin: '5px'
            }}
          >
            {renderRailPieces(player.color)}
          </div>
        ))}
      </div>
      
      {/* Zone centrale */}
      <div className="ludo-center">
        <div className="ludo-center-inner">
          <h2>Ludo</h2>
          {gameState.winner && (
            <div className="ludo-winner">
              Le joueur {gameState.winner.name} a gagné !
            </div>
          )}
        </div>
      </div>
      
      {/* Dés */}
      {renderDice()}
    </div>
  );
};

export default LudoBoardNew;
