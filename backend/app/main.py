from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import auth, products, keywords, competitors, profit, analysis

try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
except Exception as e:
    print(f"⚠️ DB connection issue: {e}")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(keywords.router)
app.include_router(competitors.router)
app.include_router(profit.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {"app": settings.app_name, "version": settings.app_version, "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}