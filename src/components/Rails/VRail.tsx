import React from 'react';
import type { LudoPiece } from '../../types/game.types';
import './Rails.css';

interface VRailProps {
  color: string;
  position?: 'top' | 'bottom';
  piece: LudoPiece;
  playerColor: string;
  onClick?: (pieceId: string) => void;
  isSelected?: boolean;
  isMovable?: boolean;
}

export const VRail: React.FC<VRailProps> = ({
  color,
  position = 'top',
  piece,
  playerColor,
  onClick,
  isSelected,
  isMovable
}) => {
  const railHeight = 200; // Hauteur du rail vertical
  const railWidth = 80;   // Largeur du rail vertical
  const { id } = piece;

  const handlePieceClick = (pieceId: string) => {
    if (onClick) {
      onClick(pieceId);
    }
  };

  return (
    <div 
      className={`v-rail ${position}`}
      style={{
        width: railWidth,
        height: railHeight,
        backgroundColor: `${color}20`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '10px 0',
        position: 'relative',
      }}
    >
      <div 
        className="rail-cell"
        style={{
          width: railWidth * 0.6,
          height: railWidth * 0.6,
          position: 'relative'
        }}
      >
        <div
          className={`piece ${playerColor} ${isSelected ? 'selected' : ''}`}
          onClick={() => handlePieceClick(id)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: playerColor,
            border: isSelected ? '2px solid gold' : '2px solid white',
            boxShadow: isSelected ? '0 0 10px gold' : '0 2px 5px rgba(0,0,0,0.3)',
            cursor: isMovable ? 'pointer' : 'default',
            opacity: isMovable ? 1 : 0.7,
            transform: isMovable && isSelected ? 'scale(1.1)' : 'none',
            transition: 'all 0.2s ease'
          }}
        />
      </div>
    </div>
  );
};

export default VRail;
