from flask import render_template, request, jsonify, session, redirect, url_for, send_file, flash
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from app import app, db
from models import User, PDFFile, Download, Comment
import os
import uuid
from datetime import datetime, timedelta
import logging

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        logging.error(f"Error rendering index: {str(e)}")
        return f"Error loading page: {str(e)}", 500

@app.route('/login', methods=['POST'])
def login():
    try:
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'})
        
        # Check admin credentials
        if email == "ak763145918@gmail.com" and password == "76730":
            user = User.query.filter_by(email=email).first()
            if user:
                session['user_id'] = user.id
                session['is_admin'] = True
                return jsonify({'success': True, 'is_admin': True, 'user_email': email})
        
        # Check regular user credentials
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['is_admin'] = user.is_admin
            return jsonify({'success': True, 'is_admin': user.is_admin, 'user_email': email})
        
        # Create new user for any other credentials (as per demo requirement)
        if not user:
            user = User(email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            session['user_id'] = user.id
            session['is_admin'] = False
            return jsonify({'success': True, 'is_admin': False, 'user_email': email})
            
        return jsonify({'success': False, 'message': 'Invalid credentials'})
        
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed due to server error'})

@app.route('/logout', methods=['POST'])
def logout():
    try:
        session.clear()
        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Logout error: {str(e)}")
        return jsonify({'success': False, 'message': 'Logout failed'})

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        if not session.get('is_admin'):
            return jsonify({'success': False, 'message': 'Upload permission denied. Admin access required.'})
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file selected'})
        
        file = request.files['file']
        category = request.form.get('category', 'others')
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'})
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Only PDF files are allowed'})
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{original_filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Save to database
        pdf_file = PDFFile(
            filename=unique_filename,
            original_filename=original_filename,
            category=category,
            file_size=file_size,
            file_path=file_path,
            user_id=session['user_id']
        )
        db.session.add(pdf_file)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'File uploaded successfully'})
        
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'message': f'Upload failed: {str(e)}'})

@app.route('/files')
def list_files():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        category = request.args.get('category', '')
        search = request.args.get('search', '')
        
        query = PDFFile.query
        
        if category:
            query = query.filter(PDFFile.category == category)
        
        if search:
            query = query.filter(PDFFile.original_filename.contains(search))
        
        files = query.order_by(PDFFile.upload_date.desc()).all()
        
        files_data = []
        for file in files:
            files_data.append({
                'id': file.id,
                'filename': file.original_filename,
                'category': file.category,
                'size': file.file_size,
                'upload_date': file.upload_date.strftime('%Y-%m-%d %H:%M'),
                'download_count': file.download_count
            })
        
        return jsonify({'success': True, 'files': files_data})
        
    except Exception as e:
        logging.error(f"List files error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to load files: {str(e)}'})

@app.route('/download/<int:file_id>')
def download_file(file_id):
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        pdf_file = PDFFile.query.get_or_404(file_id)
        
        # Record download
        download = Download(
            user_id=session['user_id'],
            pdf_id=file_id,
            ip_address=request.remote_addr
        )
        db.session.add(download)
        
        # Increment download count
        pdf_file.download_count += 1
        db.session.commit()
        
        return send_file(pdf_file.file_path, as_attachment=True, download_name=pdf_file.original_filename)
        
    except Exception as e:
        logging.error(f"Download error: {str(e)}")
        return f"Download failed: {str(e)}", 500

@app.route('/preview/<int:file_id>')
def preview_file(file_id):
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        pdf_file = PDFFile.query.get_or_404(file_id)
        return send_file(pdf_file.file_path, mimetype='application/pdf')
        
    except Exception as e:
        logging.error(f"Preview error: {str(e)}")
        return f"Preview failed: {str(e)}", 500

@app.route('/delete/<int:file_id>', methods=['POST'])
def delete_file(file_id):
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        if not session.get('is_admin'):
            return jsonify({'success': False, 'message': 'Delete permission denied. Admin access required.'})
        
        pdf_file = PDFFile.query.get_or_404(file_id)
        
        # Delete file from filesystem
        if os.path.exists(pdf_file.file_path):
            os.remove(pdf_file.file_path)
        
        # Delete from database
        db.session.delete(pdf_file)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'File deleted successfully'})
        
    except Exception as e:
        logging.error(f"Delete error: {str(e)}")
        return jsonify({'success': False, 'message': f'Delete failed: {str(e)}'})

