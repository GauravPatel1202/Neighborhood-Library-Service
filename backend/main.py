from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import members, books, borrowings

# Create DB schema
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Library API")

# Setup CORS to allow Next.js app to consume the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# ROUTERS
# -----------------
app.include_router(members.router)
app.include_router(books.router)
app.include_router(borrowings.router)

# -----------------
# ROOT
# -----------------
@app.get("/")
def root():
    return {"message": "Welcome to the Neighborhood Library Service API"}
