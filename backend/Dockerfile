
# Stage 1: Builder
# Use an official Python runtime as a parent image
FROM python:3.10-slim AS builder

WORKDIR /app

# Install system dependencies required for building python packages
# (e.g., if you have packages needing compilation like psutil, hiredis, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the builder stage
COPY requirements.txt .

# Install dependencies into a user directory or specific location
# --user installs to /root/.local
RUN pip install --user --no-cache-dir -r requirements.txt


# Stage 2: Runner
# Use the same slim python image for runner
FROM python:3.10-slim AS runner

WORKDIR /app

# Install runtime system dependencies (e.g. libpq for psycopg2)
# We don't need gcc here
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder stage
COPY --from=builder /root/.local /root/.local

# Ensure the installed packages are in the PATH
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . /app/

# Make port 8000 available
EXPOSE 8000

# Run commands
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
