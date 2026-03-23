from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, and_
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import traceback
import os

app = Flask(__name__, template_folder='templates1', static_folder='static1')

# Enable CORS for frontend API calls
CORS(app)

# Security & Watu County Database Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'watu-county-secure-2026')

# Determine database URI based on environment
basedir = os.path.abspath(os.path.dirname(__file__))

# Use environment variable for database, with fallback to local SQLite
if os.environ.get('DATABASE_URL'):
    # For Render.com deployment
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL').replace("postgres://", "postgresql://", 1)
elif os.environ.get('REPLIT_DB_URL'):
    # For Replit deployment
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('REPLIT_DB_URL')
else:
    # For local development and Vercel
    # We use an absolute path to ensure the app finds 'watu_election.db'
    db_path = os.path.join(basedir, 'watu_election.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Error handler for all exceptions
@app.errorhandler(Exception)
def handle_error(error):
    """Handle all errors and return JSON"""
    print(f"Error: {str(error)}")
    traceback.print_exc()
    return jsonify({"status": "error", "message": f"Server error: {str(error)}"}), 500

# --- DATABASE MODELS ---

class Voter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    voter_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    constituency = db.Column(db.String(100), nullable=False)
    ward = db.Column(db.String(100), nullable=False)
    has_voted = db.Column(db.Boolean, default=False)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)

class Ward(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    constituency = db.Column(db.String(50), nullable=False)
    registered_voters = db.Column(db.Integer, default=0)

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False) # Governor, Senator, MP, MCA
    constituency = db.Column(db.String(100), nullable=True)
    ward = db.Column(db.String(100), nullable=True)
    party = db.Column(db.String(100), nullable=True)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    voter_id = db.Column(db.String(50), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    constituency = db.Column(db.String(50), nullable=False)
    ward = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('voter_id', 'position', 'constituency', name='unique_vote_per_position'),)

# --- ROUTES ---

@app.route('/')
def home():
    return render_template('index1.html')

