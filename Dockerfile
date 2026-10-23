# Adaptive Quant — paper-trading research server (no exchange keys, no live orders).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AQ_HOST=0.0.0.0 \
    AQ_DB_PATH=/data/adaptive_quant.db

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY aq ./aq
COPY web ./web
COPY scripts ./scripts

# The experience ledger lives on a persistent volume mounted at /data.
# Runs as root so platform-mounted volumes (owned by root) are writable without extra setup.
RUN mkdir -p /data
VOLUME /data
EXPOSE 8000

HEALTHCHECK --interval=60s --timeout=5s --start-period=40s --retries=3 \
  CMD python -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/healthz' % (os.environ.get('AQ_PORT') or os.environ.get('PORT') or '8000'), timeout=4)"

CMD ["python", "-m", "aq"]
