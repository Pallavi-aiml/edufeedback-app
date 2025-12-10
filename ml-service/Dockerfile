# ml-service/Dockerfile

# Use a lightweight Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 5001

# Run Gunicorn server (binding to 0.0.0.0 is crucial for Docker)
# We use 'sh -c' to ensure the $PORT variable is read correctly if set by the cloud provider
CMD gunicorn --bind 0.0.0.0:$PORT app:app