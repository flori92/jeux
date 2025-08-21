# 🎮 Jeu de Dames en Ligne

## 📝 Description
Jeu de dames multijoueur en temps réel avec système d'invitation. Les joueurs peuvent capturer les pièces adverses en avant et en arrière, avec possibilité d'inviter n'importe qui à jouer en ligne.

## ✨ Fonctionnalités

### Gameplay
- **Règles de dames classiques** avec capture avant et arrière
- **Promotion en dame** quand un pion atteint le bord opposé
- **Captures obligatoires** et captures multiples en chaîne
- **Tour par tour** avec indication visuelle du joueur actif

### Multijoueur
- **Création de parties** avec ID unique
- **Rejoindre une partie** via son ID
- **Système d'invitation** par email (simulation)
- **Synchronisation temps réel** via WebSocket
- **Gestion des déconnexions**

### Interface
- **Plateau interactif** avec cases cliquables
- **Surlignage des mouvements possibles**
- **Indicateurs visuels** pour les pions et dames
- **Interface responsive** adaptée mobile et desktop

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation des dépendances

```bash
# Frontend
cd ludo-dames
npm install

# Backend
cd server
npm install
```

## ▶️ Lancement de l'application

### 1. Démarrer le serveur (Terminal 1)
```bash
cd ludo-dames/server
npm start
```
Le serveur démarre sur `http://localhost:3001`

### 2. Démarrer le client (Terminal 2)
```bash
cd ludo-dames
npm run dev
```
L'application est accessible sur `http://localhost:5173`

## 🎯 Comment jouer

### Créer une partie
1. Ouvrir l'application dans votre navigateur
2. Entrer votre nom
3. Cliquer sur "Créer une partie"
4. Partager l'ID de partie avec votre adversaire
5. Attendre qu'il rejoigne ou l'inviter par email

### Rejoindre une partie
1. Ouvrir l'application
2. Entrer votre nom
3. Entrer l'ID de la partie
4. Cliquer sur "Rejoindre la partie"

### Règles du jeu
- **Déplacement** : Les pions se déplacent en diagonale d'une case
- **Capture** : Sauter par-dessus un pion adverse (avant ou arrière)
- **Captures multiples** : Obligatoire de continuer si possible
- **Promotion** : Un pion devient dame en atteignant le bord opposé
- **Dame** : Peut se déplacer et capturer dans toutes les directions
- **Victoire** : Capturer tous les pions adverses ou bloquer tous ses mouvements

## 🛠️ Architecture technique

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── GameBoard.tsx    # Plateau de jeu
│   ├── Square.tsx       # Case du plateau
│   ├── Lobby.tsx        # Salle d'attente
│   └── InviteModal.tsx  # Modal d'invitation
├── hooks/
│   └── useGameSocket.ts # Gestion WebSocket
├── types/
│   └── game.types.ts    # Types TypeScript
└── App.tsx              # Application principale
```

### Backend (Node.js + Socket.IO)
```
server/
├── server.js        # Serveur Express + Socket.IO
├── gameManager.js   # Gestionnaire de parties
└── checkersGame.js  # Logique du jeu de dames
```

## 📡 API WebSocket

### Événements Client → Serveur
- `register` : Enregistrer un joueur
- `createGame` : Créer une nouvelle partie
- `joinGame` : Rejoindre une partie existante
- `makeMove` : Effectuer un mouvement
- `invitePlayer` : Inviter un joueur par email

### Événements Serveur → Client
- `gameStateUpdate` : Mise à jour de l'état du jeu
- `gameStarted` : Partie démarrée (2 joueurs)
- `gameEnded` : Partie terminée avec vainqueur
- `opponentLeft` : L'adversaire s'est déconnecté
- `error` : Erreur de jeu

## 🔧 Configuration

### Ports par défaut
- Frontend : `5173`
- Backend : `3001`

### Modifier les ports
```javascript
// Frontend: src/hooks/useGameSocket.ts
const SOCKET_URL = 'http://localhost:3001';

// Backend: server/server.js
const PORT = process.env.PORT || 3001;
```

## 📦 Dépendances principales

### Frontend
- React 18
- TypeScript
- Socket.IO Client
- React Router DOM
- Vite

### Backend
- Express
- Socket.IO
- UUID
- CORS

## 🐛 Développement

### Mode développement avec hot-reload
```bash
# Backend (avec nodemon)
cd server
npm run dev

# Frontend
cd ludo-dames
npm run dev
```

## 📄 Licence
MIT
