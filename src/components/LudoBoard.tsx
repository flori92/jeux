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

const LudoBoard: React.FC = () => {
  const [gameState, setGameState] = useState<LudoGameState>({
    players: [],
    currentPlayerIndex: 0,
    diceValue: null,
    canRollDice: true,
    winner: null,
    gameStatus: 'waiting'
  });
  
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  // Initialize game
  useEffect(() => {
    const initializePlayers = (): LudoPlayer[] => {
      const colors: ('red' | 'blue' | 'yellow' | 'green')[] = ['red', 'blue', 'yellow', 'green'];
      return colors.map((color, index) => ({
        id: `player-${index}`,
        name: `Player ${index + 1}`,
        color,
        isActive: index === 0,
        pieces: Array.from({ length: 4 }, (_, pieceIndex) => ({
          id: `${color}-${pieceIndex}`,
          playerId: `player-${index}`,
          position: 'home' as const,
          color,
          isAtHome: true,
          isMovable: false
        }))
      }));
    };

    setGameState(prev => ({
      ...prev,
      players: initializePlayers(),
      gameStatus: 'playing'
    }));
  }, []);

  // Roll dice
  const rollDice = useCallback(() => {
    if (!gameState.canRollDice) return;
    
    const diceValue = Math.floor(Math.random() * 6) + 1;
    setGameState(prev => ({
      ...prev,
      diceValue,
      canRollDice: false
    }));
  }, [gameState.canRollDice]);

  // Move piece
  const movePiece = useCallback((pieceId: string) => {
    if (!gameState.diceValue) return;

    setGameState(prev => {
      const newPlayers = [...prev.players];
      const currentPlayer = newPlayers[prev.currentPlayerIndex];
      const piece = currentPlayer.pieces.find(p => p.id === pieceId);
      
      if (!piece) return prev;

      // Move piece logic
      if (piece.position === 'home' && prev.diceValue === 6) {
        piece.position = 0; // Start position
        piece.isAtHome = false;
      } else if (typeof piece.position === 'number') {
        piece.position = (piece.position + prev.diceValue!) % 52;
      }

      // Check if player gets another turn (rolled 6)
      const nextPlayerIndex = prev.diceValue === 6 ? 
        prev.currentPlayerIndex : 
        (prev.currentPlayerIndex + 1) % prev.players.length;

      // Update active player
      newPlayers.forEach((player, index) => {
        player.isActive = index === nextPlayerIndex;
      });

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        canRollDice: true
      };
    });

    setSelectedPiece(null);
  }, [gameState.diceValue]);

  // Handle piece click
  const handlePieceClick = useCallback((pieceId: string) => {
    if (!gameState.diceValue) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    
    if (!piece) return;

    // Check if piece can move
    const canMove = (piece.position === 'home' && gameState.diceValue === 6) ||
                   (typeof piece.position === 'number');

    if (canMove) {
      movePiece(pieceId);
    }
  }, [gameState.diceValue, gameState.players, gameState.currentPlayerIndex, movePiece]);

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
          <div className="dice" onClick={rollDice}>
            {gameState.diceValue || '🎲'}
          </div>
          {gameState.canRollDice && (
            <button className="roll-button" onClick={rollDice}>
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