class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = {
            'first_clear': {
                name: 'Line Clearer',
                description: 'Clear your first line',
                condition: () => this.game.lines >= 1,
                unlocked: false
            },
            'speed_demon': {
                name: 'Speed Demon',
                description: 'Reach level 5',
                condition: () => this.game.level >= 5,
                unlocked: false
            },
            'tetris_master': {
                name: 'Tetris Master',
                description: 'Score 10,000 points',
                condition: () => this.game.score >= 10000,
                unlocked: false
            },
            'line_warrior': {
                name: 'Line Warrior',
                description: 'Clear 50 lines total',
                condition: () => this.game.lines >= 50,
                unlocked: false
            },
            'combo_king': {
                name: 'Combo King',
                description: 'Clear 4 lines at once',
                condition: () => false, // Will be triggered by the game logic
                unlocked: false
            }
        };

        // Create achievement notification element
        this.notificationElement = document.createElement('div');
        this.notificationElement.className = 'achievement-notification';
        document.body.appendChild(this.notificationElement);
    }

    checkAchievements() {
        Object.entries(this.achievements).forEach(([id, achievement]) => {
            if (!achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(id);
            }
        });
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        this.showNotification(achievement);
        this.saveAchievement(achievement);
    }

    showNotification(achievement) {
        this.notificationElement.innerHTML = `
            <div class="achievement-content">
                <h4>Achievement Unlocked!</h4>
                <p>${achievement.name}</p>
                <p>${achievement.description}</p>
            </div>
        `;
        this.notificationElement.classList.add('show');
        setTimeout(() => {
            this.notificationElement.classList.remove('show');
        }, 3000);
    }

    saveAchievement(achievement) {
        fetch('/unlock_achievement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: achievement.name,
                description: achievement.description
            })
        });
    }

    triggerComboAchievement() {
        if (!this.achievements.combo_king.unlocked) {
            this.unlockAchievement('combo_king');
        }
    }
}
