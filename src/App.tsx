import React, { useState } from 'react';
import LudoBoard from './components/LudoBoard';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <LudoBoard />
    </div>
  );
};

export default App;
