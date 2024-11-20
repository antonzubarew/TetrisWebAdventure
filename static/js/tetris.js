class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        
        this.canvas.width = this.blockSize * this.cols;
        this.canvas.height = this.blockSize * this.rows;
        this.nextCanvas.width = this.blockSize * 4;
        this.nextCanvas.height = this.blockSize * 4;
        
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.audio = new TetrisAudio();
        this.audio.init();
        
        this.pieces = [
            [[1,1,1,1]], // I
            [[1,1,1],[0,1,0]], // T
            [[1,1,1],[1,0,0]], // L
            [[1,1,1],[0,0,1]], // J
            [[1,1],[1,1]], // O
            [[1,1,0],[0,1,1]], // S
            [[0,1,1],[1,1,0]]  // Z
        ];
        
        this.colors = [
            '#FF0D72', '#0DC2FF', '#0DFF72',
            '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
        ];
        
        this.bindControls();
        this.initGame();
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.paused) return;
            
            switch(e.keyCode) {
                case 37: // Left
                    this.moveCurrentPiece(-1, 0);
                    this.audio.playMove();
                    break;
                case 39: // Right
                    this.moveCurrentPiece(1, 0);
                    this.audio.playMove();
                    break;
                case 40: // Down
                    this.moveCurrentPiece(0, 1);
                    this.score += 1;
                    this.updateScore();
                    break;
                case 38: // Up (Rotate)
                    this.rotateCurrentPiece();
                    this.audio.playRotate();
                    break;
                case 32: // Space (Hard Drop)
                    e.preventDefault();
                    this.hardDrop();
                    break;
                case 80: // P (Pause)
                    this.togglePause();
                    break;
            }
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.initGame();
        });

        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
    }

    initGame() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.updateScore();
        this.spawnPiece();
        this.gameLoop();
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.getRandomPiece();
        }
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        this.currentPiece.x = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        
        if (this.checkCollision()) {
            this.gameOver = true;
            this.audio.playGameOver();
            this.saveProgress();
        }
        
        this.drawNextPiece();
    }

    getRandomPiece() {
        const index = Math.floor(Math.random() * this.pieces.length);
        return {
            shape: this.pieces[index],
            color: this.colors[index],
            x: 0,
            y: 0
        };
    }

    moveCurrentPiece(dx, dy) {
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            
            if (dy > 0) {
                this.freezePiece();
                this.clearLines();
                this.spawnPiece();
            }
            return false;
        }
        return true;
    }

    rotateCurrentPiece() {
        const original = this.currentPiece.shape;
        const rotated = original[0].map((_, i) => 
            original.map(row => row[i]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
    }

    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardX < 0 || boardX >= this.cols || 
                        boardY >= this.rows ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    freezePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        this.audio.playDrop();
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateScore();
            this.audio.playClear();
        }
    }

    hardDrop() {
        while (this.moveCurrentPiece(0, 1)) {}
        this.audio.playDrop();
    }

    togglePause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.gameLoop();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize - 1,
            this.blockSize - 1
        );
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const offsetX = (4 - this.nextPiece.shape[0].length) / 2;
            const offsetY = (4 - this.nextPiece.shape.length) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(
                            (offsetX + x) * this.blockSize,
                            (offsetY + y) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    saveProgress() {
        fetch('/save_progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: this.score,
                level: this.level,
                lines_cleared: this.lines
            })
        });
    }

    gameLoop() {
        if (!this.gameOver && !this.paused) {
            this.draw();
            this.moveCurrentPiece(0, 1);
            setTimeout(() => this.gameLoop(), 800 / (this.level * 0.5 + 1));
        } else if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    const game = new Tetris();
};