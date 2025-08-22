import React from 'react';

interface GameSelectorProps {
  onGameSelect: (gameType: 'checkers' | 'ludo', mode: 'multiplayer' | 'ai') => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({ onGameSelect }) => {
  const [selectedGame, setSelectedGame] = React.useState<'checkers' | 'ludo' | null>(null);

  const handleGameSelect = (gameType: 'checkers' | 'ludo') => {
    setSelectedGame(gameType);
  };

  const handleModeSelect = (mode: 'multiplayer' | 'ai') => {
    if (selectedGame) {
      onGameSelect(selectedGame, mode);
    }
  };

  const handleBack = () => {
    setSelectedGame(null);
  };

  if (selectedGame) {
    const gameTitle = selectedGame === 'checkers' ? 'Jeu de Dames' : 'Ludo';
    
    return (
      <div className="game-selector">
        <button onClick={handleBack} className="back-button">← Retour</button>
        <h2>Mode de jeu - {gameTitle}</h2>
        <div className="mode-options">
          <div className="mode-card" onClick={() => handleModeSelect('multiplayer')}>
            <div className="mode-icon">👥</div>
            <h3>Multijoueur</h3>
            <p>Jouez contre un autre joueur en ligne</p>
          </div>
          
          <div className="mode-card" onClick={() => handleModeSelect('ai')}>
            <div className="mode-icon">🤖</div>
            <h3>Contre l'Ordinateur</h3>
            <p>Jouez contre une intelligence artificielle</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-selector">
      <h2>Choisissez votre jeu</h2>
      <div className="game-options">
        <div className="game-card" onClick={() => handleGameSelect('checkers')}>
          <div className="game-icon">♛</div>
          <h3>Jeu de Dames</h3>
          <p>Jeu de stratégie classique sur plateau 8x8</p>
          <ul>
            <li>Déplacements en diagonale</li>
            <li>Captures obligatoires</li>
            <li>Promotion en dame</li>
          </ul>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleGameSelect('checkers');
            }}
          >
            Jouer aux Dames
          </button>
        </div>
        
        <div className="game-card" onClick={() => handleGameSelect('ludo')}>
          <div className="game-icon">🎲</div>
          <h3>Ludo</h3>
          <p>Jeu de course amusant pour toute la famille</p>
          <ul>
            <li>Lancez le dé pour avancer</li>
            <li>Sortez vos pions avec un 6</li>
            <li>Capturez les pions adverses</li>
          </ul>
          <button
            className="btn btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleGameSelect('ludo');
            }}
          >
            Jouer au Ludo
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
