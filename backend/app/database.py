import os
import pathlib
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = pathlib.Path(__file__).parent.parent / "editor_marketplace.db"
DEFAULT_DB_URL = f"sqlite:///{DB_PATH.resolve().as_posix()}"
DATABASE_URL = os.getenv('DATABASE_URL', DEFAULT_DB_URL)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 60.0}
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA busy_timeout=60000")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

