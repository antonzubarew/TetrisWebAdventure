import os
from flask import Flask, render_template, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager, current_user
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

from models import User, Achievement, GameProgress

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.route('/')
def index():
    return render_template('game.html')

@app.route('/save_progress', methods=['POST'])
def save_progress():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    progress = GameProgress.query.filter_by(user_id=current_user.id).first()
    
    if not progress:
        progress = GameProgress(user_id=current_user.id)
        db.session.add(progress)
    
    progress.score = data.get('score', 0)
    progress.level = data.get('level', 1)
    progress.lines_cleared = data.get('lines_cleared', 0)
    
    if current_user.high_score < progress.score:
        current_user.high_score = progress.score
    
    db.session.commit()
    return jsonify({'success': True})

@app.route('/unlock_achievement', methods=['POST'])
def unlock_achievement():
    data = request.get_json()
    achievement = Achievement.query.filter_by(name=data.get('name')).first()
    
    if not achievement:
        achievement = Achievement(
            name=data.get('name'),
            description=data.get('description'),
            progress=data.get('progress', 0),
            current_value=data.get('current_value', 0),
            target_value=data.get('target_value', 0),
            unlocked_at=datetime.utcnow() if data.get('progress', 0) >= 100 else None
        )
        db.session.add(achievement)
    else:
        achievement.progress = data.get('progress', achievement.progress)
        achievement.current_value = data.get('current_value', achievement.current_value)
        if achievement.progress >= 100 and not achievement.unlocked_at:
            achievement.unlocked_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'success': True})

@app.route('/achievements')
def achievements():
    # Create default achievements if they don't exist
    default_achievements = [
        {'name': 'Line Clearer', 'description': 'Clear your first line', 'target_value': 1},
        {'name': 'Speed Demon', 'description': 'Reach level 5', 'target_value': 5},
        {'name': 'Tetris Master', 'description': 'Score 10,000 points', 'target_value': 10000},
        {'name': 'Time Master', 'description': 'Stay alive for 5 minutes', 'target_value': 300},
        {'name': 'Block Wizard', 'description': 'Place 1000 blocks', 'target_value': 1000},
        {'name': 'Speed Runner', 'description': 'Clear 10 lines in under a minute', 'target_value': 10},
        {'name': 'Perfect Clear', 'description': 'Clear the entire board', 'target_value': 200},
        {'name': 'Line Warrior', 'description': 'Clear 50 lines total', 'target_value': 50},
        {'name': 'Combo King', 'description': 'Clear 4 lines at once', 'target_value': 4}
    ]
    
    achievements = Achievement.query.all()
    if not achievements:
        for ach in default_achievements:
            achievement = Achievement(
                name=ach['name'],
                description=ach['description'],
                target_value=ach['target_value'],
                progress=0
            )
            db.session.add(achievement)
        db.session.commit()
        achievements = Achievement.query.all()
    
    return render_template('achievements.html', achievements=achievements)

with app.app_context():
    db.create_all()
