from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from sqlalchemy import text
    from psycopg2.errors import DuplicateDatabase

    # Create a connection to the default 'postgres' database to check/create the target DB
    # We construct a temporary URL pointing to 'postgres' database
    postgres_db_url = settings.DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
    engine_postgres = create_engine(postgres_db_url)

    try:
        with engine_postgres.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            
            # Check if database exists
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{settings.POSTGRES_DB}'"))
            if not result.fetchone():
                print(f"Database {settings.POSTGRES_DB} does not exist. Creating...")
                try:
                    conn.execute(text(f"CREATE DATABASE {settings.POSTGRES_DB}"))
                    print(f"Database {settings.POSTGRES_DB} created successfully.")
                except Exception as e:
                    print(f"Error creating database: {e}")
            else:
                print(f"Database {settings.POSTGRES_DB} already exists.")
    except Exception as e:
        print(f"Could not connect to postgres system database: {e}")
    finally:
        engine_postgres.dispose()
        

