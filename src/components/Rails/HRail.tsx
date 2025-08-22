import React from 'react';
import type { LudoPiece } from '../../types/game.types';
import './Rails.css';

interface HRailProps {
  color: string;
  position: 'left' | 'right';
  piece: LudoPiece;
  playerColor: string;
  onClick?: (pieceId: string) => void;
  isSelected?: boolean;
  isMovable?: boolean;
}

export const HRail: React.FC<HRailProps> = ({
  color,
  position,
  piece,
  playerColor,
  onClick,
  isSelected,
  isMovable
}) => {
  const railHeight = 80; // Hauteur du rail
  const railWidth = 200; // Largeur du rail
  const pieceSize = railHeight * 0.6;

  const handlePieceClick = (pieceId: string) => {
    if (onClick) {
      onClick(pieceId);
    }
  };

  return (
    <div 
      className={`h-rail ${position}`}
      style={{
        width: railWidth,
        height: railHeight,
        backgroundColor: `${color}20`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 10px',
        position: 'relative'
      }}
    >
      <div 
        className="rail-cell"
        style={{
          width: pieceSize,
          height: pieceSize,
          position: 'relative'
        }}
      >
        <div
          className={`piece ${playerColor}`}
          onClick={() => handlePieceClick(piece.id)}
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

export default HRail;
