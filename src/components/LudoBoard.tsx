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

interface LudoBoardProps {
  gameState: {
    players: LudoPlayer[];
    currentPlayerIndex: number;
    currentPlayer: LudoPlayer;
    diceValue: number | null;
    gameStatus: string;
    winner: LudoPlayer | null;
    canRollDice: boolean;
    possibleMoves: Array<{
      pieceId: string;
      from: string | number;
      to: string | number;
      type: string;
    }>;
  };
  playerId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: string) => void;
}

const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  playerId,
  onRollDice,
  onMovePiece
}) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const colors = ['red', 'blue', 'yellow', 'green'];
  const colorNames = {
    red: 'Rouge',
    blue: 'Bleu', 
    yellow: 'Jaune',
    green: 'Vert'
  };

  const isMyTurn = gameState.currentPlayer?.id === playerId;
  const canMove = (pieceId: string) => {
    return gameState.possibleMoves.some(move => move.pieceId === pieceId);
  };

  const handlePieceClick = (pieceId: string) => {
    if (!isMyTurn || !canMove(pieceId)) return;
    
    setSelectedPiece(pieceId);
    onMovePiece(pieceId);
  };

  const renderBase = (color: string, pieces: LudoPiece[]) => {
    const basePieces = pieces.filter(p => p.position === 'base');
    
    return (
      <div className={`ludo-base ludo-base-${color}`}>
        <div className="base-title">{colorNames[color as keyof typeof colorNames]}</div>
        <div className="base-pieces">
          {[0, 1, 2, 3].map(index => {
            const piece = basePieces[index];
            return (
              <div
                key={index}
                className={`base-slot ${piece ? 'occupied' : 'empty'}`}
                onClick={() => piece && handlePieceClick(piece.id)}
              >
                {piece && (
                  <div 
                    className={`ludo-piece piece-${color} ${
                      canMove(piece.id) ? 'movable' : ''
                    } ${selectedPiece === piece.id ? 'selected' : ''}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMainPath = () => {
    const pathSquares = [];
    
    // Créer les 52 cases du parcours principal
    for (let i = 0; i < 52; i++) {
      const piecesOnSquare = gameState.players
        .flatMap(p => p.pieces)
        .filter(p => p.position === i);
      
      const isSafeZone = [0, 8, 13, 21, 26, 34, 39, 47].includes(i);
      
      pathSquares.push(
        <div
          key={i}
          className={`path-square ${isSafeZone ? 'safe-zone' : ''}`}
          data-position={i}
        >
          {piecesOnSquare.map(piece => (
            <div
              key={piece.id}
              className={`ludo-piece piece-${piece.color} ${
                canMove(piece.id) ? 'movable' : ''
              } ${selectedPiece === piece.id ? 'selected' : ''}`}
              onClick={() => handlePieceClick(piece.id)}
            />
          ))}
        </div>
      );
    }
    
    return pathSquares;
  };

  const renderHomePath = (color: string) => {
    const player = gameState.players.find(p => p.color === color);
    if (!player) return null;

    const homeSquares = [];
    
    for (let i = 0; i < 6; i++) {
      const piecesOnSquare = player.pieces.filter(p => p.position === `home-${i}`);
      
      homeSquares.push(
        <div
          key={`home-${color}-${i}`}
          className={`home-square home-${color}`}
        >
          {piecesOnSquare.map(piece => (
            <div
              key={piece.id}
              className={`ludo-piece piece-${piece.color} ${
                canMove(piece.id) ? 'movable' : ''
              } ${selectedPiece === piece.id ? 'selected' : ''}`}
              onClick={() => handlePieceClick(piece.id)}
            />
          ))}
        </div>
      );
    }
    
    return homeSquares;
  };

  const renderCenter = () => {
    const finishedPieces = gameState.players
      .flatMap(p => p.pieces)
      .filter(p => p.position === 'finished');

    return (
      <div className="ludo-center">
        <div className="center-triangle">
          {finishedPieces.map(piece => (
            <div
              key={piece.id}
              className={`ludo-piece piece-${piece.color} finished`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderDice = () => {
    return (
      <div className="dice-container">
        <div className="dice-info">
          <div className="current-player">
            Tour de : <strong>{gameState.currentPlayer?.name}</strong>
            <span className={`player-color color-${gameState.currentPlayer?.color}`}></span>
          </div>
          
          {gameState.diceValue && (
            <div className="dice-result">
              Dé : <span className="dice-value">{gameState.diceValue}</span>
            </div>
          )}
          
          {isMyTurn && gameState.canRollDice && (
            <button 
              className="roll-dice-btn"
              onClick={onRollDice}
            >
              🎲 Lancer le dé
            </button>
          )}
          
          {isMyTurn && !gameState.canRollDice && gameState.possibleMoves.length > 0 && (
            <div className="move-instruction">
              Choisissez un pion à déplacer
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPlayersList = () => {
    return (
      <div className="players-list">
        <h3>Joueurs</h3>
        {gameState.players.map((player, index) => (
          <div 
            key={player.id}
            className={`player-info ${index === gameState.currentPlayerIndex ? 'current' : ''}`}
          >
            <span className={`player-color color-${player.color}`}></span>
            <span className="player-name">{player.name}</span>
            <span className="finished-count">{player.finishedPieces}/4</span>
          </div>
        ))}
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
      <div className="ludo-board">
        {/* Bases dans les coins */}
        <div className="corner top-left">
          {renderBase('red', gameState.players.find(p => p.color === 'red')?.pieces || [])}
        </div>
        
        <div className="corner top-right">
          {renderBase('blue', gameState.players.find(p => p.color === 'blue')?.pieces || [])}
        </div>
        
        <div className="corner bottom-left">
          {renderBase('green', gameState.players.find(p => p.color === 'green')?.pieces || [])}
        </div>
        
        <div className="corner bottom-right">
          {renderBase('yellow', gameState.players.find(p => p.color === 'yellow')?.pieces || [])}
        </div>

        {/* Parcours principal */}
        <div className="main-path">
          {renderMainPath()}
        </div>

        {/* Colonnes finales */}
        <div className="home-paths">
          {colors.map(color => (
            <div key={color} className={`home-path home-path-${color}`}>
              {renderHomePath(color)}
            </div>
          ))}
        </div>

        {/* Centre */}
        {renderCenter()}
      </div>

      {/* Interface de contrôle */}
      <div className="game-controls">
        {renderDice()}
        {renderPlayersList()}
      </div>
    </div>
  );
};

export default LudoBoard;
