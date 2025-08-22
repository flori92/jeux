import React, { useState } from 'react';
import './LudoBoard.css';

interface LudoPiece {
  id: string;
  color: string;
  position: string | number;
  isInPlay: boolean;
  distanceTraveled: number;
}

interface LudoPlayer {
  id: string;
  name: string;
  color: string;
  pieces: LudoPiece[];
  finishedPieces: number;
  isActive: boolean;
}

interface LudoMove {
  pieceId: string;
  from: string | number;
  to: string | number;
  type: 'move' | 'capture' | 'finish';
}

interface LudoBoardState {
  players: LudoPlayer[];
  currentPlayerIndex: number;
  currentPlayer: LudoPlayer;
  diceValue: number | null;
  gameStatus: string;
  winner: LudoPlayer | null;
  canRollDice: boolean;
  possibleMoves: LudoMove[];
}

interface LudoBoardProps {
  gameState: LudoBoardState;
  playerId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: string) => void;
}

const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  playerId,
  onRollDice,
  onMovePiece,
}) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const handlePieceClick = (pieceId: string) => {
    if (gameState.currentPlayer.id === playerId) {
      setSelectedPiece(pieceId);
      onMovePiece(pieceId);
    }
  };

  const handleRollDice = () => {
    if (gameState.canRollDice && gameState.currentPlayer.id === playerId) {
      onRollDice();
    }
  };

  const isMyTurn = gameState.currentPlayer.id === playerId;

  const renderBase = (color: string, pieces: LudoPiece[]) => {
    const basePieces = pieces.filter(p => !p.isInPlay);
    return (
      <div className={`player-base ${color}-base`}>
        <div className="base-grid">
          {[0, 1, 2, 3].map(index => (
            <div key={index} className="base-slot">
              {basePieces[index] && (
                <div
                  className={`piece ${color}-piece ${selectedPiece === basePieces[index].id ? 'selected' : ''}`}
                  onClick={() => handlePieceClick(basePieces[index].id)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMainPath = () => {
    const pathCells = [];
    
    // Créer le chemin principal de 52 cases
    for (let i = 0; i < 52; i++) {
      const isStartPosition = [0, 13, 26, 39].includes(i);
      const isSafePosition = [8, 21, 34, 47].includes(i);
      
      // Trouver les pièces sur cette case
      const piecesOnCell = gameState.players
        .flatMap(p => p.pieces)
        .filter(p => p.isInPlay && p.position === i);
      
      pathCells.push(
        <div 
          key={`path-${i}`} 
          className={`path-cell ${isStartPosition ? 'start-position' : ''} ${isSafePosition ? 'safe-position' : ''}`}
          data-position={i}
        >
          {isStartPosition && <span className="start-marker">★</span>}
          {piecesOnCell.map(piece => (
            <div
              key={piece.id}
              className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`}
              onClick={() => handlePieceClick(piece.id)}
            />
          ))}
        </div>
      );
    }
    
    return pathCells;
  };

  const renderHomePath = (color: string) => {
    const homeCells = [];
    const player = gameState.players.find(p => p.color === color);
    
    for (let i = 0; i < 5; i++) {
      const piecesOnCell = player?.pieces.filter(p => p.position === `${color}-home-${i}`) || [];
      
      homeCells.push(
        <div key={`${color}-home-${i}`} className={`home-cell ${color}-home`}>
          {i === 4 && <span className="finish-marker">🏠</span>}
          {piecesOnCell.map(piece => (
            <div
              key={piece.id}
              className={`piece ${color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`}
              onClick={() => handlePieceClick(piece.id)}
            />
          ))}
        </div>
      );
    }
    return homeCells;
  };

  const renderCenter = () => {
    return (
      <div className="center-triangle">
        <div className="center-logo">🎯</div>
      </div>
    );
  };

  if (gameState.winner) {
    return (
      <div className="ludo-game-over">
        <h2>🎉 Partie Terminée !</h2>
        <p>
          <strong>{gameState.winner.name}</strong> a gagné !
        </p>
        <div className="final-scores">
          {gameState.players
            .sort((a, b) => b.finishedPieces - a.finishedPieces)
            .map((player, index) => (
              <div key={player.id} className="score-line">
                {index + 1}. {player.name} - {player.finishedPieces}/4 pions
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ludo-board-container">
      <div className="game-info">
        <h3>Partie de Ludo</h3>
        <div className="current-player">
          Tour de : <span style={{ color: gameState.currentPlayer.color }}>
            {gameState.currentPlayer.name}
          </span>
        </div>
        {gameState.diceValue && (
          <div className="dice-result">
            Dé : {gameState.diceValue}
          </div>
        )}
        {isMyTurn && gameState.canRollDice && (
          <button 
            className="dice-button"
            onClick={handleRollDice}
          >
            🎲 Lancer le dé
          </button>
        )}
      </div>

      <div className="ludo-game-board">
        {/* Base Rouge (en haut à gauche) */}
        <div className="corner top-left">
          {renderBase('red', gameState.players.find(p => p.color === 'red')?.pieces || [])}
        </div>
        
        {/* Chemin de maison Rouge (vertical) */}
        <div className="home-path home-path-red vertical">
          {renderHomePath('red')}
        </div>
        
        {/* Base Bleue (en haut à droite) */}
        <div className="corner top-right">
          {renderBase('blue', gameState.players.find(p => p.color === 'blue')?.pieces || [])}
        </div>
        
        {/* Chemin de maison Bleue (horizontal) */}
        <div className="home-path home-path-blue horizontal">
          {renderHomePath('blue')}
        </div>
        
        {/* Centre */}
        <div className="center">
          {renderCenter()}
        </div>
        
        {/* Chemin de maison Verte (horizontal) */}
        <div className="home-path home-path-green horizontal">
          {renderHomePath('green')}
        </div>
        
        {/* Base Verte (en bas à gauche) */}
        <div className="corner bottom-left">
          {renderBase('green', gameState.players.find(p => p.color === 'green')?.pieces || [])}
        </div>
        
        {/* Chemin de maison Jaune (vertical) */}
        <div className="home-path home-path-yellow vertical">
          {renderHomePath('yellow')}
        </div>
        
        {/* Base Jaune (en bas à droite) */}
        <div className="corner bottom-right">
          {renderBase('yellow', gameState.players.find(p => p.color === 'yellow')?.pieces || [])}
        </div>

        {/* Parcours principal */}
        <div className="main-path">
          {renderMainPath()}
        </div>
      </div>

      <div className="players-info">
        {gameState.players.map(player => (
          <div key={player.id} className={`player-info ${player.id === gameState.currentPlayer.id ? 'active' : ''}`}>
            <div className="player-color" style={{ backgroundColor: player.color }}></div>
            <span>{player.name}</span>
            <span className="pieces-count">Pièces finies: {player.finishedPieces}/4</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LudoBoard;
