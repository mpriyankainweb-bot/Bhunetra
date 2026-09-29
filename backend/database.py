"""
BhuNetra Database Connection Module
Supports PostgreSQL + PostGIS with seamless fallback to SQLite.
"""
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("bhunetra.db")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./bhunetra_watershed.db"
)

# Detect if using sqlite or postgresql
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    logger.info("Using SQLite database with float lat/lon fallback for spatial indexing.")
else:
    logger.info("Connecting to PostgreSQL + PostGIS spatial database engine.")

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
