class TicTacToe {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.isDraw = false;
  }

  // Make a move on the board
  makeMove(index) {
    if (this.board[index] || this.winner || this.isDraw) return false;

    this.board[index] = this.currentPlayer;
    this.checkWinner();
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  // Check for winner or draw
  checkWinner() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winner = this.board[a];
        return;
      }
    }

    // Check for draw
    if (this.board.every(cell => cell !== null)) {
      this.isDraw = true;
    }
  }

  // Get the current game state
  getGameState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      isDraw: this.isDraw
    };
  }

  // Reset the game
  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.isDraw = false;
  }

  // Minimax algorithm for AI
  getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'O'; // AI is 'O'
        let score = this.minimax(0, false);
        this.board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }

  // Minimax recursive function
  minimax(depth, isMaximizing) {
    const result = this.evaluateBoard();

    if (result !== null) {
      return result - depth; // Prefer faster wins/slower losses
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (this.board[i] === null) {
          this.board[i] = 'O';
          let score = this.minimax(depth + 1, false);
          this.board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (this.board[i] === null) {
          this.board[i] = 'X';
          let score = this.minimax(depth + 1, true);
          this.board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  // Evaluate the board for minimax
  evaluateBoard() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a] === 'O' ? 10 : -10; // AI wins: +10, Player wins: -10
      }
    }

    if (this.board.every(cell => cell !== null)) {
      return 0; // Draw
    }

    return null; // Game not finished
  }
}

module.exports = TicTacToe;
