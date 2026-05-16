# UNSAP Helpdesk System

A modern, scalable helpdesk platform designed for academic institutions, integrating real-time communication and machine learning to improve issue resolution efficiency and campus service quality.

---

## Preview

## Preview

<p align="center">
  <img src="./assets/preview1.png" width="90%" />
</p>

<br>

<p align="center">
  <img src="./assets/profile.png" width="45%" />
  <img src="./assets/login.png" width="45%" />
</p>

<br>

<p align="center">
  <img src="./assets/dashboard.png" width="45%" />
  <img src="./assets/table.png" width="45%" />
</p>
---

## Overview

UNSAP Helpdesk System is a full-stack web application that enables students to report issues and receive timely support from administrative staff. The platform leverages Natural Language Processing (NLP) to provide intelligent FAQ suggestions, classify ticket urgency, and analyze campus sentiment.

This project adopts a modular monorepo architecture, separating frontend, backend, and machine learning services for better scalability and maintainability.

---

## Key Features

- **Smart FAQ Suggestion (Ticket Deflection)**  
  Reduces redundant tickets using text similarity (TF-IDF / Cosine Similarity).

- **Automated Ticket Classification**  
  Machine learning model categorizes tickets into:
  - Urgent
  - Normal
  - Low

- **Real-Time Communication**  
  Live updates and chat using WebSockets.

- **Sentiment Analytics ("Campus Mood")**  
  Aggregated sentiment analysis for institutional insights.

- **SLA Monitoring**  
  Tracks response time and resolution time for performance evaluation.

- **Active Learning Pipeline**  
  Enables continuous improvement of ML models through human feedback.

---

## Tech Stack

### Frontend
- Next.js v16
- Tailwind CSS
- shadcn ui

### Backend
- Laravel v12
- Laravel Sanctum (Authentication)
- Laravel Reverb (WebSocket server)

### Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Object Storage

### Machine Learning Service
- Python (FastAPI / Flask)
- Scikit-Learn / TensorFlow
- NLP (Text Classification & Similarity)

---

## System Architecture

```
Client (Next.js)
        │
        ▼
Backend API (Laravel)
        │
        ├── Database (Supabase PostgreSQL)
        └── ML Service (Python API)
```

---

## User Roles

### Student
- Submit reports with attachments
- Receive FAQ suggestions before ticket creation
- Track ticket status anonymously
- Access real-time chat

### Admin
- Manage and respond to tickets
- View analytics dashboard
- Export reports (PDF / Excel)
- Monitor SLA metrics

### Master Admin
- Access full user data (via RLS policies)
- Monitor sentiment trends
- Correct ML predictions (active learning)

---

## Machine Learning Workflow

1. User inputs issue description  
2. Backend sends request to ML service:
   - FAQ similarity detection  
3. If ticket is submitted:
   - Job queue processes classification asynchronously  
4. ML service returns:
   ```json
   {
     "label": "urgent | normal | low",
     "confidence": 0.XX
   }
   ```
5. System applies auto-escalation for critical keywords  
6. Real-time update is broadcasted via WebSocket  

---

## Fail-Safe Mechanism

- If ML service is unavailable (timeout/error):
  - Ticket is automatically labeled as **"Normal"**
  - System continues without interruption
  - No HTTP 500 errors exposed to users

---

## Project Structure

```
/unsap-helpdesk-monorepo
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── hooks/
│
├── backend/
│   ├── app/Http/Controllers/API/
│   ├── app/Jobs/
│   └── routes/api.php
│
├── ml-service/
│   ├── models/
│   ├── main.py
│   └── train.py
│
└── assets/
    └── preview1.png
```

---

## Installation

### Prerequisites

- Node.js (>= 18)
- PHP (>= 8.2)
- Composer
- Python (>= 3.10)
- PostgreSQL / Supabase

---

### 1. Clone Repository

```bash
git clone https://github.com/your-username/unsap-helpdesk-monorepo.git
cd unsap-helpdesk-monorepo
```

---

### 2. Setup Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

---

### 3. Setup Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

---

### 4. Setup ML Service

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---

## Security Considerations

- API Rate Limiting (anti-spam)
- File upload validation (type & size restriction)
- Supabase Row Level Security (RLS)
- Input sanitization to prevent injection attacks
- Queue-based processing for heavy workloads

---

## Contribution Guidelines

1. Fork the repository  
2. Create a new branch  
   ```
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes  
4. Push to your fork  
5. Open a Pull Request  

---

## License

This project is licensed under the MIT License.  
See the `LICENSE` file for more details.

---

## Future Roadmap

- Email / WhatsApp notifications
- Advanced NLP models (BERT / IndoBERT)
- Mobile optimization
- Multi-language support
- Role-based access refinement

---

## Acknowledgements

Developed as part of academic and software engineering research initiatives.
