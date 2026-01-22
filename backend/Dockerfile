# syntax=docker/dockerfile:1
FROM python:3.12

WORKDIR /app

# Install system dependencies (optional, full image has most)
# Removing apt-get block as full image has compiler

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -v

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
