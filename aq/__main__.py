"""python -m aq  -> starts the dashboard/API on http://127.0.0.1:8000"""
import os

import uvicorn

from aq.api import create_app

if __name__ == "__main__":
    uvicorn.run(create_app(), host=os.environ.get("AQ_HOST", "127.0.0.1"), port=int(os.environ.get("AQ_PORT", "8000")),
                log_config=None)
