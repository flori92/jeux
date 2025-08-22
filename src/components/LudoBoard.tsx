import React, { useState, useEffect } from 'react';
import './LudoBoard.css';
import GameNotifications from './GameNotifications';
import { useNotifications } from '../hooks/useNotifications';

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

const LudoBoard: React.FC<LudoBoardProps> = ({ gameState, playerId, onRollDice, onMovePiece }) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const { notifications, removeNotification, showError, showInfo } = useNotifications();

  // Calculer les mouvements possibles quand le dé est lancé
  useEffect(() => {
    if (gameState.diceValue && gameState.currentPlayer.id === playerId) {
      const movablePieces: string[] = [];
      
      gameState.currentPlayer.pieces.forEach(piece => {
        // Pion en base - peut sortir avec un 6
        if (piece.position === 'base' && gameState.diceValue === 6) {
          movablePieces.push(piece.id);
        }
        // Pion en jeu - peut bouger si le mouvement est valide
        else if (piece.position !== 'base' && piece.position !== 'finished') {
          // Vérification simplifiée - dans un vrai jeu, il faudrait vérifier les collisions
          movablePieces.push(piece.id);
        }
      });
      
      setPossibleMoves(movablePieces);
      
      if (movablePieces.length === 0) {
        showInfo('Aucun mouvement possible', `Avec un ${gameState.diceValue}, aucun pion ne peut bouger.`);
      }
    } else {
      setPossibleMoves([]);
    }
  }, [gameState.diceValue, gameState.currentPlayer, playerId, showInfo]);

  const handlePieceClick = (pieceId: string) => {
    if (gameState.currentPlayer.id === playerId && possibleMoves.includes(pieceId)) {
      setSelectedPiece(pieceId);
      onMovePiece(pieceId);
      setPossibleMoves([]); // Réinitialiser après le mouvement
    } else if (gameState.currentPlayer.id === playerId && !possibleMoves.includes(pieceId)) {
      showError('Mouvement invalide', 'Ce pion ne peut pas bouger avec cette valeur de dé.');
    }
  };

  const handleRollDice = () => {
    if (gameState.canRollDice && gameState.currentPlayer.id === playerId) {
      onRollDice();
      setSelectedPiece(null);
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

  const getPiecesOnPosition = (position: number | string) => {
    return gameState.players
      .flatMap(p => p.pieces)
      .filter(p => p.isInPlay && p.position === position);
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
              className={`piece ${color}-piece ${selectedPiece === piece.id ? 'selected' : ''} ${possibleMoves.includes(piece.id) ? 'movable' : ''}`}
              onClick={() => handlePieceClick(piece.id)}
            >
              {piece.id.split('-')[1]}
            </div>
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

  const renderPath = () => {
    return (
      <div className="path-grid">
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

        {/* Cases du chemin extérieur */}
        {/* Colonne gauche (rouge) */}
        <div className="path-cell start-position" style={{ gridColumn: 2, gridRow: 6 }} data-position="0">
          ★ {getPiecesOnPosition(0).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 1, gridRow: 6 }} data-position="1">
          {getPiecesOnPosition(1).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 1, gridRow: 5 }} data-position="2">
          {getPiecesOnPosition(2).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 1, gridRow: 4 }} data-position="3">
          {getPiecesOnPosition(3).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 1, gridRow: 3 }} data-position="4">
          {getPiecesOnPosition(4).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell safe-position" style={{ gridColumn: 1, gridRow: 2 }} data-position="5">
          🛡️ {getPiecesOnPosition(5).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        
        {/* Ligne du bas (vert) */}
        <div className="path-cell" style={{ gridColumn: 2, gridRow: 7 }} data-position="6">
          {getPiecesOnPosition(6).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 3, gridRow: 7 }} data-position="7">
          {getPiecesOnPosition(7).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell safe-position" style={{ gridColumn: 4, gridRow: 7 }} data-position="8">
          🛡️ {getPiecesOnPosition(8).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 5, gridRow: 7 }} data-position="9">
          {getPiecesOnPosition(9).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 6, gridRow: 7 }} data-position="10">
          {getPiecesOnPosition(10).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 7, gridRow: 6 }} data-position="11">
          {getPiecesOnPosition(11).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 7, gridRow: 5 }} data-position="12">
          {getPiecesOnPosition(12).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        
        {/* Colonne droite (bleu) */}
        <div className="path-cell start-position" style={{ gridColumn: 6, gridRow: 2 }} data-position="13">
          ★ {getPiecesOnPosition(13).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 7, gridRow: 2 }} data-position="14">
          {getPiecesOnPosition(14).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 7, gridRow: 3 }} data-position="15">
          {getPiecesOnPosition(15).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 7, gridRow: 4 }} data-position="16">
          {getPiecesOnPosition(16).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 7, gridRow: 5 }} data-position="17">
          {getPiecesOnPosition(17).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell safe-position" style={{ gridColumn: 6, gridRow: 6 }} data-position="18">
          🛡️ {getPiecesOnPosition(18).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        
        {/* Ligne du haut (jaune) */}
        <div className="path-cell" style={{ gridColumn: 6, gridRow: 1 }} data-position="19">
          {getPiecesOnPosition(19).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 5, gridRow: 1 }} data-position="20">
          {getPiecesOnPosition(20).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell safe-position" style={{ gridColumn: 4, gridRow: 1 }} data-position="21">
          🛡️ {getPiecesOnPosition(21).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 3, gridRow: 1 }} data-position="22">
          {getPiecesOnPosition(22).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 2, gridRow: 1 }} data-position="23">
          {getPiecesOnPosition(23).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 2, gridRow: 2 }} data-position="24">
          {getPiecesOnPosition(24).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        <div className="path-cell" style={{ gridColumn: 1, gridRow: 2 }} data-position="25">
          {getPiecesOnPosition(25).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        
        {/* Case de départ vert */}
        <div className="path-cell start-position" style={{ gridColumn: 2, gridRow: 6 }} data-position="26">
          ★ {getPiecesOnPosition(26).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
        
        {/* Case de départ jaune */}
        <div className="path-cell start-position" style={{ gridColumn: 6, gridRow: 2 }} data-position="39">
          ★ {getPiecesOnPosition(39).map(piece => (
            <div key={piece.id} className={`piece ${piece.color}-piece ${selectedPiece === piece.id ? 'selected' : ''}`} onClick={() => handlePieceClick(piece.id)} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="ludo-board">
      <GameNotifications 
        notifications={notifications} 
        onRemoveNotification={removeNotification} 
      />
      
      <div className="game-container">
        {renderPath()}
      </div>

      <div className="game-controls">
        <button 
          onClick={handleRollDice}
          disabled={!gameState.canRollDice || !isMyTurn}
          className="dice-button"
        >
          Lancer le dé
        </button>
        {gameState.diceValue && (
          <div className="dice-value">Dé: {gameState.diceValue}</div>
        )}
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
