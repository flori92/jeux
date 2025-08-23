import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import House from '../House';
import HRail from '../Rails/HRail';
import VRail from '../Rails/VRail';
import './Houses.css';

const HOUSE_COLORS = ['#FF5252', '#2196F3', '#FFC107', '#4CAF50'];
const HOUSE_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export const Houses: React.FC = () => {
  const { players, currentPlayerId } = useSelector((state: RootState) => ({
    players: state.game.players,
    currentPlayerId: state.game.currentPlayerId
  }));

  // Organize players into their respective houses
  const houses = useMemo(() => {
    return HOUSE_POSITIONS.map((position, index) => {
      const player = players[index];
      return {
        position,
        player,
        color: HOUSE_COLORS[index],
        disabled: player ? player.id !== currentPlayerId : true
      };
    });
  }, [players, currentPlayerId]);
  
  // Helper function to get player color from player ID
  const getPlayerColor = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player ? HOUSE_COLORS[players.indexOf(player) % HOUSE_COLORS.length] : '#CCCCCC';
  };

  const handlePieceClick = (pieceId: string) => {
    // Logique de sélection de pièce
    console.log('Piece clicked:', pieceId);
    // Ici, vous pourriez dispatcher une action Redux pour sélectionner la pièce
    // dispatch(selectPiece(pieceId));
  };

  return (
    <div className="houses-container">
      <div className="houses-row">
        <House 
          houseNumber={1} 
          pieces={houses[0].player?.pieces || []} 
          color={houses[0].color}
          disabled={houses[0].disabled}
          onPieceClick={handlePieceClick}
        />
{players.flatMap(p => p.pieces)
          .filter(piece => typeof piece.position === 'number' && getPlayerColor(piece.playerId) === houses[1].color)
          .map(piece => (
            <VRail 
              key={piece.id}
              color={houses[1].color}
              piece={piece}
              playerColor={houses[1].color}
              isMovable={!houses[1].disabled}
              onClick={handlePieceClick}
            />
          ))}
        <House 
          houseNumber={2} 
          pieces={houses[1].player?.pieces || []} 
          color={houses[1].color}
          disabled={houses[1].disabled}
          onPieceClick={handlePieceClick}
        />
      </div>
      
      <div className="houses-row">
{players.flatMap(p => p.pieces)
          .filter(piece => typeof piece.position === 'number' && getPlayerColor(piece.playerId) === houses[0].color)
          .map(piece => (
            <HRail 
              key={piece.id}
              color={houses[0].color}
              position="left"
              piece={piece}
              playerColor={houses[0].color}
              isMovable={!houses[0].disabled}
              onClick={handlePieceClick}
            />
          ))}
        <div className="center-area">
          {/* Center area for dice, etc. */}
        </div>
{players.flatMap(p => p.pieces)
          .filter(piece => typeof piece.position === 'number' && getPlayerColor(piece.playerId) === houses[3].color)
          .map(piece => (
            <HRail 
              key={piece.id}
              color={houses[3].color}
              position="right"
              piece={piece}
              playerColor={houses[3].color}
              isMovable={!houses[3].disabled}
              onClick={handlePieceClick}
            />
          ))}
      </div>
      
      <div className="houses-row">
        <House 
          houseNumber={3} 
          pieces={houses[2].player?.pieces || []} 
          color={houses[2].color}
          disabled={houses[2].disabled}
          onPieceClick={handlePieceClick}
        />
{players.flatMap(p => p.pieces)
          .filter(piece => typeof piece.position === 'number' && getPlayerColor(piece.playerId) === houses[2].color)
          .map(piece => (
            <VRail 
              key={piece.id}
              color={houses[2].color}
              piece={piece}
              playerColor={houses[2].color}
              isMovable={!houses[2].disabled}
              onClick={handlePieceClick}
            />
          ))}
        <House 
          houseNumber={4} 
          pieces={houses[3].player?.pieces || []} 
          color={houses[3].color}
          disabled={houses[3].disabled}
          onPieceClick={handlePieceClick}
        />
      </div>
    </div>
  );
};

export default Houses;
