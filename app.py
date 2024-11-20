import os
from flask import Flask, render_template, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager, current_user

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

@app.route('/achievements')
def achievements():
    if not current_user.is_authenticated:
        return render_template('achievements.html', achievements=[])
    achievements = Achievement.query.filter_by(user_id=current_user.id).all()
    return render_template('achievements.html', achievements=achievements)

with app.app_context():
    db.create_all()
