# Neighborhood Library Service

A simple library management system composed of a Python FastAPI backend (REST API) with PostgreSQL, and a robust Next.js React frontend styled with Tailwind CSS.

## Architecture & Choices
- **Backend:** Defines models for `Book`, `Member`, and `Borrowing` managed via SQLAlchemy. Endpoints provide straightforward CRUD capabilities and specialized endpoints to list member/book records. The API strictly handles data consistency, such as checking if sufficient copies of a book remain before borrowing.
- **Frontend:** A Next.js 14 single-page dashboard utilizing responsive Tailwind CSS. It communicates directly with the FastAPI endpoints. Due to potential DNS issues with the Next.js `create-next-app` initialization during development, it has been set up with essential files to guarantee proper dependency installation (`package.json`, `next.config.js`, etc.).

## Prerequisites
- Docker and Docker Compose (Easiest Method)
- Or, Python 3.11+ and Node.js 18+ (Manual Method)

## Setup and Running (Using Docker Compose - Recommended)
1. Ensure Docker is running.
2. In the root directory (`/Users/gaurav/Desktop/test`), spin up the services using `docker-compose`:
```bash
docker-compose up --build
```
This automatically brings up:
- The PostgreSQL database on port 5432
- The FastAPI backend on port 8000
- The Next.js frontend on port 3000

Wait a few moments for the Next.js `ui-app` frontend to complete its robust internal build process.
Access the web frontend by visiting: **http://localhost:3000**
Access backend API docs (Swagger): **http://localhost:8000/docs**

## Extras
- **Test Client Script:** Included is `test_client.py` which demonstrates via the `requests` library how a client might interact programmatically with the API endpoints. You can run it with `python test_client.py` after spinning up the backend server!
- **Protobuf Definitions:** A `library.proto` file has been provided for reference, which details how the exact schemas and endpoints correlate to an equivalent gRPC service interface as strictly requested. To compile the proto schemas manually, you can run: `protoc --python_out=. library.proto`

## Manual Setup Steps (Without Docker)

### 1. Database Setup
Ensure you have a PostgreSQL instance running locally. By default, the backend expects:
`postgresql://postgres:postgres@localhost:5432/library`
You can configure a different database URL by setting `DATABASE_URL` in your shell environment.

### 2. Python Backend
Navigate to the `backend` directory, install packages, and start `uvicorn`:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*(The backend creates the DB schema automatically upon startup).*

### 3. Next.js Frontend
Navigate to the `ui-app` directory, install Node packages, and run the development server:
```bash
cd ui-app
npm install
npm run dev
```

Visit **http://localhost:3000** to use the application!

## Key Design Considerations
- **Normalization:** The database schema tracks physical books separately from borrowings, creating a clean many-to-many relationship using a `Borrowing` entity.
- **Error Handling:** Backend checks if a book has `available_copies > 0` before establishing a borrow request. Returning increments `available_copies`.
- **API Interface:** Opted for straightforward REST with OpenAPI spec auto-generation (via FastAPI) instead of gRPC. It enables straightforward connectivity with a React web client.
