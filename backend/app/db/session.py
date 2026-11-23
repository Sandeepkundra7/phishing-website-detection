import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

logger = logging.getLogger("phishshield.db")
logging.basicConfig(level=logging.INFO)

def normalize_database_url(url: str) -> str:
    """
    Normalizes PostgreSQL connection strings (e.g., from Neon Tech).
    Converts postgres:// or postgresql:// to postgresql+psycopg2:// for SQLAlchemy.
    Cleans up optional query params that some psycopg2 versions flag.
    """
    if not url:
        return url
    trimmed = url.strip()
    
    # Clean channel_binding parameter if present for psycopg2 compatibility
    trimmed = trimmed.replace('&channel_binding=require', '').replace('?channel_binding=require&', '?').replace('?channel_binding=require', '')
    
    if trimmed.startswith("postgres://"):
        return trimmed.replace("postgres://", "postgresql+psycopg2://", 1)
    if trimmed.startswith("postgresql://") and not trimmed.startswith("postgresql+psycopg2://"):
        return trimmed.replace("postgresql://", "postgresql+psycopg2://", 1)
    return trimmed

def create_db_engine():
    """
    Initializes SQLAlchemy database engine.
    Supports Neon Cloud PostgreSQL with automatic SSL and connection pooling.
    """
    raw_url = settings.DATABASE_URL
    is_sqlite = "sqlite" in raw_url.lower()

    if not is_sqlite:
        db_url = normalize_database_url(raw_url)
        is_neon = "neon.tech" in db_url.lower()
        masked_host = db_url.split("@")[-1] if "@" in db_url else "database"
        logger.info(f"Connecting to PostgreSQL [{'Neon Cloud' if is_neon else 'Local/Network'}]: {masked_host}")

        connect_args = {"connect_timeout": 8}
        if is_neon or "sslmode=require" in db_url:
            connect_args["sslmode"] = "require"

        try:
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args=connect_args
            )
            # Verify live connection ping
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info(f"Successfully connected to PostgreSQL ({'Neon Cloud DB' if is_neon else 'Standard PostgreSQL'}).")
            return engine, ("Neon Cloud PostgreSQL" if is_neon else "PostgreSQL")
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection failed ({e}). "
                f"Falling back to local SQLite: {settings.SQLITE_FALLBACK_URL}"
            )

    # Fallback to local SQLite engine
    fallback_engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False}
    )
    logger.info("Using SQLite database engine.")
    return fallback_engine, "SQLite (Fallback)"

engine, ACTIVE_DB_TYPE = create_db_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency yielding a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
