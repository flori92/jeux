import React, { useState } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import SettingsMenu from './components/SettingsMenu/SettingsMenu';
import Game from './components/Game/Game';
import './App.css';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setShowSettings(false);
    setGameStarted(true);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setGameStarted(false);
  };

  return (
    <Provider store={store}>
      <div className="app">
        <header className="app-header">
          <h1>🎲 Ludo Game 🎯</h1>
          {gameStarted && (
            <button 
              onClick={handleSettingsClick}
              className="settings-button"
              aria-label="Paramètres"
            >
              ⚙️
            </button>
          )}
        </header>
        
        <main>
          {showSettings ? (
            <SettingsMenu 
              onStartGame={handleStartGame} 
              onClose={() => setShowSettings(false)} 
            />
          ) : (
            <Game />
          )}
        </main>
      </div>
    </Provider>
  );
};

export default App;
