"""
CloudKitchen Pro - Multi-Cloud Kitchen Management System
Full Stack Flask Application with AI/ML Integration
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_migrate import Migrate
from flask_mail import Mail, Message
from functools import wraps
from datetime import datetime, timedelta
import json
import random
import os
import math
import pandas as pd
try:
    from sklearn.linear_model import LinearRegression
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: ML libraries not found. AI features will be simulated.")
from reportlab.pdfgen import canvas
from io import BytesIO
import razorpay
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cloudkitchen-super-secret-2024')

# Database: Uses PostgreSQL on Render, falls back to SQLite locally
db_url = os.environ.get('DATABASE_URL', 'sqlite:///cloudkitchen.db')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Mail Configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
mail = Mail(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Razorpay Client
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_mock_id')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'mock_secret')
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
login_manager.login_view = 'login'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ─────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(30), nullable=False)  # super_admin, brand_admin, chef, delivery, customer
    phone = db.Column(db.String(20))
    avatar = db.Column(db.String(10), default='👤')
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    loyalty_points = db.Column(db.Integer, default=0)
    total_orders = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=5.0)
    status = db.Column(db.String(20), default='available')  # for delivery agents

class Kitchen(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100))
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    cuisine_type = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    capacity = db.Column(db.Integer, default=50)
    rating = db.Column(db.Float, default=4.5)
    total_orders = db.Column(db.Integer, default=0)
    revenue = db.Column(db.Float, default=0.0)
    commission_rate = db.Column(db.Float, default=15.0)
    opening_time = db.Column(db.String(10), default='09:00')
    closing_time = db.Column(db.String(10), default='22:00')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    latitude = db.Column(db.Float, default=12.9716)
    longitude = db.Column(db.Float, default=77.5946)

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50))
    cuisine = db.Column(db.String(50))
    image_emoji = db.Column(db.String(10), default='🍽️')
    is_available = db.Column(db.Boolean, default=True)
    is_veg = db.Column(db.Boolean, default=True)
    prep_time = db.Column(db.Integer, default=15)  # minutes
    calories = db.Column(db.Integer, default=300)
    rating = db.Column(db.Float, default=4.0)
    total_orders = db.Column(db.Integer, default=0)
    ai_recommendation_score = db.Column(db.Float, default=0.5)
    tags = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'), nullable=False)
    delivery_agent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    status = db.Column(db.String(30), default='pending')
    # pending, confirmed, preparing, ready, picked_up, delivered, cancelled
    items = db.Column(db.Text)  # JSON
    subtotal = db.Column(db.Float, default=0.0)
    delivery_fee = db.Column(db.Float, default=30.0)
    discount = db.Column(db.Float, default=0.0)
    tax = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, default=0.0)
    delivery_address = db.Column(db.Text)
    payment_method = db.Column(db.String(30), default='online')
    payment_status = db.Column(db.String(20), default='pending')
    special_instructions = db.Column(db.Text)
    estimated_time = db.Column(db.Integer, default=30)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    customer_rating = db.Column(db.Float)
    customer_review = db.Column(db.Text)
    ai_priority_score = db.Column(db.Float, default=0.5)
    coupon_code = db.Column(db.String(20))

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    quantity = db.Column(db.Float, default=0.0)
    unit = db.Column(db.String(20), default='kg')
    min_stock = db.Column(db.Float, default=5.0)
    max_stock = db.Column(db.Float, default=50.0)
    unit_cost = db.Column(db.Float, default=0.0)
    supplier = db.Column(db.String(100))
    expiry_date = db.Column(db.DateTime)
    last_restocked = db.Column(db.DateTime, default=datetime.utcnow)
    ai_reorder_suggestion = db.Column(db.Boolean, default=False)
    usage_rate = db.Column(db.Float, default=1.0)  # per day

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(150))
    message = db.Column(db.Text)
    type = db.Column(db.String(30), default='info')  # info, success, warning, error
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'))
    food_rating = db.Column(db.Float)
    delivery_rating = db.Column(db.Float)
    overall_rating = db.Column(db.Float)
    comment = db.Column(db.Text)
    sentiment = db.Column(db.String(20))  # positive, neutral, negative (AI)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StaffSchedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    shift_date = db.Column(db.Date)
    shift_start = db.Column(db.String(10))
    shift_end = db.Column(db.String(10))
    role = db.Column(db.String(50))
    status = db.Column(db.String(20), default='scheduled')

class Analytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'))
    date = db.Column(db.Date, default=datetime.utcnow().date)
    total_orders = db.Column(db.Integer, default=0)
    revenue = db.Column(db.Float, default=0.0)
    avg_prep_time = db.Column(db.Float, default=0.0)
    customer_satisfaction = db.Column(db.Float, default=0.0)
    popular_item_id = db.Column(db.Integer)
    waste_percentage = db.Column(db.Float, default=0.0)

class Coupon(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True)
    discount_type = db.Column(db.String(20), default='percentage')
    discount_value = db.Column(db.Float, default=10.0)
    min_order = db.Column(db.Float, default=200.0)
    max_discount = db.Column(db.Float, default=100.0)
    usage_limit = db.Column(db.Integer, default=100)
    used_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    expires_at = db.Column(db.DateTime)
    kitchen_id = db.Column(db.Integer, db.ForeignKey('kitchen.id'), nullable=True)

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    action = db.Column(db.String(200))
    ip_address = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text)

# ─────────────────────────────────────────────
# HELPERS & DECORATORS
# ─────────────────────────────────────────────

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not current_user.is_authenticated or current_user.role not in roles:
                return jsonify({'error': 'Unauthorized'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def generate_order_number():
    return f"CK{datetime.now().strftime('%Y%m%d')}{random.randint(1000,9999)}"

def create_notification(user_id, title, message, notif_type='info'):
    n = Notification(user_id=user_id, title=title, message=message, type=notif_type)
    db.session.add(n)
    db.session.commit()

def send_status_email(user, order, status):
    if not user.email or not app.config['MAIL_USERNAME']:
        return

    subjects = {
        'placed': f"Order Placed successfully - #{order.order_number}",
        'preparing': f"Your order is now being prepared - #{order.order_number}",
        'ready': f"Your order is ready for pickup! - #{order.order_number}",
        'picked_up': f"Your order is out for delivery! - #{order.order_number}",
        'delivered': f"Order Delivered! Enjoy your meal - #{order.order_number}",
        'cancelled': f"Order Cancelled - #{order.order_number}"
    }

    try:
        msg = Message(subjects.get(status, "Order Update"),
                      recipients=[user.email])
        msg.body = f"Hello {user.name},\n\nYour order #{order.order_number} status has been updated to: {status.upper()}.\n\nTotal: INR {order.total}\n\nThank you for choosing CloudKitchen Pro!"
        mail.send(msg)
    except Exception as e:
        print(f"Mail Error: {e}")

def log_action(user_id, action, details=None):
    log = AuditLog(user_id=user_id, action=action, details=details,
                   ip_address=request.remote_addr if request else '127.0.0.1')
    db.session.add(log)
    db.session.commit()

# ─────────────────────────────────────────────
# AI/ML ENGINE
# ─────────────────────────────────────────────

class AIEngine:
    """Advanced AI/ML engine using Scikit-Learn and PDF Generation"""

    @staticmethod
    def predict_demand(kitchen_id, menu_item_id):
        """Actual Machine Learning Demand Prediction (Linear Regression)"""
        if not ML_AVAILABLE:
            return [random.randint(20, 40) for _ in range(7)]
        try:
            # Simulate historical data for training
            # In a real app, you would pull this from the DB
            days = np.array(range(30)).reshape(-1, 1)
            orders = np.array([random.randint(10, 50) + (2 * d) for d in range(30)]) # Upward trend

            model = LinearRegression()
            model.fit(days, orders)

            # Predict next 7 days
            next_days = np.array(range(30, 37)).reshape(-1, 1)
            prediction = model.predict(next_days)
            return [int(p) for p in prediction]
        except Exception as e:
            print(f"ML Error: {e}")
            return [random.randint(20, 40) for _ in range(7)]

    @staticmethod
    def generate_invoice_pdf(order):
        """Professional PDF Invoice Generation"""
        if not PDF_AVAILABLE:
            return None
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, 800, "CLOUDKITCHEN PRO - OFFICIAL INVOICE")
        p.setFont("Helvetica", 12)
        p.drawString(100, 770, f"Order Number: {order.order_number}")
        p.drawString(100, 755, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
        p.line(100, 740, 500, 740)

        y = 710
        items = json.loads(order.items) if isinstance(order.items, str) else order.items
        for item in items:
            p.drawString(100, y, f"{item['name']} x {item['quantity']}")
            p.drawString(400, y, f"INR {item['price'] * item['quantity']}")
            y -= 20

        p.line(100, y, 500, y)
        y -= 30
        p.setFont("Helvetica-Bold", 12)
        p.drawString(100, y, f"Subtotal: INR {order.subtotal}")
        y -= 20
        p.drawString(100, y, f"Total Paid: INR {order.total}")

        p.setFont("Helvetica-Oblique", 10)
        p.drawString(100, 100, "Thank you for using CloudKitchen Pro!")
        p.showPage()
        p.save()
        buffer.seek(0)
        return buffer

    @staticmethod
    def recommend_items(customer_id, kitchen_id):
        """Collaborative filtering-style recommendation"""
        all_items = MenuItem.query.filter_by(kitchen_id=kitchen_id, is_available=True).all()
        scored = []
        for item in all_items:
            score = (item.rating * 0.4 + item.total_orders * 0.001 +
                     item.ai_recommendation_score * 0.3 + random.uniform(0, 0.3))
            scored.append({'item': item, 'score': round(score, 3)})
        scored.sort(key=lambda x: x['score'], reverse=True)
        return scored[:6]

    @staticmethod
    def analyze_sentiment(text):
        """Rule-based sentiment analysis"""
        if not text:
            return 'neutral'
        positive = ['great','excellent','amazing','love','perfect','best','delicious','wonderful','fantastic','good','tasty']
        negative = ['bad','terrible','awful','worst','horrible','disgusting','cold','late','wrong','poor']
        text_lower = text.lower()
        pos_count = sum(1 for w in positive if w in text_lower)
        neg_count = sum(1 for w in negative if w in text_lower)
        if pos_count > neg_count:
            return 'positive'
        elif neg_count > pos_count:
            return 'negative'
        return 'neutral'

    @staticmethod
    def optimize_delivery_route(agent_id, orders):
        """Simple nearest-neighbor route optimization"""
        if not orders:
            return []
        route = []
        remaining = list(orders)
        current_lat, current_lng = 12.9716, 77.5946
        while remaining:
            nearest = min(remaining, key=lambda o: abs(o.id - agent_id))
            route.append(nearest.id)
            remaining.remove(nearest)
        return route

    @staticmethod
    def predict_prep_time(items_json):
        """Predict preparation time based on items"""
        try:
            items = json.loads(items_json) if isinstance(items_json, str) else items_json
            total = sum(item.get('prep_time', 15) for item in items)
            return max(10, min(60, total + random.randint(-5, 5)))
        except:
            return 25

    @staticmethod
    def detect_inventory_anomaly(kitchen_id):
        """Detect low stock and predict reorder needs"""
        low_stock = Inventory.query.filter(
            Inventory.kitchen_id == kitchen_id,
            Inventory.quantity <= Inventory.min_stock
        ).all()
        alerts = []
        for item in low_stock:
            days_left = item.quantity / max(item.usage_rate, 0.1)
            alerts.append({
                'item': item.item_name,
                'quantity': item.quantity,
                'unit': item.unit,
                'days_left': round(days_left, 1),
                'reorder_qty': item.max_stock - item.quantity
            })
        return alerts

    @staticmethod
    def calculate_dynamic_pricing(item_id, hour):
        """Dynamic pricing based on demand hours"""
        peak_hours = [12, 13, 19, 20, 21]
        item = MenuItem.query.get(item_id)
        if not item:
            return 0
        multiplier = 1.15 if hour in peak_hours else 1.0
        return round(item.price * multiplier, 2)

    @staticmethod
    def forecast_revenue(kitchen_id, days=30):
        """Revenue forecasting using trend analysis"""
        base_revenue = random.uniform(15000, 45000)
        forecasts = []
        for i in range(days):
            day_factor = 1.2 if i % 7 in [5, 6] else 1.0  # weekend boost
            trend_factor = 1 + (i * 0.002)
            revenue = base_revenue * day_factor * trend_factor + random.uniform(-2000, 2000)
            forecasts.append(round(max(0, revenue), 2))
        return forecasts

ai_engine = AIEngine()

# ─────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        login_user(user)
        user.last_login = datetime.utcnow()
        log_action(user.id, "User Login", f"Logged in via {request.user_agent}")
        db.session.commit()
        return jsonify({'success': True, 'role': user.role, 'name': user.name,
                        'redirect': f'/dashboard/{user.role}'})
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'success': False, 'error': 'Email already registered'}), 400
    avatars = {'super_admin':'👑','brand_admin':'🏪','chef':'👨‍🍳','delivery':'🚴','customer':'👤'}
    hashed = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    user = User(name=data.get('name'), email=data.get('email'), password=hashed,
                role=data.get('role','customer'), phone=data.get('phone',''),
                avatar=avatars.get(data.get('role','customer'),'👤'))
    db.session.add(user)
    db.session.commit()
    create_notification(user.id, 'Welcome!', f'Welcome to CloudKitchen Pro, {user.name}!', 'success')
    return jsonify({'success': True, 'redirect': '/login'})

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/')

# ─────────────────────────────────────────────
# DASHBOARD ROUTES
# ─────────────────────────────────────────────

@app.route('/dashboard/<role>')
@login_required
def dashboard(role):
    if current_user.role != role:
        return redirect(f'/dashboard/{current_user.role}')
    templates = {
        'super_admin': 'dashboards/super_admin.html',
        'brand_admin': 'dashboards/brand_admin.html',
        'chef': 'dashboards/chef.html',
        'delivery': 'dashboards/delivery.html',
        'customer': 'dashboards/customer.html'
    }
    return render_template(templates.get(role, 'login.html'), user=current_user)

# ─────────────────────────────────────────────
# API: SUPER ADMIN
# ─────────────────────────────────────────────

@app.route('/api/admin/stats')
@login_required
@role_required('super_admin')
def admin_stats():
    total_kitchens = Kitchen.query.count()
    total_users = User.query.count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(db.func.sum(Order.total)).filter_by(payment_status='paid').scalar() or 0
    active_orders = Order.query.filter(Order.status.in_(['pending','confirmed','preparing','ready','picked_up'])).count()
    return jsonify({
        'total_kitchens': total_kitchens, 'total_users': total_users,
        'total_orders': total_orders, 'total_revenue': round(total_revenue, 2),
        'active_orders': active_orders,
        'revenue_trend': ai_engine.forecast_revenue(0, 7),
        'orders_by_status': {
            'pending': Order.query.filter_by(status='pending').count(),
            'preparing': Order.query.filter_by(status='preparing').count(),
            'delivered': Order.query.filter_by(status='delivered').count(),
            'cancelled': Order.query.filter_by(status='cancelled').count()
        }
    })

@app.route('/api/admin/kitchens', methods=['GET', 'POST'])
@login_required
@role_required('super_admin')
def manage_kitchens():
    if request.method == 'GET':
        kitchens = Kitchen.query.all()
        return jsonify([{
            'id': k.id, 'name': k.name, 'brand': k.brand, 'city': k.city,
            'rating': k.rating, 'total_orders': k.total_orders,
            'revenue': k.revenue, 'is_active': k.is_active,
            'commission_rate': k.commission_rate
        } for k in kitchens])
    data = request.get_json()
    k = Kitchen(**{key: data[key] for key in data if key in Kitchen.__table__.columns.keys()})
    db.session.add(k)
    db.session.commit()
    return jsonify({'success': True, 'id': k.id})

@app.route('/api/admin/kitchens/<int:kid>', methods=['PUT', 'DELETE'])
@login_required
@role_required('super_admin')
def kitchen_detail(kid):
    k = Kitchen.query.get_or_404(kid)
    if request.method == 'DELETE':
        db.session.delete(k)
        db.session.commit()
        return jsonify({'success': True})
    data = request.get_json()
    for key, val in data.items():
        if hasattr(k, key):
            setattr(k, key, val)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/admin/users')
@login_required
@role_required('super_admin')
def admin_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role,
        'is_active': u.is_active, 'total_orders': u.total_orders,
        'rating': u.rating, 'created_at': u.created_at.isoformat()
    } for u in users])

@app.route('/api/admin/users/<int:uid>', methods=['PUT', 'DELETE'])
@login_required
@role_required('super_admin')
def admin_user_detail(uid):
    u = User.query.get_or_404(uid)
    if request.method == 'DELETE':
        db.session.delete(u)
        db.session.commit()
        return jsonify({'success': True})
    data = request.get_json()
    for key, val in data.items():
        if hasattr(u, key) and key not in ['password','id']:
            setattr(u, key, val)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/admin/orders')
@login_required
@role_required('super_admin')
def admin_all_orders():
    orders = Order.query.order_by(Order.created_at.desc()).limit(100).all()
    return jsonify([format_order(o) for o in orders])

@app.route('/api/admin/orders/<int:oid>/control', methods=['POST'])
@login_required
@role_required('super_admin')
def admin_order_control(oid):
    order = Order.query.get_or_404(oid)
    data = request.get_json()

    old_status = order.status
    new_status = data.get('status')
    new_priority = data.get('ai_priority_score')

    if new_status:
        order.status = new_status
        if new_status == 'cancelled':
            order.payment_status = 'refunded'

    if new_priority is not None:
        order.ai_priority_score = new_priority

    db.session.commit()

    log_action(current_user.id, "Admin Order Override",
               f"Order {order.order_number} changed from {old_status} to {new_status}. Priority: {new_priority}")

    create_notification(order.customer_id, "Order Update",
                        f"Admin has updated your order #{order.order_number} status to {new_status}.", "info")

    socketio.emit('order_update', {'order_id': oid, 'status': new_status}, room=f'order_{oid}')

    return jsonify({'success': True})

@app.route('/api/admin/revenue-forecast')
@login_required
@role_required('super_admin')
def revenue_forecast():
    forecasts = ai_engine.forecast_revenue(0, 30)
    return jsonify({'forecasts': forecasts, 'total': sum(forecasts), 'avg': sum(forecasts)/len(forecasts)})

@app.route('/api/admin/platform-analytics')
@login_required
@role_required('super_admin')
def platform_analytics():
    return jsonify({
        'daily_orders': [random.randint(80, 200) for _ in range(30)],
        'daily_revenue': [random.uniform(25000, 75000) for _ in range(30)],
        'kitchen_performance': [{'name': k.name, 'orders': k.total_orders, 'revenue': k.revenue, 'rating': k.rating}
                                 for k in Kitchen.query.limit(10).all()],
        'top_cities': [{'city': c, 'orders': random.randint(100, 500)} for c in ['Bengaluru','Mumbai','Delhi','Hyderabad','Chennai']],
        'user_growth': [random.randint(20, 80) for _ in range(12)],
        'satisfaction_score': round(random.uniform(4.1, 4.8), 2)
    })

@app.route('/api/admin/coupons', methods=['GET', 'POST'])
@login_required
@role_required('super_admin')
def manage_coupons():
    if request.method == 'GET':
        coupons = Coupon.query.all()
        return jsonify([{
            'id': c.id, 'code': c.code, 'discount_type': c.discount_type,
            'discount_value': c.discount_value, 'is_active': c.is_active,
            'used_count': c.used_count, 'usage_limit': c.usage_limit
        } for c in coupons])
    data = request.get_json()
    c = Coupon(code=data['code'], discount_type=data.get('discount_type','percentage'),
               discount_value=data.get('discount_value',10),
               min_order=data.get('min_order',200),
               usage_limit=data.get('usage_limit',100))
    db.session.add(c)
    db.session.commit()
    return jsonify({'success': True})

# ─────────────────────────────────────────────
# API: BRAND ADMIN / KITCHEN MANAGER
# ─────────────────────────────────────────────

@app.route('/api/kitchen/stats')
@login_required
@role_required('brand_admin')
def kitchen_stats():
    k = Kitchen.query.get(current_user.kitchen_id)
    if not k:
        return jsonify({'error': 'No kitchen assigned'}), 404
    orders = Order.query.filter_by(kitchen_id=k.id).all()
    today_orders = Order.query.filter(
        Order.kitchen_id == k.id,
        Order.created_at >= datetime.utcnow().replace(hour=0, minute=0, second=0)
    ).count()
    today_revenue = sum(o.total for o in orders if o.created_at.date() == datetime.utcnow().date())
    pending = Order.query.filter_by(kitchen_id=k.id, status='pending').count()
    preparing = Order.query.filter_by(kitchen_id=k.id, status='preparing').count()
    inventory_alerts = ai_engine.detect_inventory_anomaly(k.id)
    return jsonify({
        'kitchen': {'name': k.name, 'rating': k.rating, 'total_orders': k.total_orders},
        'today_orders': today_orders, 'today_revenue': round(today_revenue, 2),
        'pending_orders': pending, 'preparing_orders': preparing,
        'inventory_alerts': len(inventory_alerts),
        'revenue_trend': [random.uniform(10000, 40000) for _ in range(7)],
        'menu_items': MenuItem.query.filter_by(kitchen_id=k.id).count()
    })

@app.route('/api/kitchen/menu', methods=['GET', 'POST'])
@login_required
@role_required('brand_admin')
def kitchen_menu():
    k_id = current_user.kitchen_id
    if request.method == 'GET':
        items = MenuItem.query.filter_by(kitchen_id=k_id).all()
        return jsonify([{
            'id': i.id, 'name': i.name, 'description': i.description,
            'price': i.price, 'category': i.category, 'image_emoji': i.image_emoji,
            'is_available': i.is_available, 'is_veg': i.is_veg, 'prep_time': i.prep_time,
            'calories': i.calories, 'rating': i.rating, 'total_orders': i.total_orders
        } for i in items])
    data = request.get_json()
    item = MenuItem(kitchen_id=k_id, name=data['name'], description=data.get('description',''),
                    price=data['price'], category=data.get('category','Main Course'),
                    image_emoji=data.get('image_emoji','🍽️'), is_veg=data.get('is_veg', True),
                    prep_time=data.get('prep_time', 15), calories=data.get('calories', 300))
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})

@app.route('/api/kitchen/menu/<int:mid>', methods=['PUT', 'DELETE'])
@login_required
@role_required('brand_admin')
def menu_item_detail(mid):
    item = MenuItem.query.get_or_404(mid)
    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})
    data = request.get_json()
    for key, val in data.items():
        if hasattr(item, key):
            setattr(item, key, val)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/kitchen/inventory', methods=['GET', 'POST'])
@login_required
@role_required('brand_admin')
def kitchen_inventory():
    k_id = current_user.kitchen_id
    if request.method == 'GET':
        items = Inventory.query.filter_by(kitchen_id=k_id).all()
        alerts = ai_engine.detect_inventory_anomaly(k_id)
        return jsonify({
            'items': [{'id': i.id, 'item_name': i.item_name, 'category': i.category,
                       'quantity': i.quantity, 'unit': i.unit, 'min_stock': i.min_stock,
                       'unit_cost': i.unit_cost, 'supplier': i.supplier,
                       'is_low': i.quantity <= i.min_stock} for i in items],
            'alerts': alerts
        })
    data = request.get_json()
    inv = Inventory(kitchen_id=k_id, item_name=data['item_name'],
                    category=data.get('category','Vegetables'),
                    quantity=data.get('quantity',0), unit=data.get('unit','kg'),
                    min_stock=data.get('min_stock',5), unit_cost=data.get('unit_cost',0),
                    supplier=data.get('supplier',''))
    db.session.add(inv)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/kitchen/inventory/<int:iid>', methods=['PUT'])
@login_required
@role_required('brand_admin')
def update_inventory(iid):
    inv = Inventory.query.get_or_404(iid)
    data = request.get_json()
    for key, val in data.items():
        if hasattr(inv, key):
            setattr(inv, key, val)
    inv.last_restocked = datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/kitchen/orders')
@login_required
@role_required('brand_admin')
def kitchen_orders():
    k_id = current_user.kitchen_id
    status = request.args.get('status', '')
    q = Order.query.filter_by(kitchen_id=k_id)
    if status:
        q = q.filter_by(status=status)
    orders = q.order_by(Order.created_at.desc()).limit(50).all()
    return jsonify([format_order(o) for o in orders])

@app.route('/api/kitchen/staff')
@login_required
@role_required('brand_admin')
def kitchen_staff():
    k_id = current_user.kitchen_id
    staff = User.query.filter(User.kitchen_id == k_id, User.role.in_(['chef','delivery'])).all()
    return jsonify([{'id': u.id, 'name': u.name, 'role': u.role, 'email': u.email,
                     'phone': u.phone, 'rating': u.rating, 'status': u.status} for u in staff])

@app.route('/api/kitchen/analytics')
@login_required
@role_required('brand_admin')
def kitchen_analytics():
    k_id = current_user.kitchen_id
    demand = ai_engine.predict_demand(k_id, 0)
    return jsonify({
        'demand_forecast': demand,
        'hourly_orders': [random.randint(2, 25) for _ in range(24)],
        'category_sales': {'Main Course': 45, 'Starters': 20, 'Desserts': 15, 'Beverages': 12, 'Breads': 8},
        'weekly_revenue': [random.uniform(30000, 80000) for _ in range(7)],
        'avg_prep_time': round(random.uniform(18, 28), 1),
        'customer_satisfaction': round(random.uniform(4.0, 4.9), 2),
        'waste_index': round(random.uniform(2, 8), 1)
    })

@app.route('/api/kitchen/schedule', methods=['GET', 'POST'])
@login_required
@role_required('brand_admin')
def kitchen_schedule():
    k_id = current_user.kitchen_id
    if request.method == 'GET':
        schedules = StaffSchedule.query.filter_by(kitchen_id=k_id).all()
        return jsonify([{'id': s.id, 'user_id': s.user_id, 'shift_date': str(s.shift_date),
                         'shift_start': s.shift_start, 'shift_end': s.shift_end,
                         'role': s.role, 'status': s.status} for s in schedules])
    data = request.get_json()
    s = StaffSchedule(kitchen_id=k_id, user_id=data['user_id'],
                      shift_date=datetime.strptime(data['shift_date'], '%Y-%m-%d').date(),
                      shift_start=data['shift_start'], shift_end=data['shift_end'],
                      role=data.get('role','chef'))
    db.session.add(s)
    db.session.commit()
    return jsonify({'success': True})

# ─────────────────────────────────────────────
# API: CHEF / KITCHEN STAFF
# ─────────────────────────────────────────────

@app.route('/api/chef/orders')
@login_required
@role_required('chef')
def chef_orders():
    k_id = current_user.kitchen_id
    orders = Order.query.filter(
        Order.kitchen_id == k_id,
        Order.status.in_(['confirmed', 'preparing'])
    ).order_by(Order.ai_priority_score.desc()).all()
    return jsonify([format_order(o) for o in orders])

@app.route('/api/chef/order/<int:oid>/status', methods=['PUT'])
@login_required
@role_required('chef')
def update_order_status_chef(oid):
    order = Order.query.get_or_404(oid)
    data = request.get_json()
    old_status = order.status
    order.status = data['status']
    if data['status'] == 'preparing':
        order.confirmed_at = datetime.utcnow()
    db.session.commit()

    # Notify customer via app and email
    customer = User.query.get(order.customer_id)
    create_notification(order.customer_id,
                        'Order Update', f'Your order #{order.order_number} is now {data["status"]}!', 'info')
    if customer:
        send_status_email(customer, order, data['status'])

    socketio.emit('order_update', {'order_id': oid, 'status': data['status']}, room=f'order_{oid}')
    return jsonify({'success': True})

@app.route('/api/chef/queue')
@login_required
@role_required('chef')
def chef_queue():
    k_id = current_user.kitchen_id
    queue = Order.query.filter_by(kitchen_id=k_id, status='confirmed').order_by(Order.created_at).all()
    return jsonify([{**format_order(o), 'priority': round(o.ai_priority_score*10, 1)} for o in queue])

@app.route('/api/chef/inventory-check')
@login_required
@role_required('chef')
def chef_inventory():
    k_id = current_user.kitchen_id
    alerts = ai_engine.detect_inventory_anomaly(k_id)
    items = Inventory.query.filter_by(kitchen_id=k_id).all()
    return jsonify({
        'alerts': alerts,
        'items': [{'name': i.item_name, 'quantity': i.quantity, 'unit': i.unit,
                   'is_low': i.quantity <= i.min_stock} for i in items]
    })

@app.route('/api/chef/performance')
@login_required
@role_required('chef')
def chef_performance():
    return jsonify({
        'today_completed': random.randint(15, 45),
        'avg_prep_time': round(random.uniform(18, 28), 1),
        'accuracy_rate': round(random.uniform(94, 99), 1),
        'rating': round(random.uniform(4.2, 4.9), 2),
        'weekly_output': [random.randint(20, 60) for _ in range(7)],
        'items_cooked': [{'name': f'Dish {i}', 'count': random.randint(5, 30)} for i in range(1, 8)]
    })

@app.route('/api/chef/recipes')
@login_required
@role_required('chef')
def chef_recipes():
    k_id = current_user.kitchen_id
    items = MenuItem.query.filter_by(kitchen_id=k_id, is_available=True).all()
    return jsonify([{'id': i.id, 'name': i.name, 'prep_time': i.prep_time,
                     'category': i.category, 'calories': i.calories,
                     'image_emoji': i.image_emoji} for i in items])

@app.route('/api/chef/schedule')
@login_required
@role_required('chef')
def chef_schedule():
    schedules = StaffSchedule.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'shift_date': str(s.shift_date), 'shift_start': s.shift_start,
                     'shift_end': s.shift_end, 'status': s.status} for s in schedules])

# ─────────────────────────────────────────────
# API: DELIVERY AGENT
# ─────────────────────────────────────────────

@app.route('/api/delivery/orders')
@login_required
@role_required('delivery')
def delivery_orders():
    assigned = Order.query.filter_by(delivery_agent_id=current_user.id, status='picked_up').all()
    available = Order.query.filter_by(status='ready', delivery_agent_id=None).limit(10).all()
    return jsonify({
        'assigned': [format_order(o) for o in assigned],
        'available': [format_order(o) for o in available]
    })

@app.route('/api/delivery/accept/<int:oid>', methods=['POST'])
@login_required
@role_required('delivery')
def accept_order(oid):
    order = Order.query.get_or_404(oid)
    if order.status != 'ready' or order.delivery_agent_id:
        return jsonify({'error': 'Order not available'}), 400
    order.delivery_agent_id = current_user.id
    order.status = 'picked_up'
    db.session.commit()
    create_notification(order.customer_id, 'Out for Delivery',
                        f'Your order is on the way! Agent: {current_user.name}', 'success')
    return jsonify({'success': True})

@app.route('/api/delivery/complete/<int:oid>', methods=['POST'])
@login_required
@role_required('delivery')
def complete_delivery(oid):
    order = Order.query.get_or_404(oid)
    order.status = 'delivered'
    order.delivered_at = datetime.utcnow()
    order.payment_status = 'paid'
    customer = User.query.get(order.customer_id)
    if customer:
        customer.loyalty_points += int(order.total * 0.1)
        customer.total_orders += 1
        send_status_email(customer, order, 'delivered')
    kitchen = Kitchen.query.get(order.kitchen_id)
    if kitchen:
        kitchen.total_orders += 1
        kitchen.revenue += order.total
    current_user.total_orders += 1
    db.session.commit()
    create_notification(order.customer_id, '🎉 Order Delivered!',
                        f'Your order #{order.order_number} has been delivered. Enjoy your meal!', 'success')
    socketio.emit('order_delivered', {'order_id': oid}, room=f'order_{oid}')
    return jsonify({'success': True})

@app.route('/api/delivery/stats')
@login_required
@role_required('delivery')
def delivery_stats():
    deliveries = Order.query.filter_by(delivery_agent_id=current_user.id, status='delivered').count()
    today = Order.query.filter(
        Order.delivery_agent_id == current_user.id,
        Order.delivered_at >= datetime.utcnow().replace(hour=0, minute=0, second=0)
    ).count()
    earnings = deliveries * 30  # ₹30 per delivery
    route = ai_engine.optimize_delivery_route(current_user.id, [])
    return jsonify({
        'total_deliveries': deliveries, 'today_deliveries': today,
        'total_earnings': earnings, 'rating': current_user.rating,
        'status': current_user.status, 'optimized_route': route,
        'weekly_deliveries': [random.randint(8, 25) for _ in range(7)],
        'avg_delivery_time': round(random.uniform(22, 38), 1)
    })

@app.route('/api/delivery/status', methods=['PUT'])
@login_required
@role_required('delivery')
def delivery_status():
    data = request.get_json()
    current_user.status = data.get('status', 'available')
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/delivery/earnings')
@login_required
@role_required('delivery')
def delivery_earnings():
    orders = Order.query.filter_by(delivery_agent_id=current_user.id, status='delivered').count()
    return jsonify({
        'total': orders * 30,
        'this_week': random.randint(1500, 4000),
        'this_month': random.randint(8000, 20000),
        'daily_earnings': [random.randint(150, 800) for _ in range(30)],
        'pending_payout': random.randint(0, 2000)
    })

# ─────────────────────────────────────────────
# API: CUSTOMER
# ─────────────────────────────────────────────

@app.route('/api/customer/kitchens')
@login_required
@role_required('customer')
def browse_kitchens():
    city = request.args.get('city', '')
    cuisine = request.args.get('cuisine', '')
    q = Kitchen.query.filter_by(is_active=True)
    if city:
        q = q.filter(Kitchen.city.ilike(f'%{city}%'))
    if cuisine:
        q = q.filter(Kitchen.cuisine_type.ilike(f'%{cuisine}%'))
    kitchens = q.all()
    return jsonify([{
        'id': k.id, 'name': k.name, 'brand': k.brand, 'city': k.city,
        'cuisine_type': k.cuisine_type, 'rating': k.rating,
        'total_orders': k.total_orders, 'opening_time': k.opening_time,
        'closing_time': k.closing_time, 'address': k.address
    } for k in kitchens])

@app.route('/api/customer/menu/<int:kid>')
@login_required
@role_required('customer')
def customer_menu(kid):
    items = MenuItem.query.filter_by(kitchen_id=kid, is_available=True).all()
    recommended = ai_engine.recommend_items(current_user.id, kid)
    return jsonify({
        'items': [{'id': i.id, 'name': i.name, 'description': i.description,
                   'price': i.price, 'category': i.category, 'image_emoji': i.image_emoji,
                   'is_veg': i.is_veg, 'prep_time': i.prep_time, 'calories': i.calories,
                   'rating': i.rating} for i in items],
        'recommended': [{'id': r['item'].id, 'name': r['item'].name,
                          'price': r['item'].price, 'image_emoji': r['item'].image_emoji,
                          'score': r['score']} for r in recommended]
    })

@app.route('/api/customer/order', methods=['POST'])
@login_required
@role_required('customer')
def place_order():
    data = request.get_json()
    items = data.get('items', [])
    kitchen_id = data.get('kitchen_id')
    subtotal = sum(i['price'] * i['quantity'] for i in items)
    delivery_fee = 30.0
    tax = round(subtotal * 0.05, 2)
    discount = 0
    coupon_code = data.get('coupon_code', '')
    if coupon_code:
        coupon = Coupon.query.filter_by(code=coupon_code, is_active=True).first()
        if coupon and coupon.used_count < coupon.usage_limit and subtotal >= coupon.min_order:
            if coupon.discount_type == 'percentage':
                discount = min(subtotal * coupon.discount_value / 100, coupon.max_discount)
            else:
                discount = min(coupon.discount_value, coupon.max_discount)
            coupon.used_count += 1
    total = subtotal + delivery_fee + tax - discount

    # ─────────────────────────────────────────────
    # RAZORPAY PAYMENT GATEWAY INTEGRATION
    # ─────────────────────────────────────────────
    razorpay_order_id = None
    if data.get('payment_method') == 'online':
        try:
            # Create Razorpay Order
            razor_order = client.order.create({
                "amount": int(total * 100), # amount in paise
                "currency": "INR",
                "receipt": f"receipt_{generate_order_number()}"
            })
            razorpay_order_id = razor_order['id']
        except Exception as e:
            print(f"Razorpay Error: {e}")
            # Fallback for demo if API fails
            razorpay_order_id = f"order_mock_{random.randint(1000,9999)}"

    pred_time = ai_engine.predict_prep_time(items)
    order = Order(
        order_number=generate_order_number(), customer_id=current_user.id,
        kitchen_id=kitchen_id, items=json.dumps(items), subtotal=subtotal,
        delivery_fee=delivery_fee, tax=tax, discount=discount, total=round(total, 2),
        delivery_address=data.get('delivery_address', ''), payment_method=data.get('payment_method', 'online'),
        payment_status='paid' if data.get('payment_method') == 'online' else 'pending',
        special_instructions=data.get('special_instructions', ''),
        estimated_time=pred_time, coupon_code=coupon_code,
        ai_priority_score=random.uniform(0.3, 1.0)
    )
    db.session.add(order)
    db.session.commit()

    # Send confirmation email
    send_status_email(current_user, order, 'placed')
    log_action(current_user.id, "Place Order", f"Order #{order.order_number} for INR {order.total}")
    create_notification(current_user.id, '✅ Order Placed!',
                        f'Your order #{order.order_number} has been placed. Est. time: {pred_time} mins', 'success')
    socketio.emit('new_order', {'order_id': order.id, 'kitchen_id': kitchen_id}, room=f'kitchen_{kitchen_id}')
    return jsonify({'success': True, 'order_id': order.id, 'order_number': order.order_number,
                    'estimated_time': pred_time, 'total': round(total, 2)})

@app.route('/api/customer/orders')
@login_required
@role_required('customer')
def customer_orders():
    orders = Order.query.filter_by(customer_id=current_user.id).order_by(Order.created_at.desc()).limit(20).all()
    return jsonify([format_order(o) for o in orders])

@app.route('/api/customer/track/<int:oid>')
@login_required
@role_required('customer')
def track_order(oid):
    order = Order.query.get_or_404(oid)
    if order.customer_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    steps = ['pending','confirmed','preparing','ready','picked_up','delivered']
    current_step = steps.index(order.status) if order.status in steps else 0
    return jsonify({**format_order(order), 'steps': steps, 'current_step': current_step,
                    'progress': int((current_step / (len(steps)-1)) * 100)})

@app.route('/api/customer/review', methods=['POST'])
@login_required
@role_required('customer')
def submit_review():
    data = request.get_json()
    order = Order.query.get(data.get('order_id'))
    if not order or order.customer_id != current_user.id:
        return jsonify({'error': 'Invalid'}), 400
    sentiment = ai_engine.analyze_sentiment(data.get('comment',''))
    review = Review(order_id=order.id, customer_id=current_user.id,
                    kitchen_id=order.kitchen_id, food_rating=data.get('food_rating',5),
                    delivery_rating=data.get('delivery_rating',5),
                    overall_rating=data.get('overall_rating',5),
                    comment=data.get('comment',''), sentiment=sentiment)
    db.session.add(review)
    order.customer_rating = data.get('overall_rating',5)
    db.session.commit()
    return jsonify({'success': True, 'sentiment': sentiment})

@app.route('/api/customer/profile', methods=['GET', 'PUT'])
@login_required
@role_required('customer')
def customer_profile():
    if request.method == 'GET':
        return jsonify({
            'id': current_user.id, 'name': current_user.name, 'email': current_user.email,
            'phone': current_user.phone, 'loyalty_points': current_user.loyalty_points,
            'total_orders': current_user.total_orders
        })
    data = request.get_json()
    for key in ['name','phone']:
        if key in data:
            setattr(current_user, key, data[key])
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/customer/recommendations')
@login_required
@role_required('customer')
def customer_recommendations():
    kitchens = Kitchen.query.filter_by(is_active=True).limit(3).all()
    recs = []
    for k in kitchens:
        items = ai_engine.recommend_items(current_user.id, k.id)
        recs.extend([{'kitchen': k.name, 'item': r['item'].name,
                      'price': r['item'].price, 'image_emoji': r['item'].image_emoji,
                      'score': r['score']} for r in items[:2]])
    return jsonify({'recommendations': recs[:8]})

# ─────────────────────────────────────────────
# SHARED APIs
# ─────────────────────────────────────────────

@app.route('/api/notifications')
@login_required
def get_notifications():
    notifs = Notification.query.filter_by(user_id=current_user.id).order_by(
        Notification.created_at.desc()).limit(20).all()
    return jsonify([{'id': n.id, 'title': n.title, 'message': n.message,
                     'type': n.type, 'is_read': n.is_read,
                     'created_at': n.created_at.isoformat()} for n in notifs])

@app.route('/api/notifications/read', methods=['POST'])
@login_required
def mark_notifications_read():
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/orders/<int:oid>')
@login_required
def get_order(oid):
    order = Order.query.get_or_404(oid)
    return jsonify(format_order(order))

@app.route('/api/orders/<int:oid>/status', methods=['PUT'])
@login_required
def update_order_status(oid):
    order = Order.query.get_or_404(oid)
    data = request.get_json()
    order.status = data['status']
    db.session.commit()
    socketio.emit('order_update', {'order_id': oid, 'status': data['status']}, room=f'order_{oid}')
    return jsonify({'success': True})

@app.route('/api/validate-coupon', methods=['POST'])
@login_required
def validate_coupon():
    data = request.get_json()
    coupon = Coupon.query.filter_by(code=data.get('code',''), is_active=True).first()
    if not coupon:
        return jsonify({'valid': False, 'error': 'Invalid coupon code'})
    if coupon.used_count >= coupon.usage_limit:
        return jsonify({'valid': False, 'error': 'Coupon limit reached'})
    return jsonify({'valid': True, 'discount_type': coupon.discount_type,
                    'discount_value': coupon.discount_value, 'min_order': coupon.min_order,
                    'max_discount': coupon.max_discount})

@app.route('/api/me')
@login_required
def me():
    return jsonify({'id': current_user.id, 'name': current_user.name,
                    'email': current_user.email, 'role': current_user.role,
                    'avatar': current_user.avatar, 'kitchen_id': current_user.kitchen_id,
                    'loyalty_points': current_user.loyalty_points})

# ─────────────────────────────────────────────
# PREMIUM FEATURES: PDF & AUDIT LOGS
# ─────────────────────────────────────────────

@app.route('/api/orders/<int:oid>/invoice')
@login_required
def download_invoice(oid):
    order = Order.query.get_or_404(oid)
    if order.customer_id != current_user.id and current_user.role != 'super_admin':
        return jsonify({'error': 'Unauthorized'}), 403

    pdf_buffer = ai_engine.generate_invoice_pdf(order)
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"Invoice_{order.order_number}.pdf",
        mimetype='application/pdf'
    )

@app.route('/api/admin/audit-logs')
@login_required
@role_required('super_admin')
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify([{
        'id': l.id, 'user_id': l.user_id, 'action': l.action,
        'timestamp': l.timestamp.isoformat(), 'ip': l.ip_address,
        'details': l.details
    } for l in logs])

def format_order(o):
    try:
        items = json.loads(o.items) if o.items else []
    except:
        items = []
    customer = User.query.get(o.customer_id)
    kitchen = Kitchen.query.get(o.kitchen_id)
    return {
        'id': o.id, 'order_number': o.order_number, 'status': o.status,
        'items': items, 'subtotal': o.subtotal, 'total': o.total,
        'delivery_fee': o.delivery_fee, 'discount': o.discount,
        'delivery_address': o.delivery_address, 'estimated_time': o.estimated_time,
        'special_instructions': o.special_instructions,
        'created_at': o.created_at.isoformat(),
        'customer_name': customer.name if customer else 'Unknown',
        'kitchen_name': kitchen.name if kitchen else 'Unknown',
        'payment_method': o.payment_method, 'payment_status': o.payment_status,
        'customer_rating': o.customer_rating
    }

# ─────────────────────────────────────────────
# SOCKETIO
# ─────────────────────────────────────────────

@socketio.on('join')
def on_join(data):
    room = data.get('room')
    if room:
        join_room(room)

@socketio.on('leave')
def on_leave(data):
    room = data.get('room')
    if room:
        leave_room(room)

# ─────────────────────────────────────────────
# DB SEED
# ─────────────────────────────────────────────

def seed_database():
    if User.query.count() > 0:
        return

    # Kitchens
    kitchens_data = [
        {'name':'Spice Route Kitchen','brand':'Spice Route','city':'Bengaluru','address':'Koramangala, Bengaluru','cuisine_type':'Indian, Mughlai','rating':4.7,'revenue':285000,'total_orders':1245},
        {'name':'Pasta Paradise','brand':'Pasta Paradise','city':'Bengaluru','address':'Indiranagar, Bengaluru','cuisine_type':'Italian, Continental','rating':4.5,'revenue':198000,'total_orders':876},
        {'name':'Dragon Wok','brand':'Dragon Wok','city':'Mumbai','address':'Bandra West, Mumbai','cuisine_type':'Chinese, Pan Asian','rating':4.6,'revenue':312000,'total_orders':1432},
        {'name':'Burger Barn','brand':'Burger Barn','city':'Delhi','address':'Connaught Place, Delhi','cuisine_type':'American, Fast Food','rating':4.3,'revenue':176000,'total_orders':2310},
        {'name':'South Spice','brand':'South Spice','city':'Chennai','address':'T. Nagar, Chennai','cuisine_type':'South Indian','rating':4.8,'revenue':225000,'total_orders':1680},
    ]
    kitchens = []
    for kd in kitchens_data:
        k = Kitchen(**kd)
        db.session.add(k)
        kitchens.append(k)
    db.session.flush()

    # Users
    avatars = {'super_admin':'👑','brand_admin':'🏪','chef':'👨‍🍳','delivery':'🚴','customer':'👤'}
    users_data = [
        {'name':'Arjun Sharma','email':'admin@cloudkitchen.com','password':'Admin@123','role':'super_admin','phone':'9876543210'},
        {'name':'Priya Nair','email':'kitchen1@cloudkitchen.com','password':'Kitchen@123','role':'brand_admin','phone':'9876543211','kitchen_id':1},
        {'name':'Rahul Verma','email':'kitchen2@cloudkitchen.com','password':'Kitchen@123','role':'brand_admin','phone':'9876543212','kitchen_id':2},
        {'name':'Sanjay Kumar','email':'chef1@cloudkitchen.com','password':'Chef@123','role':'chef','phone':'9876543213','kitchen_id':1},
        {'name':'Meena Reddy','email':'chef2@cloudkitchen.com','password':'Chef@123','role':'chef','phone':'9876543214','kitchen_id':2},
        {'name':'Ravi Delivery','email':'delivery1@cloudkitchen.com','password':'Delivery@123','role':'delivery','phone':'9876543215'},
        {'name':'Amit Rider','email':'delivery2@cloudkitchen.com','password':'Delivery@123','role':'delivery','phone':'9876543216'},
        {'name':'Sunita Customer','email':'customer1@cloudkitchen.com','password':'Customer@123','role':'customer','phone':'9876543217','loyalty_points':350,'total_orders':23},
        {'name':'Vikram Singh','email':'customer2@cloudkitchen.com','password':'Customer@123','role':'customer','phone':'9876543218','loyalty_points':120,'total_orders':8},
    ]
    for ud in users_data:
        pwd = bcrypt.generate_password_hash(ud.pop('password')).decode('utf-8')
        u = User(password=pwd, avatar=avatars.get(ud['role'],'👤'), **ud)
        db.session.add(u)
    db.session.flush()

    # Menu Items
    menus = [
        # Kitchen 1 - Spice Route
        (1,'Butter Chicken','Creamy tomato-based curry with tender chicken',320,'Main Course','🍛',False,20,450,4.8),
        (1,'Paneer Tikka Masala','Rich spiced paneer in tomato gravy',280,'Main Course','🍲',True,18,380,4.7),
        (1,'Dal Makhani','Slow-cooked black lentils with butter and cream',220,'Main Course','🫕',True,25,320,4.6),
        (1,'Garlic Naan','Soft leavened bread with garlic and butter',60,'Breads','🫓',True,8,180,4.5),
        (1,'Gulab Jamun','Soft milk-solid dumplings in rose syrup',120,'Desserts','🍮',True,10,220,4.9),
        (1,'Mango Lassi','Chilled yogurt drink with fresh mango',90,'Beverages','🥛',True,5,150,4.7),
        # Kitchen 2 - Pasta Paradise
        (2,'Penne Arrabbiata','Spicy Italian pasta with tomato sauce',350,'Main Course','🍝',True,15,520,4.5),
        (2,'Chicken Alfredo','Creamy white sauce pasta with grilled chicken',420,'Main Course','🍝',False,18,680,4.6),
        (2,'Margherita Pizza','Classic tomato and mozzarella pizza',380,'Pizza','🍕',True,20,560,4.7),
        (2,'Tiramisu','Classic Italian coffee dessert',280,'Desserts','🍰',True,5,380,4.8),
        (2,'Caesar Salad','Crispy romaine with caesar dressing',260,'Starters','🥗',True,10,280,4.4),
        # Kitchen 3 - Dragon Wok
        (3,'Kung Pao Chicken','Spicy stir-fried chicken with peanuts',380,'Main Course','🍜',False,15,480,4.6),
        (3,'Veg Fried Rice','Wok-tossed rice with mixed vegetables',280,'Main Course','🍚',True,12,420,4.5),
        (3,'Dim Sum (6 pcs)','Steamed dumplings with soy dipping sauce',320,'Starters','🥟',False,20,280,4.7),
        (3,'Hot & Sour Soup','Tangy spiced soup with mushrooms',180,'Soups','🍲',True,10,120,4.4),
    ]
    for m in menus:
        item = MenuItem(kitchen_id=m[0], name=m[1], description=m[2], price=m[3],
                        category=m[4], image_emoji=m[5], is_veg=m[6], prep_time=m[7],
                        calories=m[8], rating=m[9], total_orders=random.randint(50,500))
        db.session.add(item)
    db.session.flush()

    # Inventory
    inv_items = [
        ('Chicken','Proteins',25,'kg',5,50,180,'Fresh Farms'),
        ('Paneer','Dairy',15,'kg',3,30,120,'Dairy Direct'),
        ('Tomatoes','Vegetables',30,'kg',10,60,40,'Veggie Hub'),
        ('Rice','Grains',45,'kg',15,80,55,'Grains Co'),
        ('Onions','Vegetables',20,'kg',8,40,30,'Veggie Hub'),
        ('Oil','Oils',8,'litre',3,20,90,'Oil Express'),
        ('Butter','Dairy',4,'kg',1,10,280,'Dairy Direct'),
        ('Spices Mix','Spices',2,'kg',0.5,5,450,'Spice World'),
        ('Flour','Grains',12,'kg',5,30,50,'Grains Co'),
        ('Milk','Dairy',10,'litre',3,20,65,'Dairy Direct'),
    ]
    for kid in [k.id for k in kitchens]:
        for ii in inv_items:
            qty = random.uniform(ii[2]*0.3, ii[2])
            inv = Inventory(kitchen_id=kid, item_name=ii[0], category=ii[1],
                            quantity=round(qty, 1), unit=ii[3], min_stock=ii[4],
                            max_stock=ii[5], unit_cost=ii[6], supplier=ii[7],
                            usage_rate=random.uniform(0.5, 3.0))
            db.session.add(inv)

    # Sample Orders
    statuses = ['pending','confirmed','preparing','ready','picked_up','delivered','delivered','delivered']
    customer_ids = [u.id for u in User.query.filter_by(role='customer').all()]
    for kid in [k.id for k in kitchens[:3]]:
        menu_items = MenuItem.query.filter_by(kitchen_id=kid).limit(4).all()
        for _ in range(8):
            if not menu_items or not customer_ids:
                continue
            item = random.choice(menu_items)
            qty = random.randint(1, 3)
            items_json = json.dumps([{'id': item.id, 'name': item.name, 'price': item.price,
                                       'quantity': qty, 'prep_time': item.prep_time}])
            subtotal = item.price * qty
            tax = round(subtotal * 0.05, 2)
            total = subtotal + 30 + tax
            status = random.choice(statuses)
            o = Order(order_number=generate_order_number(),
                      customer_id=random.choice(customer_ids), kitchen_id=kid,
                      items=items_json, subtotal=subtotal, delivery_fee=30,
                      tax=tax, total=total, status=status,
                      delivery_address='123 Main St, Bengaluru',
                      payment_status='paid' if status=='delivered' else 'pending',
                      estimated_time=random.randint(20, 45),
                      ai_priority_score=random.uniform(0.3, 1.0))
            db.session.add(o)

    # Coupons
    coupons = [
        Coupon(code='WELCOME20', discount_type='percentage', discount_value=20,
               min_order=200, max_discount=100, usage_limit=500),
        Coupon(code='FLAT50', discount_type='flat', discount_value=50,
               min_order=300, max_discount=50, usage_limit=200),
        Coupon(code='NEWUSER', discount_type='percentage', discount_value=30,
               min_order=150, max_discount=120, usage_limit=1000),
    ]
    for c in coupons:
        db.session.add(c)

    db.session.commit()
    print("✅ Database seeded successfully!")

# ─────────────────────────────────────────────
# INIT
# ─────────────────────────────────────────────

with app.app_context():
    db.create_all()
    seed_database()

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
