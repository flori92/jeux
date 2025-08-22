import React, { useState, useEffect } from 'react';
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
}

interface LudoBoardNewProps {
  gameState: LudoGameState;
  playerId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: string, direction: 'forward' | 'backward', rules: unknown) => void;
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

const LudoBoardNew: React.FC<LudoBoardNewProps> = ({ 
  gameState, 
  playerId, 
  onRollDice, 
  onMovePiece 
}) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  
  // Calcul des dimensions du plateau
  const boardSize = Math.min(window.innerHeight * 0.9, 800);
  const houseSize = boardSize * 0.4;
  const seedSize = boardSize * 0.06;

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
    } else {
      setPossibleMoves([]);
    }
  }, [gameState.diceValue, gameState.currentPlayer, playerId]);

  // Gestion du clic sur une pièce
  const handlePieceClick = (pieceId: string) => {
    if (possibleMoves.includes(pieceId)) {
      onMovePiece(pieceId, 'forward', { diceValue: gameState.diceValue });
      setSelectedPiece(null);
      setPossibleMoves([]);
    } else {
      setSelectedPiece(pieceId);
    }
  };

  // Rendu des pièces dans les maisons
  const renderHousePieces = (playerIndex: number) => {
    const player = gameState.players[playerIndex];
    if (!player) return null;
    
    if (!isLudoPlayer(player)) {
      console.error('Le joueur n\'a pas de pièces valides');
      return null;
    }
    
    // Filtrer les pièces qui sont dans la maison (position 'base' ou 'home')
    const housePieces = player.pieces.filter(piece => 
      piece.position === 'base' || piece.position === 'home'
    );
    
    // Trier les pièces pour un affichage cohérent
    housePieces.sort((a, b) => {
      if (a.position === 'base' && b.position !== 'base') return -1;
      if (a.position !== 'base' && b.position === 'base') return 1;
      return a.id.localeCompare(b.id);
    });

    return (
      <div className="house-pieces" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px',
        padding: houseSize * 0.1
      }}>
        {housePieces.map(piece => (
          <div 
            key={piece.id}
            className={`piece ${selectedPiece === piece.id ? 'selected' : ''} ${possibleMoves.includes(piece.id) ? 'movable' : ''}`}
            style={{
              width: seedSize,
              height: seedSize,
              borderRadius: '50%',
              backgroundColor: player.color,
              cursor: possibleMoves.includes(piece.id) ? 'pointer' : 'default',
              opacity: piece.position === 'base' ? 1 : 0.7,
              border: selectedPiece === piece.id ? '2px solid #000' : 'none',
              boxShadow: possibleMoves.includes(piece.id) ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: seedSize * 0.5
            }}
            onClick={() => handlePieceClick(piece.id)}
          />
        ))}
      </div>
    );
  };

  // Rendu du dé
  const renderDice = () => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gridArea: 'center',
        backgroundColor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '10px',
          border: '2px solid #333'
        }}>
          {gameState.diceValue || '?'}
        </div>
        <button
          onClick={onRollDice}
          disabled={!gameState.canRollDice}
          style={{
            padding: '8px 16px',
            backgroundColor: gameState.canRollDice ? '#4CAF50' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: gameState.canRollDice ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          Lancer le dé
        </button>
      </div>
    );
  };

  // Rendu des pièces sur les rails
  const renderRailPieces = (rail: 'top' | 'right' | 'bottom' | 'left') => {
    if (!Array.isArray(gameState.players)) {
      return null;
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: rail === 'top' || rail === 'bottom' ? 'row' : 'column',
        justifyContent: 'space-between',
        padding: '10px',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px'
      }}>
        {gameState.players.flatMap(player => {
          if (!isLudoPlayer(player)) return [];
          
          return player.pieces
            .filter(piece => {
              const pos = piece.position;
              if (typeof pos !== 'number') return false;
              
              switch (rail) {
                case 'top': return pos < 13;
                case 'right': return pos >= 13 && pos < 26;
                case 'bottom': return pos >= 26 && pos < 39;
                case 'left': return pos >= 39;
                default: return false;
              }
            })
            .map(piece => (
              <div
                key={piece.id}
                className={`piece ${selectedPiece === piece.id ? 'selected' : ''} ${possibleMoves.includes(piece.id) ? 'movable' : ''}`}
                style={{
                  width: seedSize,
                  height: seedSize,
                  borderRadius: '50%',
                  backgroundColor: player.color,
                  cursor: possibleMoves.includes(piece.id) ? 'pointer' : 'default',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  border: selectedPiece === piece.id ? '2px solid #000' : 'none',
                  boxShadow: possibleMoves.includes(piece.id) ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
                  margin: '2px'
                }}
                onClick={() => handlePieceClick(piece.id)}
              />
            ));
        })}
      </div>
    );
  };

  // Rendu du plateau de jeu
  return (
    <div 
      className="ludo-container" 
      style={{ 
        width: boardSize, 
        height: boardSize,
        display: 'grid',
        gridTemplateAreas: `
          'house1 topRail house2'
          'leftRail center rightRail'
          'house4 bottomRail house3'
        `,
        gridTemplateColumns: `${houseSize} 1fr ${houseSize}`,
        gridTemplateRows: `${houseSize} 1fr ${houseSize}`,
        gap: '10px',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
      role="application"
      aria-label="Plateau de jeu Ludo"
    >
      {/* Maison du joueur 1 (en haut à gauche) */}
      <div 
        className="house house-1" 
        style={{ 
          gridArea: 'house1',
          width: '100%',
          height: '100%',
          backgroundColor: gameState.players[0]?.color || '#FF5252',
          borderRadius: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {renderHousePieces(0)}
      </div>

      {/* Rail du haut */}
      <div 
        className="rail top-rail" 
        style={{ 
          gridArea: 'topRail',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px'
        }}
      >
        {renderRailPieces('top')}
      </div>

      {/* Maison du joueur 2 (en haut à droite) */}
      <div 
        className="house house-2" 
        style={{ 
          gridArea: 'house2',
          width: '100%',
          height: '100%',
          backgroundColor: gameState.players[1]?.color || '#4CAF50',
          borderRadius: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {renderHousePieces(1)}
      </div>

      {/* Rail de gauche */}
      <div 
        className="rail left-rail" 
        style={{ 
          gridArea: 'leftRail',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px'
        }}
      >
        {renderRailPieces('left')}
      </div>

      {/* Centre du plateau avec le dé */}
      {renderDice()}

      {/* Rail de droite */}
      <div 
        className="rail right-rail" 
        style={{ 
          gridArea: 'rightRail',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px'
        }}
      >
        {renderRailPieces('right')}
      </div>

      {/* Maison du joueur 3 (en bas à gauche) */}
      <div 
        className="house house-3" 
        style={{ 
          gridArea: 'house3',
          width: '100%',
          height: '100%',
          backgroundColor: gameState.players[2]?.color || '#2196F3',
          borderRadius: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {renderHousePieces(2)}
      </div>

      {/* Rail du bas */}
      <div 
        className="rail bottom-rail" 
        style={{ 
          gridArea: 'bottomRail',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px'
        }}
      >
        {renderRailPieces('bottom')}
      </div>

      {/* Maison du joueur 4 (en bas à droite) */}
      <div 
        className="house house-4" 
        style={{ 
          gridArea: 'house4',
          width: '100%',
          height: '100%',
          backgroundColor: gameState.players[3]?.color || '#FFC107',
          borderRadius: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {renderHousePieces(3)}
      </div>
    </div>
  );
};

export default LudoBoardNew;
              movablePieces.push(piece.id);
            }
          }
        }
      });
      
      setPossibleMoves(movablePieces);
      
      if (movablePieces.length === 0 && gameState.diceValue) {
        console.log(`Aucun mouvement possible avec un ${gameState.diceValue}`);
      }
    } else {
      setPossibleMoves([]);
    }
  }, [gameState.diceValue, gameState.currentPlayer, playerId]);

  const handlePieceClick = useCallback((pieceId: string) => {
    if (possibleMoves.includes(pieceId)) {
      // Pour l'instant, on envoie simplement l'ID de la pièce à déplacer
      // La logique de déplacement sera gérée par le serveur
      onMovePiece(pieceId, 'forward', {
        // Ces callbacks seront implémentés plus tard
        canMove: () => true,
        onCapture: () => {}
      });
      setSelectedPiece(null);
      setPossibleMoves([]);
    } else {
      setSelectedPiece(pieceId);
    }
  }, [possibleMoves, onMovePiece]);

  const renderDice = () => {
    const { diceValue, canRollDice, currentPlayer } = gameState;
    const isCurrentPlayer = currentPlayer.id === playerId;
    
    // Styles pour le bouton
    const buttonStyle = {
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background-color 0.3s',
    } as const;
    
    const buttonHoverStyle = {
      backgroundColor: '#45a049'
    };
    
    const buttonDisabledStyle = {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed'
    };
    
    return (
      <div className="dice-container" style={{ textAlign: 'center' }}>
        <div 
          className={`dice ${!diceValue ? 'rolling' : ''}`}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'white',
            borderRadius: '10px',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            margin: '10px 0'
          }}
        >
          {diceValue || ''}
        </div>
        {isCurrentPlayer && (
          <button 
            className="roll-button"
            onClick={onRollDice}
            disabled={!canRollDice}
            style={{
              ...buttonStyle,
              ...(!canRollDice ? buttonDisabledStyle : {})
            }}
            onMouseOver={(e) => {
              if (canRollDice) {
                e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor;
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = canRollDice 
                ? buttonStyle.backgroundColor 
                : buttonDisabledStyle.backgroundColor;
            }}
          >
            🎲 Lancer le dé
          </button>
        )}
      </div>
    );
  };

  // Rendu des pièces sur le rail
  const renderRailPieces = (rail: 'top' | 'right' | 'bottom' | 'left', railSize: number, pieceSize: number) => {
    const pieces: React.ReactNode[] = [];
    
    // Type pour les positions des pièces
    interface Position { x: number; y: number; }
    const positions: Position[] = [];
    
    // Calculer les positions des pièces sur le rail
    for (let i = 0; i < 6; i++) {
      positions.push({
        x: rail === 'left' || rail === 'right' ? 0 : (i * railSize) / 6,
        y: rail === 'top' || rail === 'bottom' ? 0 : (i * railSize) / 6
      });
    }
    
    // Récupérer les pièces sur ce rail
    gameState.players.forEach(player => {
      player.pieces
        .filter(p => typeof p.position === 'number' && p.position >= 0 && p.position < 52)
        .forEach(piece => {
          const pos = piece.position as number;
          // Logique simplifiée pour le positionnement
          if ((rail === 'top' && pos < 13) || 
              (rail === 'right' && pos >= 13 && pos < 26) ||
              (rail === 'bottom' && pos >= 26 && pos < 39) ||
              (rail === 'left' && pos >= 39)) {
            
            const index = rail === 'top' ? pos : 
                         rail === 'right' ? pos - 13 :
                         rail === 'bottom' ? pos - 26 : pos - 39;
                          
            const position = positions[Math.min(index, positions.length - 1)];
            
            pieces.push(
              <div
                key={piece.id}
                className={`piece ${
                  selectedPiece === piece.id ? 'selected' : ''
                } ${
                  possibleMoves.includes(piece.id) ? 'movable' : ''
                }`}
                style={{
                  position: 'absolute',
                  left: rail === 'left' || rail === 'right' ? '50%' : `${position.x + pieceSize/2}px`,
                  top: rail === 'top' || rail === 'bottom' ? '50%' : `${position.y + pieceSize/2}px`,
                  transform: 'translate(-50%, -50%)',
                  width: pieceSize,
                  height: pieceSize,
                  borderRadius: '50%',
                  backgroundColor: player.color,
                  cursor: possibleMoves.includes(piece.id) ? 'pointer' : 'default',
                  border: selectedPiece === piece.id ? '2px solid #000' : 'none',
                  boxShadow: possibleMoves.includes(piece.id) 
                    ? '0 0 10px rgba(0,0,0,0.5)' 
                    : 'none',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onClick={() => handlePieceClick(piece.id)}
              />
            );
          }
        });
    });
    
    return pieces;
  };

  // Rendu des pièces dans les maisons
  const renderHousePieces = (playerIndex: number) => {
    const player = gameState.players[playerIndex];
    if (!player) return null;
    
    // Vérifier si c'est un joueur Ludo valide
    if (!isLudoPlayer(player)) {
      console.error('Le joueur n\'a pas de pièces valides');
      return null;
    }
    
    return (
      <div className="house-pieces" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        padding: houseSize * 0.1
      }}>
        {player.pieces
          .filter((p): p is LudoPiece => 'position' in p && (p.position === 'base' || p.position === 'home'))
          .map(piece => (
            <div
              key={piece.id}
              className={`piece ${
                selectedPiece === piece.id ? 'selected' : ''
              } ${
                possibleMoves.includes(piece.id) ? 'movable' : ''
              }`}
              style={{
                width: seedSize,
                height: seedSize,
                borderRadius: '50%',
                backgroundColor: player.color,
                cursor: possibleMoves.includes(piece.id) ? 'pointer' : 'default',
                opacity: piece.position === 'base' ? 1 : 0.7,
                border: selectedPiece === piece.id ? '2px solid #000' : 'none',
                boxShadow: possibleMoves.includes(piece.id) 
                  ? '0 0 10px rgba(0,0,0,0.5)' 
                  : 'none',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handlePieceClick(piece.id)}
              aria-label={`Pion ${player.color} ${piece.position === 'base' ? 'en base' : 'à la maison'}`}
            />
          ))}
      </div>
    );
  };

  // Rendu du plateau de jeu
  return (
    <div 
      className="ludo-container" 
      style={{ 
        width: boardSize, 
        height: boardSize,
        display: 'grid',
        gridTemplateAreas: `
          'house1 topRail house2'
          'leftRail center rightRail'
          'house4 bottomRail house3'
        `,
        gridTemplateColumns: `${houseSize} 1fr ${houseSize}`,
        gridTemplateRows: `${houseSize} 1fr ${houseSize}`,
        gap: '10px',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
      role="application"
      aria-label="Plateau de jeu Ludo"
    >
      {/* Maison du joueur 1 (en haut à gauche) */}
      <div 
        className="house house-1" 
        style={{ 
          gridArea: 'house1',
          width: '100%',
          height: '100%',
          backgroundColor: gameState.players[0]?.color || '#FF5252',
          borderRadius: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {renderHousePieces(0)}
      </div>
  // Vérifier si players existe et est un tableau
  if (!Array.isArray(gameState.players) || !gameState.players[playerIndex]) {
    return null;
  }
  
  const player = gameState.players[playerIndex];
  if (!isLudoPlayer(player)) {
    return null;
  }
  
  // Filtrer les pièces qui sont dans la maison (position 'base' ou 'home')
  const housePieces = player.pieces.filter(piece => 
    piece.position === 'base' || piece.position === 'home'
  );
  
  // Trier les pièces pour un affichage cohérent
  housePieces.sort((a, b) => {
    if (a.position === 'base' && b.position !== 'base') return -1;
    if (a.position !== 'base' && b.position === 'base') return 1;
    return a.id.localeCompare(b.id);
  });

  return (
    <div className="house-pieces" style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '10px',
      padding: houseSize * 0.1
    }}>
      {housePieces.map(piece => (
        <div 
          key={piece.id}
          className={`piece ${isSelected ? 'selected' : ''} ${possibleMoves.includes(piece.id) ? 'movable' : ''}`}
          style={{
            width: seedSize,
            height: seedSize,
            borderRadius: '50%',
            backgroundColor: player.color,
            cursor: possibleMoves.includes(piece.id) ? 'pointer' : 'default',
            opacity: piece.position === 'base' ? 1 : 0.7,
            border: isSelected ? '2px solid #000' : 'none',
            boxShadow: possibleMoves.includes(piece.id) ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
            transition: 'all 0.2s ease',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: seedSize * 0.5
          }}
          onClick={() => {
            if (piece.position === 'base' || possibleMoves.includes(piece.id)) {
              onClick(piece.id);
            }
          }}
        />
      ))}
    </div>
  );
}

const renderRailPieces = (
  position: 'top' | 'right' | 'bottom' | 'left',
  _railSize: number, // Préfixé avec _ car non utilisé
  seedSize: number,
  gameState: LudoGameState,
  onClick: (pieceId: string) => void,
  possibleMoves: string[],
  selectedPiece: string | null
) => {
  // Vérifier si players existe et est un tableau
  if (!Array.isArray(gameState.players)) {
    return null;
  }
  
  // Trouver tous les pions sur ce rail
  const piecesOnRail: {piece: LudoPiece, player: LudoPlayer}[] = [];
  
  gameState.players.forEach(player => {
    if (isLudoPlayer(player)) {
      player.pieces.forEach(piece => {
        // Vérifier si la pièce est sur le rail spécifié
        const pos = piece.position;
        
        // S'assurer que pos est un nombre avant de faire des comparaisons numériques
        if (typeof pos !== 'number') return;
        
        const isOnRail = 
          (position === 'top' && pos < 13) ||
          (position === 'right' && pos >= 13 && pos < 26) ||
          (position === 'bottom' && pos >= 26 && pos < 39) ||
          (position === 'left' && pos >= 39);
          
        if (isOnRail) {
          piecesOnRail.push({ piece, player });
        }
      });
    }
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: position === 'top' || position === 'bottom' ? 'row' : 'column',
      justifyContent: 'space-between',
      padding: '10px',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {gameState.players.flatMap(player => 
        player.pieces
          ?.filter(piece => piece.position !== 'base' && piece.position !== 'finished')
          .map(piece => (
            <div
              key={piece.id}
              className={`piece ${selectedPiece === piece.id ? 'selected' : ''} ${possibleMoves.includes(piece.id) ? 'movable' : ''}`}
              style={{
                width: seedSize,
                height: seedSize,
                borderRadius: '50%',
                backgroundColor: player.color,
                cursor: possibleMoves.includes(piece.id) ? 'pointer' : 'default',
                opacity: 1,
                transition: 'all 0.3s ease',
                border: selectedPiece === piece.id ? '2px solid #000' : 'none',
                boxShadow: possibleMoves.includes(piece.id) ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
              }}
              onClick={() => possibleMoves.includes(piece.id) && onClick(piece.id)}
            />
          ))
      )}
    </div>
  );
}

export default LudoBoardNew;
