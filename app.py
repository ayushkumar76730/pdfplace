import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
import logging

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///pdfplace.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Configure upload settings
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# initialize the app with the extension
db.init_app(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

with app.app_context():
    # Import models and routes
    import models
    import routes
    
    # Create all database tables
    db.create_all()
    
    # Create admin user if it doesn't exist
    from werkzeug.security import generate_password_hash
    admin_email = "ak763145918@gmail.com"
    admin_user = models.User.query.filter_by(email=admin_email).first()
    if not admin_user:
        admin_user = models.User(
            email=admin_email,
            password_hash=generate_password_hash("76730"),
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()
        logging.info("Admin user created")
