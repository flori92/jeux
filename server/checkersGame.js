class CheckersGame {
  constructor(gameId) {
    this.id = gameId;
    this.players = [];
    this.board = this.initializeBoard();
    this.pieces = {};
    this.currentPlayer = null;
    this.winner = null;
    this.status = 'waiting'; // waiting, playing, finished
    this.captureChain = null; // Pour gérer les prises multiples
  }

  initializeBoard() {
    // Créer un plateau 8x8 vide
    return Array(8).fill(null).map(() => Array(8).fill(null));
  }

  addPlayer(player) {
    if (this.players.length >= 2) {
      throw new Error('La partie est déjà complète');
    }
    
    this.players.push(player);
    
    // Initialiser les pièces du joueur
    this.pieces[player.id] = this.createPieces(player);
    
    // Placer les pièces sur le plateau
    this.placePiecesOnBoard(player);
  }

  createPieces(player) {
    const pieces = [];
    const isWhite = player.color === 'white';
    const startRow = isWhite ? 5 : 0;
    
    // Créer 12 pions pour chaque joueur
    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = 0; col < 8; col++) {
        // Les pions sont placés uniquement sur les cases sombres
        if ((row + col) % 2 === 1) {
          pieces.push({
            id: `${player.id}_${pieces.length}`,
            playerId: player.id,
            isKing: false,
            position: [row, col]
          });
        }
      }
    }
    
    return pieces;
  }

  placePiecesOnBoard(player) {
    const playerPieces = this.pieces[player.id];
    
    playerPieces.forEach(piece => {
      const [row, col] = piece.position;
      this.board[row][col] = piece;
    });
  }

  startGame() {
    if (this.players.length !== 2) {
      throw new Error('Deux joueurs sont nécessaires pour commencer');
    }
    
    this.status = 'playing';
    // Le joueur blanc commence
    this.currentPlayer = this.players.find(p => p.color === 'white').id;
  }

  isPlayerTurn(playerId) {
    return this.currentPlayer === playerId;
  }

  makeMove(playerId, move) {
    if (this.status !== 'playing') {
      return { valid: false, error: 'La partie n\'est pas en cours' };
    }
    
    if (!this.isPlayerTurn(playerId)) {
      return { valid: false, error: 'Ce n\'est pas votre tour' };
    }
    
    const { from, to } = move;
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    
    // Vérifier que la pièce appartient au joueur
    const piece = this.board[fromRow][fromCol];
    if (!piece || piece.playerId !== playerId) {
      return { valid: false, error: 'Pièce invalide' };
    }
    
    // Vérifier si c'est un mouvement valide
    const moveType = this.getMoveType(from, to, piece);
    
    if (moveType === 'invalid') {
      return { valid: false, error: 'Mouvement invalide' };
    }
    
    // Si on est dans une chaîne de capture, vérifier qu'on continue avec la même pièce
    if (this.captureChain && this.captureChain.pieceId !== piece.id) {
      return { valid: false, error: 'Vous devez continuer la capture avec la même pièce' };
    }
    
    // Effectuer le mouvement
    if (moveType === 'capture') {
      const capturedPos = this.getCapturedPosition(from, to);
      const capturedPiece = this.board[capturedPos[0]][capturedPos[1]];
      
      // Retirer la pièce capturée
      this.board[capturedPos[0]][capturedPos[1]] = null;
      this.removePiece(capturedPiece);
      
      // Déplacer la pièce
      this.board[fromRow][fromCol] = null;
      this.board[toRow][toCol] = piece;
      piece.position = [toRow, toCol];
      
      // Vérifier s'il y a d'autres captures possibles
      const additionalCaptures = this.getPossibleCaptures(piece);
      
      if (additionalCaptures.length > 0) {
        // Le joueur doit continuer à capturer
        this.captureChain = { pieceId: piece.id, position: [toRow, toCol] };
        return { valid: true, continueCapture: true };
      } else {
        this.captureChain = null;
      }
    } else {
      // Mouvement simple
      this.board[fromRow][fromCol] = null;
      this.board[toRow][toCol] = piece;
      piece.position = [toRow, toCol];
    }
    
    // Vérifier si le pion devient une dame
    if (this.shouldPromoteToKing(piece)) {
      piece.isKing = true;
    }
    
    // Vérifier si le jeu est terminé
    const gameOver = this.checkGameOver();
    if (gameOver) {
      this.status = 'finished';
      this.winner = gameOver.winner;
      return { valid: true, gameOver: true, winner: this.winner };
    }
    
    // Changer de joueur si pas de capture continue
    if (!this.captureChain) {
      this.switchPlayer();
    }
    
    return { valid: true };
  }

  getMoveType(from, to, piece) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // Vérifier que c'est un mouvement diagonal
    if (Math.abs(rowDiff) !== colDiff) {
      return 'invalid';
    }
    
    // Vérifier que la case de destination est vide
    if (this.board[toRow][toCol] !== null) {
      return 'invalid';
    }
    
    // Mouvement simple (1 case)
    if (Math.abs(rowDiff) === 1) {
      // Si ce n'est pas une dame, vérifier la direction
      if (!piece.isKing) {
        const isWhite = this.getPlayerColor(piece.playerId) === 'white';
        const validDirection = isWhite ? rowDiff < 0 : rowDiff > 0;
        
        if (!validDirection) {
          return 'invalid';
        }
      }
      
      // Vérifier s'il y a des captures obligatoires
      if (this.hasCaptures(piece.playerId)) {
        return 'invalid'; // Les captures sont obligatoires
      }
      
      return 'simple';
    }
    
    // Capture (2 cases)
    if (Math.abs(rowDiff) === 2) {
      const middleRow = fromRow + rowDiff / 2;
      const middleCol = fromCol + (toCol - fromCol) / 2;
      const middlePiece = this.board[middleRow][middleCol];
      
      // Vérifier qu'il y a une pièce adverse au milieu
      if (!middlePiece || middlePiece.playerId === piece.playerId) {
        return 'invalid';
      }
      
      // Pour les pions non-dames, permettre la capture en avant ET en arrière
      // C'est la règle spéciale demandée par l'utilisateur
      return 'capture';
    }
    
    return 'invalid';
  }

  getCapturedPosition(from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const middleRow = fromRow + (toRow - fromRow) / 2;
    const middleCol = fromCol + (toCol - fromCol) / 2;
    return [middleRow, middleCol];
  }

  getPossibleCaptures(piece) {
    const captures = [];
    const [row, col] = piece.position;
    
    // Vérifier les 4 directions diagonales pour les captures
    const directions = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      // Vérifier les limites du plateau
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const moveType = this.getMoveType(piece.position, [newRow, newCol], piece);
        if (moveType === 'capture') {
          captures.push([newRow, newCol]);
        }
      }
    }
    
    return captures;
  }

  hasCaptures(playerId) {
    const playerPieces = this.pieces[playerId];
    
    for (const piece of playerPieces) {
      if (this.getPossibleCaptures(piece).length > 0) {
        return true;
      }
    }
    
    return false;
  }

  removePiece(piece) {
    const playerPieces = this.pieces[piece.playerId];
    const index = playerPieces.findIndex(p => p.id === piece.id);
    
    if (index !== -1) {
      playerPieces.splice(index, 1);
    }
  }

  shouldPromoteToKing(piece) {
    if (piece.isKing) {
      return false;
    }
    
    const [row] = piece.position;
    const isWhite = this.getPlayerColor(piece.playerId) === 'white';
    
    // Les blancs deviennent dames sur la rangée 0, les noirs sur la rangée 7
    return (isWhite && row === 0) || (!isWhite && row === 7);
  }

  getPlayerColor(playerId) {
    const player = this.players.find(p => p.id === playerId);
    return player ? player.color : null;
  }

  switchPlayer() {
    const currentIndex = this.players.findIndex(p => p.id === this.currentPlayer);
    const nextIndex = (currentIndex + 1) % 2;
    this.currentPlayer = this.players[nextIndex].id;
  }

  checkGameOver() {
    // Vérifier si un joueur n'a plus de pièces
    for (const player of this.players) {
      if (this.pieces[player.id].length === 0) {
        // L'autre joueur gagne
        const winner = this.players.find(p => p.id !== player.id);
        return { winner: winner.id };
      }
    }
    
    // Vérifier si le joueur actuel n'a aucun mouvement possible
    if (!this.hasValidMoves(this.currentPlayer)) {
      // L'autre joueur gagne
      const winner = this.players.find(p => p.id !== this.currentPlayer);
      return { winner: winner.id };
    }
    
    return null;
  }

  hasValidMoves(playerId) {
    const playerPieces = this.pieces[playerId];
    
    for (const piece of playerPieces) {
      const moves = this.getPossibleMoves(piece);
      if (moves.length > 0) {
        return true;
      }
    }
    
    return false;
  }

  getPossibleMoves(piece) {
    const moves = [];
    const [row, col] = piece.position;
    
    // Vérifier d'abord les captures (obligatoires)
    const captures = this.getPossibleCaptures(piece);
    if (captures.length > 0) {
      return captures;
    }
    
    // Si pas de captures, vérifier les mouvements simples
    const directions = piece.isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : this.getPlayerColor(piece.playerId) === 'white'
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (this.board[newRow][newCol] === null) {
          moves.push([newRow, newCol]);
        }
      }
    }
    
    return moves;
  }

  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
      delete this.pieces[playerId];
      
      // Si la partie était en cours, l'autre joueur gagne
      if (this.status === 'playing' && this.players.length === 1) {
        this.winner = this.players[0].id;
        this.status = 'finished';
      }
    }
  }

  getState() {
    return {
      id: this.id,
      board: this.board,
      players: this.players,
      pieces: this.pieces,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      status: this.status,
      captureChain: this.captureChain
    };
  }
}

export default CheckersGame;
