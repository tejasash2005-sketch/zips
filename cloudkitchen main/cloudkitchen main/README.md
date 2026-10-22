# CloudKitchen Pro — Multi-Cloud Kitchen Platform (Final Year BCA Project)

CloudKitchen Pro is a production-ready, AI-powered operating system for modern cloud kitchens. It features a complete ecosystem for five distinct roles, real-time tracking, AI-driven insights, and integrated payments.

## 🏗️ Tech Stack

- **Backend**: Flask (Python 3.8+)
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+), Bootstrap 5
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Real-time**: Flask-SocketIO (WebSockets)
- **AI/ML**: Scikit-Learn, Pandas (Demand Forecasting & Personalization)
- **Payments**: Razorpay Integration
- **Mailing**: Flask-Mail (SMTP Integration)
- **Deployment**: Render / Docker Ready

## 👥 Role Management & Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@cloudkitchen.com` | `Admin@123` |
| **Kitchen Manager** | `kitchen1@cloudkitchen.com` | `Kitchen@123` |
| **Chef** | `chef1@cloudkitchen.com` | `Chef@123` |
| **Delivery Agent** | `delivery1@cloudkitchen.com` | `Delivery@123` |
| **Customer** | `customer1@cloudkitchen.com` | `Customer@123` |

## 🚀 Key Features

1.  **AI Engine**: Demand forecasting using Linear Regression, sentiment analysis on reviews, and personalized dish recommendations.
2.  **Order Life Cycle**: Full real-time flow from placement to delivery via WebSockets.
3.  **Payment Gateway**: Integrated Razorpay for secure online transactions.
4.  **Security**: Bcrypt password hashing, RBAC (Role-Based Access Control), and Audit Logging.
5.  **Inventory**: Smart tracking with low-stock alerts and expiration monitoring.
6.  **Invoicing**: Automated professional PDF invoice generation for every order.

## 🛠️ Installation & Setup

### Local Development
1. **Clone the repository**.
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials (SMTP, Razorpay).
5. **Run the application**:
   ```bash
   python app.py
   ```
   Or use the provided `run.bat` (Windows).

### Database Migrations
This project uses Flask-Migrate for database schema management.
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## ☁️ Deployment (Render)

1. Connect your GitHub repository to **Render**.
2. Select **Web Service**.
3. Use the following settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --worker-class eventlet -w 1 app:app`
4. Add a **PostgreSQL** database on Render and link the `DATABASE_URL` in Environment Variables.

## 🧪 Testing
- **Unit Testing**: Run `pytest` (if configured).
- **Manual Testing**: Use the demo credentials to verify role-specific dashboards.
- **WebSocket Testing**: Open two different browsers to see real-time order updates.

## 📁 Folder Structure
```
cloudkitchen/
├── app.py              # Main application logic & API routes
├── models/             # Database models (in app.py for this version)
├── static/             # CSS, JS, and Image assets
├── templates/          # HTML templates (Jinja2)
│   ├── dashboards/     # Role-specific dashboard layouts
│   └── ...             # Auth & Landing pages
├── instance/           # Local SQLite database & config
├── migrations/         # Flask-Migrate files
├── requirements.txt    # Production dependencies
├── Procfile            # Deployment config for Render/Heroku
├── .env.example        # Template for environment variables
└── README.md           # Project documentation
```
