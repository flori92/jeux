// Configuration du plateau de jeu
export const BOARD_CONFIG = {
  // Dimensions du plateau
  WIDTH: 800,
  HEIGHT: 800,
  
  // Couleurs des joueurs
  PLAYER_COLORS: [
    '#e74c3c', // Rouge
    '#3498db', // Bleu
    '#f1c40f', // Jaune
    '#2ecc71'  // Vert
  ],
  
  // Noms des joueurs par défaut
  PLAYER_NAMES: ['Rouge', 'Bleu', 'Jaune', 'Vert'],
  
  // Nombre de pions par joueur
  PIECES_PER_PLAYER: 4,
  
  // Positions de départ des maisons (en pourcentage du plateau)
  HOUSE_POSITIONS: [
    { x: 0, y: 0 },    // Maison 1 (en haut à gauche)
    { x: 0.75, y: 0 },  // Maison 2 (en haut à droite)
    { x: 0, y: 0.75 },  // Maison 3 (en bas à gauche)
    { x: 0.75, y: 0.75 } // Maison 4 (en bas à droite)
  ],
  
  // Taille des maisons (en pourcentage du plateau)
  HOUSE_SIZE: 0.25,
  
  // Taille des chemins (rails)
  PATH_WIDTH: 0.1,
  
  // Taille des pions (en pourcentage de la largeur du plateau)
  PIECE_SIZE: 0.03,
  
  // Taille du dé
  DICE_SIZE: 0.1,
  
  // Vitesse d'animation (en ms)
  ANIMATION_SPEED: 300,
  
  // Délai entre les tours (en ms)
  TURN_DELAY: 1000
};

// Configuration des règles du jeu
export const GAME_RULES = {
  // Score nécessaire pour gagner (nombre de pions arrivés à la fin)
  WIN_SCORE: 4,
  
  // Nombre de points pour gagner une partie
  POINTS_TO_WIN: 3,
  
  // Règles spéciales
  SIX_GETS_EXTRA_TURN: true, // Un 6 donne un tour supplémentaire
  THREE_SIXES_SKIP_TURN: true, // Trois 6 d'affilée font sauter le tour
  CAPTURE_ENABLED: true, // Activer la capture des pions adverses
  
  // Position de départ des pions
  START_POSITION: 'base',
  
  // Position d'arrivée
  END_POSITION: 'home',
  
  // Nombre de cases sur le parcours
  TRACK_LENGTH: 52
};

// Configuration des effets sonores
export const SOUND_CONFIG = {
  ENABLED: true,
  VOLUME: 0.5,
  SOUNDS: {
    DICE_ROLL: '/sounds/dice-roll.mp3',
    PIECE_MOVE: '/sounds/piece-move.mp3',
    PIECE_CAPTURE: '/sounds/capture.mp3',
    WIN: '/sounds/win.mp3',
    LOSE: '/sounds/lose.mp3',
    BUTTON_CLICK: '/sounds/button-click.mp3'
  }
};

// Configuration de l'interface utilisateur
export const UI_CONFIG = {
  // Thème de l'interface
  THEME: 'default',
  
  // Taille de police de base
  FONT_SIZE: 16,
  
  // Couleurs de l'interface
  COLORS: {
    BACKGROUND: '#f5f5f5',
    PRIMARY: '#3498db',
    SECONDARY: '#2ecc71',
    ACCENT: '#e74c3c',
    TEXT: '#2c3e50',
    TEXT_LIGHT: '#7f8c8d',
    BORDER: '#bdc3c7',
    SUCCESS: '#27ae60',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    INFO: '#3498db'
  },
  
  // Espacement
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px'
  },
  
  // Bordures
  BORDER_RADIUS: {
    SM: '4px',
    MD: '8px',
    LG: '16px',
    ROUND: '50%'
  },
  
  // Ombres
  SHADOWS: {
    SM: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    MD: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    LG: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
  },
  
  // Transitions
  TRANSITIONS: {
    FAST: 'all 0.15s ease-in-out',
    NORMAL: 'all 0.3s ease-in-out',
    SLOW: 'all 0.5s ease-in-out'
  }
};

// Configuration du mode multijoueur
export const MULTIPLAYER_CONFIG = {
  ENABLED: true,
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  
  // Configuration du réseau
  NETWORK: {
    TIMEOUT: 10000, // 10 secondes
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 1000 // 1 seconde
  },
  
  // Configuration des salles de jeu
  ROOMS: {
    MAX_PLAYERS_PER_ROOM: 4,
    PRIVATE_ROOM_LENGTH: 6, // Longueur du code de salle privée
    INACTIVITY_TIMEOUT: 300000 // 5 minutes d'inactivité avant déconnexion
  }
};

// Configuration de l'IA
export const AI_CONFIG = {
  ENABLED: true,
  DIFFICULTY_LEVELS: [
    { id: 'easy', name: 'Facile', depth: 1 },
    { id: 'medium', name: 'Moyen', depth: 3 },
    { id: 'hard', name: 'Difficile', depth: 5 }
  ],
  
  // Comportement de l'IA
  BEHAVIOR: {
    AGGRESSIVE: 0.7, // Probabilité de prendre des risques pour capturer un pion
    DEFENSIVE: 0.3,  // Probabilité de jouer de manière défensive
    RANDOM: 0.1      // Probabilité de faire un mouvement aléatoire
  },
  
  // Délai de réflexion de l'IA (en ms)
  THINKING_DELAY: {
    MIN: 500,
    MAX: 2000
  }
};

// Configuration des statistiques
export const STATS_CONFIG = {
  TRACK_GAME_HISTORY: true,
  MAX_GAMES_STORED: 100,
  TRACK_MOVES: true,
  TRACK_WIN_RATES: true,
  TRACK_AVERAGE_GAME_TIME: true
};

// Configuration des sauvegardes
export const SAVE_CONFIG = {
  AUTO_SAVE: true,
  AUTO_SAVE_INTERVAL: 60000, // 1 minute
  MAX_SAVE_SLOTS: 10,
  CLOUD_SAVE: false
};
