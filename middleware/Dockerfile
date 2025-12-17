FROM python:3.12.4-slim

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chmod=0644 . .

# Add the app directory to the PYTHONPATH
ENV PYTHONPATH "${PYTHONPATH}:/usr/src/app"

EXPOSE 8000

CMD ["uvicorn", "app.routes:app", "--host", "0.0.0.0", "--port", "8000"]
