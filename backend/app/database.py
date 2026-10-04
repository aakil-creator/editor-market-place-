import os
import shutil
import pathlib
from datetime import datetime
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = pathlib.Path(__file__).parent.parent / "editor_marketplace.db"
BACKUP_DIR = pathlib.Path(__file__).parent.parent / "backups" / "live"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

def create_database_backup():
    """Create a safe snapshot backup of the SQLite database to prevent any data loss."""
    try:
        if DB_PATH.exists() and DB_PATH.stat().st_size > 0:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            backup_file = BACKUP_DIR / f"editor_marketplace_{timestamp}.db"
            shutil.copy2(DB_PATH, backup_file)
            
            # Keep latest 25 backup snapshots, rotate older ones
            backups = sorted(BACKUP_DIR.glob("editor_marketplace_*.db"), key=os.path.getmtime)
            if len(backups) > 25:
                for old in backups[:-25]:
                    try:
                        old.unlink()
                    except Exception:
                        pass
    except Exception as e:
        print(f"[BACKUP NOTICE] Could not create database snapshot: {e}")

# Create automated backup snapshot on startup
create_database_backup()

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


