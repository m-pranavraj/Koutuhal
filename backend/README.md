# Koutuhal Pathways Backend API

## Tech Stack
-   **Language**: Python 3.11+
-   **Framework**: FastAPI
-   **Database**: PostgreSQL
-   **ORM**: SQLAlchemy 2.0 (Async)
-   **Migrations**: Alembic
-   **Auth**: JWT (OAuth2 Password Bearer)

## Setup

1.  **Create Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `backend/` directory:
    ```env
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password
    POSTGRES_SERVER=localhost
    POSTGRES_DB=koutuhal_db
    SECRET_KEY=your_secret_key_here
    ```

4.  **Run Migrations**:
    ```bash
    alembic upgrade head
    ```

5.  **Start Server**:
    ```bash
    uvicorn app.main:app --reload
    ```

## Project Structure
```
backend/
  app/
    main.py           # Entry point
    core/             # Config, DB, Security
    api/              # Routes
    models/           # DB Models
    schemas/          # Pydantic Models
    services/         # Business Logic
  alembic/            # Migrations
```

## Health Check
-   GET `/health`: Returns `{"status": "ok"}`
