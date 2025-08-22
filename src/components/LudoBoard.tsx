import React, { useState, useEffect, useCallback } from 'react';
import './LudoBoard.css';
import GameNotifications from './GameNotifications';
import { useNotifications } from '../hooks/useNotifications';

interface GameRules {
  allowBackwardInEndZone: boolean;
  requireAllPiecesInEndZone: boolean;
}

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
  direction?: 'forward' | 'backward';
  isCapture?: boolean;
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
  onMovePiece: (pieceId: string, direction: 'forward' | 'backward', rules: GameRules) => void;
}

const LudoBoard: React.FC<LudoBoardProps> = ({ gameState, playerId, onRollDice, onMovePiece }) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [moveDirection, setMoveDirection] = useState<'forward' | 'backward'>('forward');
  const [gameRules] = useState<GameRules>({
    allowBackwardInEndZone: false,
    requireAllPiecesInEndZone: false
  });
  const { notifications, removeNotification, showError, showInfo } = useNotifications();

  // Calculer les mouvements possibles quand le dé est lancé
  useEffect(() => {
    if (gameState.diceValue && gameState.currentPlayer?.id === playerId) {
      const movablePieces: string[] = [];
      
      gameState.currentPlayer.pieces?.forEach(piece => {
        // Pion en base - peut sortir avec un 6
        if (piece.position === 'base' && gameState.diceValue === 6) {
          movablePieces.push(piece.id);
        }
        // Pion en jeu - peut bouger si le mouvement est valide
        else if (piece.position !== 'base' && piece.position !== 'finished') {
          // Vérifier si le mouvement est valide en fonction du dé
          if (gameState.diceValue !== null) {
            const currentPos = typeof piece.position === 'number' ? piece.position : 0;
            const newPos = currentPos + gameState.diceValue;
            
            // Vérifier si la nouvelle position est valide (moins de 52 cases en tout)
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

  interface ExtendedLudoMove extends LudoMove {
    direction?: 'forward' | 'backward';
    isCapture?: boolean;
  }

  const canCaptureBackward = useCallback((pieceId: string): boolean => {
    // Vérifier si un mouvement de capture en arrière est possible pour ce pion
    if (!gameState?.possibleMoves) return false;
    
    // Vérifier si l'un des mouvements possibles est une capture en arrière
    return (gameState.possibleMoves as ExtendedLudoMove[]).some((move) => 
      move.pieceId === pieceId && 
      move.direction === 'backward' &&
      move.isCapture === true
    );
  }, [gameState.possibleMoves]);

  const handlePieceClick = useCallback((pieceId: string) => {
    // Si le dé n'a pas encore été lancé, ne rien faire
    if (!gameState.diceValue) {
      showInfo('Lancez le dé', 'Veuillez d\'abord lancer le dé pour jouer.');
      return;
    }

    // Si le joueur actuel n'est pas celui qui joue, ne rien faire
    if (gameState.currentPlayer?.id !== playerId) {
      showInfo('Ce n\'est pas votre tour', 'Attendez votre tour pour jouer.');
      return;
    }

    // Si le pion est dans la liste des mouvements possibles, le sélectionner
    if (possibleMoves.includes(pieceId)) {
      setSelectedPiece(pieceId);
      
      // Si le pion est en base, le sortir directement (cas du 6)
      const piece = gameState.currentPlayer?.pieces?.find(p => p.id === pieceId);
      if (piece?.position === 'base' && gameState.diceValue === 6) {
        onMovePiece(pieceId, 'forward', gameRules);
        setSelectedPiece(null);
      } else {
        // Pour les autres cas, demander la confirmation du déplacement
        showInfo('Confirmer le déplacement', `Déplacer le pion de ${gameState.diceValue} cases ?`);
      }
    } 
    // Si on clique sur un pion déjà sélectionné, changer la direction
    else if (selectedPiece === pieceId) {
      const newDirection = moveDirection === 'forward' ? 'backward' : 'forward';
      setMoveDirection(newDirection);
      showInfo('Changement de direction', `Le pion se déplacera vers l'${newDirection === 'forward' ? 'avant' : 'arrière'}.`);
    } else {
      showError('Mouvement invalide', 'Ce pion ne peut pas bouger avec cette valeur de dé.');
    }
  }, [
    gameState.diceValue, 
    gameState.currentPlayer?.id, 
    gameState.currentPlayer?.pieces, 
    playerId, 
    possibleMoves, 
    selectedPiece, 
    moveDirection, 
    onMovePiece, 
    gameRules, 
    showInfo, 
    showError
  ]);

  const confirmMove = useCallback((direction: 'forward' | 'backward') => {
    if (selectedPiece) {
      onMovePiece(selectedPiece, direction, gameRules);
      setSelectedPiece(null);
      setPossibleMoves([]);
    }
  }, [selectedPiece, onMovePiece, gameRules]);

  const cancelMove = () => {
    setSelectedPiece(null);
  };



  const renderDirectionButtons = () => {
    if (!selectedPiece) return null;
    
    const backwardPossible = canCaptureBackward(selectedPiece);
    const forwardPossible = possibleMoves.includes(selectedPiece);
    
    // Si seul un mouvement est possible, ne pas afficher le sélecteur de direction
    if ((backwardPossible && !forwardPossible) || (!backwardPossible && forwardPossible)) {
      return (
        <div className="direction-buttons">
          <div className="action-buttons single-action">
            <button 
              className="confirm-btn" 
              onClick={() => confirmMove(backwardPossible ? 'backward' : 'forward')}
            >
              {backwardPossible ? 'Capturer en reculant' : 'Avancer'}
            </button>
            <button className="cancel-btn" onClick={cancelMove}>
              Annuler
            </button>
          </div>
        </div>
      );
    }
    
    // Si les deux mouvements sont possibles, afficher les deux options
    return (
      <div className="direction-buttons">
        <h3>Choisir la direction :</h3>
        <div className="button-group">
          {forwardPossible && (
            <button 
              className={`direction-btn ${moveDirection === 'forward' ? 'active' : ''}`}
              onClick={() => setMoveDirection('forward')}
            >
              Avancer
            </button>
          )}
          {backwardPossible && (
            <button 
              className={`direction-btn ${moveDirection === 'backward' ? 'active' : ''}`}
              onClick={() => setMoveDirection('backward')}
            >
              Capturer en reculant
            </button>
          )}
        </div>
        <div className="action-buttons">
          <button 
            className="confirm-btn" 
            onClick={() => confirmMove(moveDirection)}
            disabled={!moveDirection}
          >
            Confirmer
          </button>
          <button className="cancel-btn" onClick={cancelMove}>
            Annuler
          </button>
        </div>
      </div>
    );
  };

  const renderGameControls = useCallback(() => {
    if (gameState.currentPlayer.id !== playerId) {
      return (
        <div className="game-status">
          En attente du joueur {gameState.currentPlayer.name}...
        </div>
      );
    }

    return (
      <div className="game-controls">
        <button
          onClick={onRollDice}
          disabled={!gameState.canRollDice}
          className="roll-dice-button"
        >
          🎲 Lancer le dé
        </button>
        <div className="dice-value">
          {gameState.diceValue ? `Résultat : ${gameState.diceValue}` : 'Lancez le dé pour commencer'}
        </div>
      </div>
    );
  }, [gameState.currentPlayer.id, gameState.currentPlayer.name, gameState.canRollDice, gameState.diceValue, onRollDice, playerId]);

  const renderPlayersInfo = () => {
    return (
      <div className="players-info">
        {gameState.players.map(player => (
          <div 
            key={player.id} 
            className={`player-info ${player.id === gameState.currentPlayer.id ? 'current-player' : ''}`}
          >
            <div 
              className="player-color" 
              style={{ backgroundColor: player.color }}
            />
            <div className="player-name">
              {player.name} {player.id === playerId ? '(Vous)' : ''}
            </div>
            <div className="player-stats">
              Pions terminés: {player.finishedPieces}/4
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBase = (color: string, pieces: LudoPiece[]) => {
    const basePieces = pieces.filter(p => p.position === 'base');
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

  return (
    <div className="ludo-board">
      <GameNotifications 
        notifications={notifications} 
        onRemoveNotification={removeNotification} 
      />
      
      {selectedPiece && (
        <div className="direction-overlay">
          {renderDirectionButtons()}
        </div>
      )}
      <div className="game-container">
        {renderPath()}
        {renderGameControls()}
        {renderPlayersInfo()}
      </div>
    </div>
  );
};

export default LudoBoard;
