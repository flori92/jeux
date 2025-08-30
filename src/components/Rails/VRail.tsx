import React from 'react';
import type { LudoPiece } from '../../types/game.types';
import './Rails.css';

interface VRailProps {
  color: string;
  pieces?: LudoPiece[];
  piece?: LudoPiece;
  playerColor?: string;
  isMovable?: boolean;
  disabled?: boolean;
  onClick?: (pieceId: string) => void;
}

export const VRail: React.FC<VRailProps> = ({
  color,
  pieces,
  piece,
  playerColor,
  isMovable = true,
  disabled = false,
  onClick,
}) => {
  const railHeight = 200; // Hauteur du rail vertical
  const railWidth = 80;   // Largeur du rail vertical

  const handlePieceClick = (pieceId: string) => {
    if (onClick && !disabled && isMovable) {
      onClick(pieceId);
    }
  };

  // Utiliser soit pieces soit piece selon ce qui est fourni
  const piecesToRender = pieces || (piece ? [piece] : []);

  return (
    <div 
      className={`v-rail`}
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
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {piecesToRender.map((pieceItem) => (
        <div 
          key={pieceItem.id}
          className="rail-cell"
          style={{
            width: railWidth * 0.6,
            height: railWidth * 0.6,
            position: 'relative'
          }}
        >
          <div
            className={`piece`}
            onClick={() => handlePieceClick(pieceItem.id)}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: playerColor || color,
              border: '2px solid white',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              cursor: disabled || !isMovable ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default VRail;
