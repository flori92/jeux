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

  findPiece(pieceId) {
    for (const player of this.players) {
      const piece = player.pieces.find(p => p.id === pieceId);
      if (piece) return piece;
    }
    return null;
  }

  validateAndMovePiece(piece, diceValue) {
    // Pion en base - doit sortir avec un 6
    if (piece.position === 'base') {
      if (diceValue !== 6) {
        return { valid: false, error: 'Un 6 est nécessaire pour sortir de la base' };
      }
      return { valid: true, newPosition: this.getStartPosition(piece.playerId), type: 'start' };
    }

    // Calculer la nouvelle position
    const newPosition = this.calculateNewPosition(piece, diceValue);
    
    // Vérifier si le mouvement est valide
    if (newPosition === null) {
      return { valid: false, error: 'Mouvement impossible' };
    }

    return { valid: true, newPosition, type: 'normal' };
  }

  getStartPosition(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    const startPositions = [1, 14, 27, 40]; // Positions de départ pour chaque joueur
    return startPositions[playerIndex];
  }

  calculateNewPosition(piece, diceValue) {
    if (piece.position === 'base') return null;
    
    const currentPos = piece.position;
    const newPos = currentPos + diceValue;
    
    // Vérifier si le pion atteint la zone de fin
    const maxPosition = this.getMaxPosition(piece.playerId);
    if (newPos > maxPosition) {
      return null; // Mouvement impossible
    }
    
    if (newPos === maxPosition) {
      return 'finished';
    }
    
    return newPos > 52 ? newPos - 52 : newPos; // Boucle autour du plateau
  }

  getMaxPosition(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    return 52 + (6 * playerIndex); // 52 cases + 6 cases de fin par joueur
  }

  movePiece(piece, newPosition) {
    piece.position = newPosition;
  }

  checkCaptures(piece, newPosition) {
    if (newPosition === 'base' || newPosition === 'finished') return false;
    
    // Vérifier les zones de sécurité
    const safeZones = [1, 9, 14, 22, 27, 35, 40, 48];
    if (safeZones.includes(newPosition)) return false;

    // Chercher des pions adverses sur la même case
    for (const player of this.players) {
      if (player.id === piece.playerId) continue;
      
      for (const enemyPiece of player.pieces) {
        if (enemyPiece.position === newPosition) {
          // Capturer le pion adverse
          enemyPiece.position = 'base';
          return true;
        }
      }
    }
    
    return false;
  }

  checkWinCondition() {
    for (const player of this.players) {
      const finishedPieces = player.pieces.filter(p => p.position === 'finished').length;
      if (finishedPieces === 4) {
        return player.id;
      }
    }
    return null;
  }

  makeMove(playerId, pieceId) {
    if (this.status !== 'playing') {
      return { valid: false, error: 'La partie n\'est pas en cours' };
    }
    
    if (!this.isPlayerTurn(playerId)) {
      return { valid: false, error: 'Ce n\'est pas votre tour' };
    }

    if (!this.diceValue) {
      return { valid: false, error: 'Vous devez lancer le dé d\'abord' };
    }

    const piece = this.findPiece(pieceId);
    if (!piece || piece.playerId !== playerId) {
      return { valid: false, error: 'Pion invalide' };
    }

    // Valider le mouvement
    const moveResult = this.validateAndMovePiece(piece, this.diceValue);
    if (!moveResult.valid) {
      return moveResult;
    }

    // Effectuer le mouvement
    this.movePiece(piece, moveResult.newPosition);

    // Vérifier les captures
    const captured = this.checkCaptures(piece, moveResult.newPosition);

    // Vérifier les conditions de victoire
    const winner = this.checkWinCondition();
    if (winner) {
      this.status = 'finished';
      this.winner = winner;
      return { valid: true, gameOver: true, winner };
    }

    // Gérer le tour suivant
    const shouldRollAgain = this.diceValue === 6 || captured;
    if (!shouldRollAgain) {
      this.switchPlayer();
    }

    this.diceValue = null;
    this.canRollDice = true;
    
    return { 
      valid: true, 
      rollAgain: shouldRollAgain,
      captured: captured
    };
  }
}

export default LudoGame;
