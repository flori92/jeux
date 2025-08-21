class LudoGame {
  constructor() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.board = this.initializeBoard();
    this.pieces = {};
    this.diceValue = null;
    this.consecutiveSixes = 0;
    this.winner = null;
    this.gameStatus = 'waiting';
    this.lastMove = null;
    this.canRollDice = true;
    this.mustMoveAfterDice = false;
    this.possibleMoves = [];
  }

  initializeBoard() {
    // Le plateau de Ludo a 52 cases dans le parcours principal
    // Plus 6 cases par couleur pour la colonne finale
    const board = {
      mainPath: [], // 52 cases du parcours principal
      homePaths: {}, // 6 cases pour chaque couleur vers le centre
      bases: {}, // Bases de départ pour chaque couleur
      safeZones: [0, 8, 13, 21, 26, 34, 39, 47] // Cases sûres où on ne peut pas être capturé
    };

    // Positions de départ pour chaque couleur
    const startPositions = {
      red: 0,
      blue: 13,
      yellow: 26,
      green: 39
    };

    board.startPositions = startPositions;
    return board;
  }

  addPlayer(playerId, playerName, color) {
    if (this.players.length >= 4) {
      return { error: 'La partie est complète' };
    }

    const colors = ['red', 'blue', 'yellow', 'green'];
    const assignedColor = color || colors[this.players.length];

    const player = {
      id: playerId,
      name: playerName,
      color: assignedColor,
      pieces: this.initializePieces(assignedColor),
      finishedPieces: 0,
      isActive: true
    };

    this.players.push(player);
    this.pieces[assignedColor] = player.pieces;

    if (this.players.length === 2) {
      this.gameStatus = 'playing';
    }

    return { player, gameState: this.getGameState() };
  }

  initializePieces(color) {
    const pieces = [];
    for (let i = 0; i < 4; i++) {
      pieces.push({
        id: `${color}-${i}`,
        color: color,
        position: 'base', // 'base', number (0-51 for main path), 'home-X' (0-5 for home path), 'finished'
        isInPlay: false,
        distanceTraveled: 0
      });
    }
    return pieces;
  }

  rollDice(playerId) {
    const player = this.players[this.currentPlayerIndex];
    
    if (!player || player.id !== playerId) {
      return { error: 'Ce n\'est pas votre tour' };
    }

    if (!this.canRollDice) {
      return { error: 'Vous devez d\'abord déplacer un pion' };
    }

    this.diceValue = Math.floor(Math.random() * 6) + 1;
    this.canRollDice = false;
    this.mustMoveAfterDice = true;

    // Calculer les mouvements possibles
    this.possibleMoves = this.calculatePossibleMoves(player, this.diceValue);

    // Si c'est un 6
    if (this.diceValue === 6) {
      this.consecutiveSixes++;
      
      // Si 3 six consécutifs, passer le tour
      if (this.consecutiveSixes >= 3) {
        this.consecutiveSixes = 0;
        this.nextTurn();
        return { 
          diceValue: this.diceValue, 
          threeSixes: true,
          gameState: this.getGameState() 
        };
      }
    }

    // Si aucun mouvement possible, passer le tour
    if (this.possibleMoves.length === 0) {
      this.nextTurn();
      return { 
        diceValue: this.diceValue, 
        noMoves: true,
        gameState: this.getGameState() 
      };
    }

    return { 
      diceValue: this.diceValue,
      possibleMoves: this.possibleMoves,
      gameState: this.getGameState() 
    };
  }

  calculatePossibleMoves(player, diceValue) {
    const moves = [];
    
    for (const piece of player.pieces) {
      if (piece.position === 'finished') continue;

      // Si le pion est dans la base et qu'on a fait un 6
      if (piece.position === 'base' && diceValue === 6) {
        moves.push({
          pieceId: piece.id,
          from: 'base',
          to: this.board.startPositions[player.color],
          type: 'start'
        });
      }
      // Si le pion est en jeu
      else if (piece.position !== 'base') {
        const newPosition = this.calculateNewPosition(piece, diceValue, player.color);
        if (newPosition !== null) {
          moves.push({
            pieceId: piece.id,
            from: piece.position,
            to: newPosition,
            type: this.getMoveType(piece.position, newPosition)
          });
        }
      }
    }

    return moves;
  }

  calculateNewPosition(piece, steps, color) {
    if (piece.position === 'base' || piece.position === 'finished') {
      return null;
    }

    // Si le pion est sur le parcours principal
    if (typeof piece.position === 'number') {
      const startPos = this.board.startPositions[color];
      const homeEntrance = (startPos + 50) % 52; // Position avant d'entrer dans la colonne finale
      
      // Calculer la nouvelle position
      let newPos = piece.position + steps;
      
      // Vérifier si le pion peut entrer dans la colonne finale
      if (piece.distanceTraveled + steps > 50) {
        const stepsInHome = (piece.distanceTraveled + steps) - 51;
        if (stepsInHome <= 6) {
          return `home-${stepsInHome - 1}`;
        }
        return null; // Dépasse la case finale
      }

      return newPos % 52;
    }
    
    // Si le pion est dans la colonne finale
    if (piece.position.startsWith('home-')) {
      const currentHomePos = parseInt(piece.position.split('-')[1]);
      const newHomePos = currentHomePos + steps;
      
      if (newHomePos === 5) {
        return 'finished';
      } else if (newHomePos < 5) {
        return `home-${newHomePos}`;
      }
      
      return null; // Dépasse la case finale
    }

    return null;
  }

  getMoveType(from, to) {
    if (from === 'base') return 'start';
    if (to === 'finished') return 'finish';
    if (typeof to === 'string' && to.startsWith('home-')) return 'home';
    return 'normal';
  }

  movePiece(playerId, pieceId) {
    const player = this.players[this.currentPlayerIndex];
    
    if (!player || player.id !== playerId) {
      return { error: 'Ce n\'est pas votre tour' };
    }

    if (this.canRollDice) {
      return { error: 'Vous devez d\'abord lancer le dé' };
    }

    // Vérifier si le mouvement est dans les mouvements possibles
    const move = this.possibleMoves.find(m => m.pieceId === pieceId);
    if (!move) {
      return { error: 'Mouvement invalide' };
    }

    // Trouver le pion
    const piece = player.pieces.find(p => p.id === pieceId);
    if (!piece) {
      return { error: 'Pion introuvable' };
    }

    // Effectuer le déplacement
    const previousPosition = piece.position;
    
    // Gérer la capture d'un pion adverse
    if (typeof move.to === 'number' && !this.board.safeZones.includes(move.to)) {
      this.handleCapture(move.to, player.color);
    }

    // Mettre à jour la position du pion
    piece.position = move.to;
    if (move.type === 'start') {
      piece.isInPlay = true;
    } else if (move.type === 'finish') {
      player.finishedPieces++;
      piece.position = 'finished';
      
      // Vérifier la victoire
      if (player.finishedPieces === 4) {
        this.winner = player;
        this.gameStatus = 'finished';
      }
    }

    // Mettre à jour la distance parcourue
    if (typeof previousPosition === 'number' && typeof move.to === 'number') {
      piece.distanceTraveled += this.diceValue;
    }

    this.lastMove = {
      playerId,
      pieceId,
      from: previousPosition,
      to: move.to,
      diceValue: this.diceValue
    };

    // Gérer le tour suivant
    if (this.diceValue === 6 && this.consecutiveSixes < 3) {
      this.canRollDice = true;
      this.mustMoveAfterDice = false;
    } else {
      this.nextTurn();
    }

    return { 
      success: true,
      move: this.lastMove,
      gameState: this.getGameState() 
    };
  }

  handleCapture(position, attackerColor) {
    for (const player of this.players) {
      if (player.color === attackerColor) continue;
      
      for (const piece of player.pieces) {
        if (piece.position === position) {
          // Renvoyer le pion à la base
          piece.position = 'base';
          piece.isInPlay = false;
          piece.distanceTraveled = 0;
          break;
        }
      }
    }
  }

  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.diceValue = null;
    this.consecutiveSixes = 0;
    this.canRollDice = true;
    this.mustMoveAfterDice = false;
    this.possibleMoves = [];
  }

  getGameState() {
    return {
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        pieces: p.pieces,
        finishedPieces: p.finishedPieces,
        isActive: p.isActive
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.players[this.currentPlayerIndex],
      diceValue: this.diceValue,
      gameStatus: this.gameStatus,
      winner: this.winner,
      lastMove: this.lastMove,
      canRollDice: this.canRollDice,
      possibleMoves: this.possibleMoves,
      consecutiveSixes: this.consecutiveSixes
    };
  }

  removePlayer(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      this.players[playerIndex].isActive = false;
      
      // Si c'était le tour de ce joueur, passer au suivant
      if (playerIndex === this.currentPlayerIndex) {
        this.nextTurn();
      }
      
      // Si il ne reste qu'un joueur actif, il gagne
      const activePlayers = this.players.filter(p => p.isActive);
      if (activePlayers.length === 1) {
        this.winner = activePlayers[0];
        this.gameStatus = 'finished';
      }
    }
  }
}

export default LudoGame;
