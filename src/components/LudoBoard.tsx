import React, { useState, useEffect, useCallback } from 'react';
import './LudoBoard.css';

interface LudoPiece {
  id: string;
  playerId: string;
  position: number | 'home' | 'safe';
  color: 'red' | 'blue' | 'yellow' | 'green';
  isAtHome: boolean;
  isMovable: boolean;
}

interface LudoPlayer {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'yellow' | 'green';
  pieces: LudoPiece[];
  isActive: boolean;
}

interface LudoGameState {
  players: LudoPlayer[];
  currentPlayerIndex: number;
  diceValue: number | null;
  canRollDice: boolean;
  winner: LudoPlayer | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
}

interface LudoBoardProps {
  gameState: LudoGameState;
  playerId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: string) => void;
}

// Type guard pour vérifier si un objet est un LudoPlayer
const isLudoPlayer = (obj: any): obj is LudoPlayer => {
  return obj && typeof obj === 'object' && 'id' in obj && 'pieces' in obj;
};

const LudoBoard: React.FC<LudoBoardProps> = ({ 
  gameState, 
  playerId, 
  onRollDice, 
  onMovePiece 
}) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  // Calculer les mouvements possibles
  const calculatePossibleMoves = useCallback(() => {
    if (!gameState.diceValue) return [];
    
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer) return [];

    return currentPlayer.pieces
      .filter(piece => {
        // Peut sortir de la maison avec un 6
        if (piece.isAtHome && gameState.diceValue === 6) return true;
        // Peut bouger sur le plateau
        if (!piece.isAtHome && typeof piece.position === 'number') return true;
        return false;
      })
      .map(piece => piece.id);
  }, [gameState.diceValue, gameState.players, playerId]);

  // Mettre à jour les mouvements possibles quand le dé change
  useEffect(() => {
    setPossibleMoves(calculatePossibleMoves());
  }, [calculatePossibleMoves]);

  // Gérer le clic sur une pièce
  const handlePieceClick = useCallback((pieceId: string) => {
    if (possibleMoves.includes(pieceId)) {
      onMovePiece(pieceId);
      setSelectedPiece(null);
      setPossibleMoves([]);
    } else {
      setSelectedPiece(pieceId);
    }
  }, [possibleMoves, onMovePiece]);

  // Get position coordinates for pieces on track
  const getPositionCoordinates = (position: number): { x: number; y: number } => {
    const centerX = 300;
    const centerY = 300;
    const radius = 200;
    const angle = (position * 360 / 52) * (Math.PI / 180);
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="ludo-container">
      <div className="ludo-board">
        {/* Top section */}
        <div className="board-section top">
          {/* Red home */}
          <div className="home-area red-home">
            <div className="home-grid">
              {gameState.players[0]?.pieces.filter(p => p.isAtHome).map((piece, index) => (
                <div
                  key={piece.id}
                  className={`piece red-piece ${selectedPiece === piece.id ? 'selected' : ''}`}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Top track */}
          <div className="track-section horizontal-track top-track">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="track-cell">
                {gameState.players.flatMap(p => p.pieces)
                  .filter(piece => piece.position === i)
                  .map(piece => (
                    <div
                      key={piece.id}
                      className={`piece ${piece.color}-piece track-piece`}
                      onClick={() => handlePieceClick(piece.id)}
                    />
                  ))}
              </div>
            ))}
          </div>

          {/* Blue home */}
          <div className="home-area blue-home">
            <div className="home-grid">
              {gameState.players[1]?.pieces.filter(p => p.isAtHome).map((piece, index) => (
                <div
                  key={piece.id}
                  className={`piece blue-piece ${selectedPiece === piece.id ? 'selected' : ''}`}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle section */}
        <div className="board-section middle">
          {/* Left track */}
          <div className="track-section vertical-track left-track">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="track-cell">
                {gameState.players.flatMap(p => p.pieces)
                  .filter(piece => piece.position === 39 + i)
                  .map(piece => (
                    <div
                      key={piece.id}
                      className={`piece ${piece.color}-piece track-piece`}
                      onClick={() => handlePieceClick(piece.id)}
                    />
                  ))}
              </div>
            ))}
          </div>

          {/* Center area */}
          <div className="center-area">
            <div className="center-triangle">
              <div className="triangle red-triangle"></div>
              <div className="triangle blue-triangle"></div>
              <div className="triangle yellow-triangle"></div>
              <div className="triangle green-triangle"></div>
            </div>
          </div>

          {/* Right track */}
          <div className="track-section vertical-track right-track">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="track-cell">
                {gameState.players.flatMap(p => p.pieces)
                  .filter(piece => piece.position === 13 + i)
                  .map(piece => (
                    <div
                      key={piece.id}
                      className={`piece ${piece.color}-piece track-piece`}
                      onClick={() => handlePieceClick(piece.id)}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="board-section bottom">
          {/* Yellow home */}
          <div className="home-area yellow-home">
            <div className="home-grid">
              {gameState.players[2]?.pieces.filter(p => p.isAtHome).map((piece, index) => (
                <div
                  key={piece.id}
                  className={`piece yellow-piece ${selectedPiece === piece.id ? 'selected' : ''}`}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom track */}
          <div className="track-section horizontal-track bottom-track">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="track-cell">
                {gameState.players.flatMap(p => p.pieces)
                  .filter(piece => piece.position === 26 + i)
                  .map(piece => (
                    <div
                      key={piece.id}
                      className={`piece ${piece.color}-piece track-piece`}
                      onClick={() => handlePieceClick(piece.id)}
                    />
                  ))}
              </div>
            ))}
          </div>

          {/* Green home */}
          <div className="home-area green-home">
            <div className="home-grid">
              {gameState.players[3]?.pieces.filter(p => p.isAtHome).map((piece, index) => (
                <div
                  key={piece.id}
                  className={`piece green-piece ${selectedPiece === piece.id ? 'selected' : ''}`}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game controls */}
      <div className="game-controls">
        <div className="current-player">
          Tour de: <span className={`player-name ${currentPlayer?.color}`}>
            {currentPlayer?.name}
          </span>
        </div>
        
        <div className="dice-container">
          <div className="dice" onClick={onRollDice}>
            {gameState.diceValue || '🎲'}
          </div>
          {gameState.canRollDice && (
            <button className="roll-button" onClick={onRollDice}>
              Lancer le dé
            </button>
          )}
        </div>

        <div className="players-info">
          {gameState.players.map(player => (
            <div key={player.id} className={`player-info ${player.isActive ? 'active' : ''}`}>
              <div className={`player-color ${player.color}`}></div>
              <span>{player.name}</span>
              <span className="pieces-home">
                ({player.pieces.filter(p => p.isAtHome).length}/4)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LudoBoard;