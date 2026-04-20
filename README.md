# 🚀 Gemini Student Management Dashboard

A modern, responsive dashboard for student profile management, portfolios, and teacher feedback.

## 🛠️ Deployment Instructions (GitHub + Render)

### 1. Create a GitHub Repository
* Go to [GitHub.com](https://github.com/new).
* Name it `gemini-student-dashboard`.
* Select **Public** and create the repository.

### 2. Upload Your Files
Open your terminal in this folder and run:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gemini-student-dashboard.git
git push -u origin main
```
*(Replace YOUR_USERNAME with your GitHub name)*

### 3. Deploy on Render
* Log in at [Render.com](https://dashboard.render.com/).
* Click **New** > **Web Service**.
* Connect your GitHub account and select your `gemini-student-dashboard` repository.
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`
* Click **Deploy Web Service**.

## 📝 Important Note: SQLite on Render
By default, SQLite data (students you add) will reset every time the app restarts on Render. 
For permanent data, you can:
1.  **Add a "Persistent Disk"** in Render settings (Standard plan).
2.  **Use a Cloud Database** like PostgreSQL (available for free on Render).

## 🔑 Default Credentials
* **Admin:** `admin` / `admin123`
* **Student:** `student` / `student123`