@app.route('/downloads')
def list_downloads():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        filter_type = request.args.get('filter', '')
        
        query = Download.query.filter_by(user_id=session['user_id'])
        
        if filter_type == 'today':
            today = datetime.now().date()
            query = query.filter(Download.download_date >= today)
        elif filter_type == 'week':
            week_ago = datetime.now() - timedelta(days=7)
            query = query.filter(Download.download_date >= week_ago)
        elif filter_type == 'month':
            month_ago = datetime.now() - timedelta(days=30)
            query = query.filter(Download.download_date >= month_ago)
        
        downloads = query.order_by(Download.download_date.desc()).all()
        
        downloads_data = []
        for download in downloads:
            downloads_data.append({
                'id': download.id,
                'filename': download.pdf_file.original_filename,
                'category': download.pdf_file.category,
                'download_date': download.download_date.strftime('%Y-%m-%d %H:%M'),
                'file_id': download.pdf_id
            })
        
        return jsonify({'success': True, 'downloads': downloads_data})
        
    except Exception as e:
        logging.error(f"List downloads error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to load downloads: {str(e)}'})

@app.route('/clear_downloads', methods=['POST'])
def clear_downloads():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        Download.query.filter_by(user_id=session['user_id']).delete()
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Download history cleared'})
        
    except Exception as e:
        logging.error(f"Clear downloads error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to clear downloads: {str(e)}'})

@app.route('/comments', methods=['GET', 'POST'])
def handle_comments():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        if request.method == 'POST':
            # Submit comment
            text = request.form.get('text', '').strip()
            category = request.form.get('category', 'general')
            
            if not text:
                return jsonify({'success': False, 'message': 'Comment text is required'})
            
            comment = Comment(
                user_id=session['user_id'],
                text=text,
                category=category
            )
            db.session.add(comment)
            db.session.commit()
            
            return jsonify({'success': True, 'message': 'Feedback submitted successfully'})
        
        else:
            # Get comments
            if session.get('is_admin'):
                comments = Comment.query.order_by(Comment.created_at.desc()).all()
            else:
                comments = Comment.query.filter_by(user_id=session['user_id']).order_by(Comment.created_at.desc()).all()
            
            comments_data = []
            for comment in comments:
                comments_data.append({
                    'id': comment.id,
                    'user_email': comment.user.email,
                    'text': comment.text,
                    'category': comment.category,
                    'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M'),
                    'is_resolved': comment.is_resolved,
                    'admin_reply': comment.admin_reply
                })
            
            return jsonify({'success': True, 'comments': comments_data})
            
    except Exception as e:
        logging.error(f"Comments error: {str(e)}")
        return jsonify({'success': False, 'message': f'Comments operation failed: {str(e)}'})

@app.route('/storage_info')
def storage_info():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Please login first'})
        
        total_size = db.session.query(db.func.sum(PDFFile.file_size)).scalar() or 0
        total_files = PDFFile.query.count()
        
        # Convert bytes to MB
        total_size_mb = total_size / (1024 * 1024)
        
        return jsonify({
            'success': True,
            'total_size_mb': round(total_size_mb, 2),
            'total_files': total_files
        })
        
    except Exception as e:
        logging.error(f"Storage info error: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to get storage info: {str(e)}'})

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logging.error(f"Internal server error: {str(error)}")
    return f"Internal server error: {str(error)}", 500
