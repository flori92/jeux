import React from 'react';
import type { LudoPiece } from '../../types/game.types';
import './Rails.css';

interface HRailProps {
  color: string;
  position: 'left' | 'right';
  pieces: LudoPiece[];
  disabled?: boolean;
  onClick?: (pieceId: string) => void;
}

export const HRail: React.FC<HRailProps> = ({
  color,
  position,
  pieces,
  disabled = false,
  onClick,
}) => {
  const railHeight = 80; // Hauteur du rail
  const railWidth = 200; // Largeur du rail
  const pieceSize = railHeight * 0.6;

  const handlePieceClick = (pieceId: string) => {
    if (onClick && !disabled) {
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
        position: 'relative',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {pieces.map((piece, index) => (
        <div 
          key={piece.id}
          className="rail-cell"
          style={{
            width: pieceSize,
            height: pieceSize,
            position: 'relative'
          }}
        >
          <div
            className={`piece ${piece.color}`}
            onClick={() => handlePieceClick(piece.id)}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: piece.color,
              border: '2px solid white',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default HRail;
