import React from 'react';
import { useDispatch } from 'react-redux';
import { LudoPiece } from '../../types/game.types';

interface HouseProps {
  houseNumber: number;
  pieces: LudoPiece[];
  color: string;
  disabled?: boolean;
  onPieceClick?: (pieceId: string) => void;
}

export const House: React.FC<HouseProps> = ({
  houseNumber,
  pieces,
  color,
  disabled = false,
  onPieceClick
}) => {
  const dispatch = useDispatch();
  const houseHeight = 200; // Taille de base, à ajuster selon le design
  const seedSize = houseHeight * 0.15;

  const handlePieceClick = (pieceId: string) => {
    if (onPieceClick && !disabled) {
      onPieceClick(pieceId);
    }
  };

  return (
    <div 
      className={`house house-${houseNumber} ${disabled ? 'disabled' : ''}`}
      style={{
        width: houseHeight,
        height: houseHeight,
        backgroundColor: `${color}20`, // Ajout d'opacité à la couleur
        borderRadius: '10px',
        padding: houseHeight * 0.2,
        position: 'relative',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <div 
        style={{
          width: '60%',
          height: '60%',
          backgroundColor: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          position: 'absolute',
          top: '20%',
          left: '20%'
        }}
      >
        {pieces
          .filter(piece => piece.position === 'base')
          .map((piece, index) => (
            <div
              key={piece.id}
              className={`piece ${piece.color} ${disabled ? 'disabled' : ''}`}
              onClick={() => handlePieceClick(piece.id)}
              style={{
                width: seedSize,
                height: seedSize,
                margin: seedSize * 0.2,
                borderRadius: '50%',
                backgroundColor: piece.color,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                ':hover': {
                  transform: disabled ? 'none' : 'scale(1.1)'
                }
              }}
            >
              {index + 1}
            </div>
          ))}
      </div>
    </div>
  );
};

export default House;
