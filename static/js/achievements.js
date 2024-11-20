class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.gameStartTime = null;
        this.lastLinesClearedTime = null;
        this.blocksPlaced = 0;
        this.linesInLastMinute = 0;

        this.achievements = {
            'first_clear': {
                name: 'Line Clearer',
                description: 'Clear your first line',
                condition: () => this.game.lines >= 1,
                progress: () => Math.min(100, (this.game.lines / 1) * 100),
                current: () => this.game.lines,
                target: 1,
                unlocked: false
            },
            'speed_demon': {
                name: 'Speed Demon',
                description: 'Reach level 5',
                condition: () => this.game.level >= 5,
                progress: () => Math.min(100, (this.game.level / 5) * 100),
                current: () => this.game.level,
                target: 5,
                unlocked: false
            },
            'tetris_master': {
                name: 'Tetris Master',
                description: 'Score 10,000 points',
                condition: () => this.game.score >= 10000,
                progress: () => Math.min(100, (this.game.score / 10000) * 100),
                current: () => this.game.score,
                target: 10000,
                unlocked: false
            },
            'time_master': {
                name: 'Time Master',
                description: 'Stay alive for 5 minutes',
                condition: () => this.gameStartTime && (Date.now() - this.gameStartTime) >= 300000,
                progress: () => this.gameStartTime ? Math.min(100, ((Date.now() - this.gameStartTime) / 300000) * 100) : 0,
                current: () => this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0,
                target: 300,
                unlocked: false
            },
            'block_wizard': {
                name: 'Block Wizard',
                description: 'Place 1000 blocks',
                condition: () => this.blocksPlaced >= 1000,
                progress: () => Math.min(100, (this.blocksPlaced / 1000) * 100),
                current: () => this.blocksPlaced,
                target: 1000,
                unlocked: false
            },
            'speed_runner': {
                name: 'Speed Runner',
                description: 'Clear 10 lines in under a minute',
                condition: () => this.linesInLastMinute >= 10,
                progress: () => Math.min(100, (this.linesInLastMinute / 10) * 100),
                current: () => this.linesInLastMinute,
                target: 10,
                unlocked: false
            },
            'perfect_clear': {
                name: 'Perfect Clear',
                description: 'Clear the entire board',
                condition: () => this.checkPerfectClear(),
                progress: () => this.calculateBoardClearPercentage(),
                current: () => Math.floor(this.calculateBoardClearPercentage() * this.game.rows / 100),
                target: this.game.rows,
                unlocked: false
            },
            'line_warrior': {
                name: 'Line Warrior',
                description: 'Clear 50 lines total',
                condition: () => this.game.lines >= 50,
                progress: () => Math.min(100, (this.game.lines / 50) * 100),
                current: () => this.game.lines,
                target: 50,
                unlocked: false
            },
            'combo_king': {
                name: 'Combo King',
                description: 'Clear 4 lines at once',
                condition: () => false,
                progress: () => this.game.lines >= 4 ? 100 : 0,
                current: () => this.game.lines >= 4 ? 4 : 0,
                target: 4,
                unlocked: false
            }
        };

        // Create achievement notification element
        this.notificationElement = document.createElement('div');
        this.notificationElement.className = 'achievement-notification';
        document.body.appendChild(this.notificationElement);

        // Initialize game start time
        this.initializeGame();
    }

    initializeGame() {
        this.gameStartTime = Date.now();
        this.lastLinesClearedTime = Date.now();
        this.blocksPlaced = 0;
        this.linesInLastMinute = 0;
    }

    checkPerfectClear() {
        return this.game.board.every(row => row.every(cell => cell === 0));
    }

    calculateBoardClearPercentage() {
        const totalCells = this.game.rows * this.game.cols;
        const filledCells = this.game.board.reduce((acc, row) => 
            acc + row.filter(cell => cell !== 0).length, 0);
        return ((totalCells - filledCells) / totalCells) * 100;
    }

    updateLinesClearedInLastMinute() {
        const now = Date.now();
        if (now - this.lastLinesClearedTime > 60000) {
            this.linesInLastMinute = 0;
            this.lastLinesClearedTime = now;
        }
    }

    incrementBlocksPlaced() {
        this.blocksPlaced++;
        this.checkAchievements();
    }

    checkAchievements() {
        this.updateLinesClearedInLastMinute();
        Object.entries(this.achievements).forEach(([id, achievement]) => {
            if (!achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(id);
            } else if (!achievement.unlocked) {
                // Update progress for incomplete achievements
                this.updateProgress(id);
            }
        });
    }

    updateProgress(achievementId) {
        const achievement = this.achievements[achievementId];
        const progress = achievement.progress();
        const current = achievement.current();
        const target = achievement.target;

        if (progress > 0 && progress < 100) {
            this.showProgressNotification(achievement, progress, current, target);
            this.saveAchievement(achievement);
        }
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        this.showUnlockNotification(achievement);
        this.saveAchievement(achievement);
        this.game.audio.playAchievementUnlock();
    }

    showUnlockNotification(achievement) {
        this.notificationElement.innerHTML = `
            <div class="achievement-content achievement-unlock">
                <h4>Achievement Unlocked!</h4>
                <p class="achievement-name">${achievement.name}</p>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-progress">
                    <div class="progress-bar" style="width: 100%"></div>
                </div>
                <p class="achievement-time">Just now</p>
            </div>
        `;
        this.notificationElement.classList.add('show');
        setTimeout(() => {
            this.notificationElement.classList.remove('show');
        }, 3000);
    }

    showProgressNotification(achievement, progress, current, target) {
        // Update the achievements page in real-time
        const achievementCard = document.querySelector(`[data-achievement="${achievement.name}"]`);
        if (achievementCard) {
            const progressBar = achievementCard.querySelector('.progress-bar');
            const progressText = achievementCard.querySelector('.achievement-progress-text');
            if (progressBar && progressText) {
                progressBar.style.width = `${progress}%`;
                progressBar.textContent = `${progress}%`;
                progressText.textContent = `Progress: ${current}/${target}`;
            }
        }

        // Show notification
        this.notificationElement.innerHTML = `
            <div class="achievement-content achievement-progress">
                <h4>Achievement Progress</h4>
                <p class="achievement-name">${achievement.name}</p>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <p class="achievement-status">${current}/${target}</p>
            </div>
        `;
        this.notificationElement.classList.add('show');
        setTimeout(() => {
            this.notificationElement.classList.remove('show');
        }, 2000);
    }

    saveAchievement(achievement) {
        fetch('/unlock_achievement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: achievement.name,
                description: achievement.description,
                progress: achievement.progress(),
                current_value: achievement.current(),
                target_value: achievement.target
            })
        });
    }

    triggerComboAchievement() {
        if (!this.achievements.combo_king.unlocked) {
            this.unlockAchievement('combo_king');
        }
    }
}
