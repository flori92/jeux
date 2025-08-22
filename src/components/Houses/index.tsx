import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { House } from '../House';
import { HRail } from '../Rails/HRail';
import { VRail } from '../Rails/VRail';
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

  const handlePieceClick = (pieceId: string) => {
    // Handle piece selection logic here
    console.log('Piece clicked:', pieceId);
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
        <VRail 
          color={houses[1].color}
          pieces={players.flatMap(p => p.pieces.filter(piece => piece.position === 'track' && piece.color === houses[1].color))}
          disabled={houses[1].disabled}
        />
        <House 
          houseNumber={2} 
          pieces={houses[1].player?.pieces || []} 
          color={houses[1].color}
          disabled={houses[1].disabled}
          onPieceClick={handlePieceClick}
        />
      </div>
      
      <div className="houses-row">
        <HRail 
          color={houses[0].color}
          position="left"
          pieces={players.flatMap(p => p.pieces.filter(piece => piece.position === 'track' && piece.color === houses[0].color))}
          disabled={houses[0].disabled}
        />
        <div className="center-area">
          {/* Center area for dice, etc. */}
        </div>
        <HRail 
          color={houses[3].color}
          position="right"
          pieces={players.flatMap(p => p.pieces.filter(piece => piece.position === 'track' && piece.color === houses[3].color))}
          disabled={houses[3].disabled}
        />
      </div>
      
      <div className="houses-row">
        <House 
          houseNumber={3} 
          pieces={houses[2].player?.pieces || []} 
          color={houses[2].color}
          disabled={houses[2].disabled}
          onPieceClick={handlePieceClick}
        />
        <VRail 
          color={houses[2].color}
          pieces={players.flatMap(p => p.pieces.filter(piece => piece.position === 'track' && piece.color === houses[2].color))}
          disabled={houses[2].disabled}
        />
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