@app.route('/register', methods=['POST'])
def register_voter():
    """Register a new voter"""
    try:
        data = request.get_json() if request.is_json else {}
        
        print(f"Registration attempt with data: {data}")
        
        # Validation
        if not all([data.get('voter_id'), data.get('name'), data.get('email'), data.get('constituency')]):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400
        
        # Check if voter already exists
        existing_voter = Voter.query.filter_by(voter_id=data.get('voter_id')).first()
        if existing_voter:
            return jsonify({"status": "error", "message": "Voter ID already registered"}), 400
        
        new_voter = Voter(
            voter_id=data.get('voter_id'),
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            constituency=data.get('constituency'),
            ward=data.get('ward', 'General')
        )
        
        db.session.add(new_voter)
        db.session.commit()
        return jsonify({"status": "success", "message": f"Voter {data.get('name')} registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/verify_voter/<voter_id>', methods=['GET'])
def verify_voter(voter_id):
    """Check if voter is registered and hasn't voted yet"""
    voter = Voter.query.filter_by(voter_id=voter_id).first()
    
    if not voter:
        return jsonify({"status": "not_found", "message": "Voter ID not found"}), 404
    
    return jsonify({
        "status": "found",
        "voter_id": voter.voter_id,
        "name": voter.name,
        "email": voter.email,
        "phone": voter.phone,
        "constituency": voter.constituency,
        "ward": voter.ward,
        "has_voted": voter.has_voted,
        "registration_date": voter.registration_date.isoformat()
    }), 200

@app.route('/submit_vote', methods=['POST'])
def submit_vote():
    data = request.json
    voter_id = data.get('voter_id')
    candidate_id = data.get('candidate_id')
    position = data.get('position')
    
    # Validate voter
    voter = Voter.query.filter_by(voter_id=voter_id).first()
    if not voter:
        return jsonify({"status": "error", "message": "Voter not registered"}), 400
    
    # Validate candidate
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({"status": "error", "message": "Candidate not found"}), 400
    
    # Check if voter already voted for this position
    existing_vote = Vote.query.filter_by(
        voter_id=voter_id, 
        position=position, 
        constituency=voter.constituency
    ).first()
    
    if existing_vote:
        return jsonify({"status": "error", "message": f"You have already voted for {position}!"}), 403
    
    try:
        new_vote = Vote(
            voter_id=voter_id,
            candidate_id=candidate_id,
            position=position,
            constituency=voter.constituency,
            ward=voter.ward
        )
        
        db.session.add(new_vote)
        
        # Mark voter as voted (if this is their first vote)
        if not voter.has_voted:
            voter.has_voted = True
        
        db.session.commit()
        
        return jsonify({"status": "success", "message": f"Vote for {position} recorded successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/results', methods=['GET'])
def results():
    """Get election results filtered by position and optional constituency"""
    position = request.args.get('position')
    constituency = request.args.get('constituency')
    
    if not position:
        return jsonify({"status": "error", "message": "Position parameter required"}), 400
    
    # Query candidates for the position
    query = Candidate.query.filter_by(position=position)
    if constituency:
        query = query.filter_by(constituency=constituency)
    
    candidates = query.all()
    results_list = []
    
    for candidate in candidates:
        vote_query = Vote.query.filter_by(candidate_id=candidate.id)
        
        if constituency:
            vote_query = vote_query.filter_by(constituency=constituency)
        
        vote_count = vote_query.count()
        results_list.append({
            "candidate_id": candidate.id,
            "name": candidate.name,
            "party": candidate.party,
            "position": candidate.position,
            "constituency": candidate.constituency,
            "votes": vote_count
        })
    
    # Sort by votes (descending)
    ranked_data = sorted(results_list, key=lambda x: x['votes'], reverse=True)
    
    return jsonify({
        "status": "success",
        "position": position,
        "constituency": constituency or "All",
        "results": ranked_data
    }), 200

@app.route('/results_summary', methods=['GET'])
def results_summary():
    """Get comprehensive election summary"""
    total_votes = Vote.query.count()
    total_registered = Voter.query.count()
    
    # Count unique voters who have voted
    unique_voters_voted = db.session.query(func.count(func.distinct(Vote.voter_id))).scalar() or 0
    votes_cast = max(unique_voters_voted, Voter.query.filter_by(has_voted=True).count())
    
    # Ensure votes_cast doesn't exceed registered voters
    votes_cast = min(votes_cast, total_registered)
    
    # Get top candidates by position
    summary = {}
    positions = db.session.query(Candidate.position).distinct().all()
    
    for pos_tuple in positions:
        position = pos_tuple[0]
        top_candidate = db.session.query(
            Candidate,
            func.count(Vote.id).label('vote_count')
        ).outerjoin(Vote, Candidate.id == Vote.candidate_id).filter(
            Candidate.position == position
        ).group_by(Candidate.id).order_by(
            func.count(Vote.id).desc()
        ).first()
        
        if top_candidate:
            summary[position] = {
                "leading": top_candidate[0].name,
                "party": top_candidate[0].party,
                "votes": top_candidate[1] or 0
            }
    
    return jsonify({
        "status": "success",
        "total_registered_voters": total_registered,
        "votes_cast": votes_cast,
        "voter_turnout": f"{(votes_cast/total_registered*100):.2f}%" if total_registered > 0 else "0%",
        "total_votes": total_votes,
        "leading_candidates": summary
    }), 200

# --- ADMIN ACCESS & SECURITY ---

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == 'KrIstii02$$':
            session['logged_in'] = True
            session['login_time'] = datetime.utcnow().isoformat()
            return redirect(url_for('admin'))
        else:
            return render_template('login1.html', error="Access Denied: Incorrect Password")
    return render_template('login1.html')

@app.route('/admin')
def admin():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('admin1.html')

@app.route('/candidates', methods=['GET'])
def get_candidates():
    """Public endpoint to get all candidates (no authentication required)"""
    candidates = Candidate.query.all()
    return jsonify({
        "status": "success",
        "candidates": [{
            "id": c.id,
            "name": c.name,
            "position": c.position,
            "party": c.party,
            "constituency": c.constituency
        } for c in candidates]
    }), 200

@app.route('/admin/candidates', methods=['GET', 'POST'])
def manage_candidates():
    """Add or retrieve candidates (admin only)"""
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    
    if request.method == 'POST':
        data = request.json
        
        candidate = Candidate(
            name=data.get('name'),
            position=data.get('position'),
            party=data.get('party'),
            constituency=data.get('constituency'),
            ward=data.get('ward')
        )
        
        try:
            db.session.add(candidate)
            db.session.commit()
            return jsonify({"status": "success", "message": "Candidate added", "candidate_id": candidate.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "error", "message": str(e)}), 400
    
    # GET - retrieve all candidates
    candidates = Candidate.query.all()
    return jsonify({
        "status": "success",
        "candidates": [{
            "id": c.id,
            "name": c.name,
            "position": c.position,
            "party": c.party,
            "constituency": c.constituency
        } for c in candidates]
    }), 200

@app.route('/admin/candidates/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """Delete a candidate (admin only)"""
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({"status": "error", "message": "Candidate not found"}), 404
    
    try:
        # Delete associated votes
        Vote.query.filter_by(candidate_id=candidate_id).delete()
        
        # Delete the candidate
        db.session.delete(candidate)
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Candidate deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/admin/stats', methods=['GET'])
def admin_stats():
    """Get detailed admin statistics"""
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    
    total_candidates = Candidate.query.count()
    total_registered = Voter.query.count()
    votes_cast = Vote.query.count()
    
    # Votes by position
    votes_by_position = db.session.query(
        Candidate.position,
        func.count(Vote.id).label('votes')
    ).outerjoin(Vote, Candidate.id == Vote.candidate_id).group_by(
        Candidate.position
    ).all()
    
    # Votes by constituency
    votes_by_constituency = db.session.query(
        Ward.constituency,
        func.count(Vote.id).label('votes')
    ).outerjoin(Vote, Ward.name == Vote.ward).group_by(
        Ward.constituency
    ).all()
    
    return jsonify({
        "status": "success",
        "total_candidates": total_candidates,
        "total_registered_voters": total_registered,
        "total_votes_cast": votes_cast,
        "votes_by_position": [{"position": p[0], "votes": p[1]} for p in votes_by_position],
        "votes_by_constituency": [{"constituency": c[0], "votes": c[1]} for c in votes_by_constituency]
    }), 200

@app.route('/admin/audit_log', methods=['GET'])
def audit_log():
    """Get voting audit log"""
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    
    votes = Vote.query.order_by(Vote.timestamp.desc()).limit(100).all()
    
    return jsonify({
        "status": "success",
        "audit_log": [{
            "voter_id": v.voter_id,
            "candidate_id": v.candidate_id,
            "timestamp": v.timestamp.isoformat(),
            "constituency": v.constituency,
            "ward": v.ward
        } for v in votes]
    }), 200

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('login_time', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    with app.app_context():
        with app.app_context():
          try:
            db.create_all()
          except Exception as e:
            print(f"Database setup skipped or failed: {e}")
        
        # Optional: Seed sample data
        if Candidate.query.count() == 0:
            sample_candidates = [
                Candidate(name="John Muthoni", position="Governor", party="UDA", constituency="Watu"),
                Candidate(name="Sarah Kimani", position="Governor", party="ODM", constituency="Watu"),
                Candidate(name="David Kiprop", position="Governor", party="KANU", constituency="Watu"),
                Candidate(name="Peter Kipchoge", position="Senator", party="UDA", constituency="Watu"),
                Candidate(name="Grace Omondi", position="Senator", party="ODM", constituency="Watu"),
                Candidate(name="Martha Njeri", position="Senator", party="KANU", constituency="Watu"),
                Candidate(name="James Muiruri", position="MP", party="UDA", constituency="Watu"),
                Candidate(name="Rebecca Ochieng", position="MP", party="ODM", constituency="Watu"),
                Candidate(name="Paul Kiplagat", position="MP", party="KANU", constituency="Watu"),
                Candidate(name="Samuel Kipchoge", position="MCA", party="UDA", constituency="Watu"),
                Candidate(name="Alice Moraa", position="MCA", party="ODM", constituency="Watu"),
                Candidate(name="Charles Lesuuda", position="MCA", party="KANU", constituency="Watu"),
            ]
            for candidate in sample_candidates:
                db.session.add(candidate)
            db.session.commit()
            print("Sample candidates added successfully")
    
    print("Election System Backend is running...")
    
    # Determine port - Replit uses PORT environment variable
    port = int(os.environ.get('PORT', 5000))
    
    # For Replit, use 0.0.0.0 to listen on all interfaces
    app.run(debug=False, host='0.0.0.0', port=port, threaded=True)


