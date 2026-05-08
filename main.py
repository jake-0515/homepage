from fastapi import FastAPI, Request, Depends, Form, HTTPException, status, Response, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import uvicorn
import models
import auth
from jose import JWTError, jwt
import shutil
import os
from typing import Optional

app = FastAPI()
models.init_db()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Dependency to get DB session
def get_db():
    db = models.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper to get current user from cookie
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None
    user = db.query(models.User).filter(models.User.username == username).first()
    return user

# Routes
@app.get("/")
async def read_root(request: Request, user: models.User = Depends(get_current_user)):
    if not user:
        return RedirectResponse(url="/login")
    
    # Sample stats for dashboard
    stats = [
        {"title": "전체 학생 수", "value": "120", "trend": "+5", "icon": "users"},
        {"title": "졸업률", "value": "98%", "trend": "+1%", "icon": "graduation-cap"},
        {"title": "진행 중인 프로젝트", "value": "45", "trend": "+12", "icon": "briefcase"},
        {"title": "출석률", "value": "95.5%", "trend": "-0.5%", "icon": "check-circle"},
    ]
    return templates.TemplateResponse(request, "index.html", {"user": user, "stats": stats})

@app.get("/login")
async def login_page(request: Request):
    return templates.TemplateResponse(request, "login.html")

@app.post("/login")
async def login(response: Response, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        return RedirectResponse(url="/login?error=invalid", status_code=status.HTTP_303_SEE_OTHER)
    
    access_token = auth.create_access_token(data={"sub": user.username})
    response = RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login")
    response.delete_cookie("access_token")
    return response

# Student CRUD (Admin only)
@app.get("/students")
async def list_students(request: Request, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if not user or user.role != "admin":
        return RedirectResponse(url="/")
    students = db.query(models.Student).all()
    return templates.TemplateResponse(request, "students.html", {"user": user, "students": students})

@app.post("/students/create")
async def create_student(
    name: str = Form(...), 
    student_id: str = Form(...), 
    grade: int = Form(...), 
    bio: str = Form(...), 
    interests: str = Form(""),
    projects: str = Form(""),
    achievements: str = Form(""),
    goals: str = Form(""),
    teacher_comments: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not user or user.role != "admin":
        return RedirectResponse(url="/")
        
    image_url = "/static/uploads/default.png"
    if image and image.filename:
        file_path = f"static/uploads/{student_id}_{image.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/{file_path}"

    new_student = models.Student(
        name=name, 
        student_id=student_id, 
        grade=grade, 
        bio=bio, 
        interests=interests,
        projects=projects,
        achievements=achievements,
        goals=goals,
        teacher_comments=teacher_comments,
        image_url=image_url
    )
    db.add(new_student)
    db.commit()
    return RedirectResponse(url="/students", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/students/delete/{id}")
async def delete_student(id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if student:
        db.delete(student)
        db.commit()
    return RedirectResponse(url="/students", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/students/edit/{id}")
async def edit_student_page(id: int, request: Request, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if not user or user.role != "admin":
        return RedirectResponse(url="/")
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        return RedirectResponse(url="/students")
    return templates.TemplateResponse(request, "edit_student.html", {"user": user, "student": student})

@app.post("/students/update/{id}")
async def update_student(
    id: int,
    name: str = Form(...),
    grade: int = Form(...),
    bio: str = Form(...),
    interests: str = Form(""),
    projects: str = Form(""),
    achievements: str = Form(""),
    goals: str = Form(""),
    teacher_comments: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not user or user.role != "admin":
        return RedirectResponse(url="/")
    
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if student:
        student.name = name
        student.grade = grade
        student.bio = bio
        student.interests = interests
        student.projects = projects
        student.achievements = achievements
        student.goals = goals
        student.teacher_comments = teacher_comments
        
        if image and image.filename:
            file_path = f"static/uploads/{student.student_id}_{image.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            student.image_url = f"/{file_path}"
            
        db.commit()
    return RedirectResponse(url="/students", status_code=status.HTTP_303_SEE_OTHER)

# Student Gallery
@app.get("/gallery")
async def gallery_page(request: Request, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if not user:
        return RedirectResponse(url="/login")
    students = db.query(models.Student).all()
    return templates.TemplateResponse(request, "gallery.html", {"user": user, "students": students})

# Initial user setup
@app.on_event("startup")
async def startup_event():
    db = models.SessionLocal()
    # Create default admin if not exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        hashed_pw = auth.get_password_hash("admin123")
        new_admin = models.User(username="admin", hashed_password=hashed_pw, role="admin")
        db.add(new_admin)
        db.commit()
    
    # Create default student if not exists
    student_user = db.query(models.User).filter(models.User.username == "student").first()
    if not student_user:
        hashed_pw = auth.get_password_hash("student123")
        new_student = models.User(username="student", hashed_password=hashed_pw, role="student")
        db.add(new_student)
        db.commit()
    db.close()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
