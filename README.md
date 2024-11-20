# Web-based Tetris Game

A modern implementation of the classic Tetris game built with Flask and JavaScript, featuring comprehensive achievement tracking, ghost piece trajectory, and various gameplay enhancements.

## Features

- **Core Tetris Gameplay**
  - Classic block-dropping mechanics
  - Ghost piece trajectory visualization
  - Dynamic speed adjustment system
  - Pastel color scheme for better visibility
  - Next piece preview

- **Achievement System**
  - Multiple achievement types
  - Real-time progress monitoring
  - Achievement notifications
  - Progress persistence
  - Unlockable achievements include:
    - Line Clearer: Clear your first line
    - Speed Demon: Reach level 5
    - Tetris Master: Score 10,000 points
    - Time Master: Stay alive for 5 minutes
    - Block Wizard: Place 1000 blocks
    - Speed Runner: Clear 10 lines under a minute
    - Perfect Clear: Clear the entire board
    - Line Warrior: Clear 50 lines total
    - Combo King: Clear 4 lines at once

- **Progress Saving**
  - Automatic score tracking
  - High score persistence
  - Achievement progress saving

- **Audio Feedback System**
  - Sound effects for:
    - Moving pieces
    - Rotating pieces
    - Dropping pieces
    - Line clears
    - Achievement unlocks
    - Game over

## Technologies Used

- **Backend**
  - Flask (Python web framework)
  - SQLAlchemy (Database ORM)
  - PostgreSQL (Database)

- **Frontend**
  - HTML5 Canvas
  - JavaScript (ES6+)
  - Bootstrap 5 (Styling)
  - Tone.js (Audio)

## Installation

1. Clone the repository on Replit
2. The project will automatically install required dependencies
3. Click the "Run" button to start the server

## Usage

1. Navigate to the game URL
2. Click "Start Game" to begin playing
3. Use the controls to move and rotate pieces
4. Track your progress in the Achievements page

## Controls

- **←/→**: Move piece left/right
- **↑**: Rotate piece
- **↓**: Soft drop
- **Space**: Hard drop
- **P**: Pause game

## Achievement System

The game features a comprehensive achievement system that tracks various milestones:

- Real-time progress tracking
- Visual progress bars
- Pop-up notifications
- Persistent achievement storage
- Multiple achievement categories

View your achievements by clicking the "Achievements" link in the navigation bar.

## Development Setup

1. Fork the project on Replit
2. The environment will automatically configure:
   - Python dependencies
   - PostgreSQL database
   - Required system packages
3. Development server runs on port 5000

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Tetris® game by Alexey Pajitnov
- Tone.js for audio synthesis
- Bootstrap for UI components
