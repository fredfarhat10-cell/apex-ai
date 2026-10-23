"""python -m aq  -> starts the dashboard/API on http://127.0.0.1:8000"""
import os

import uvicorn

from aq.api import create_app

if __name__ == "__main__":
    port = int(os.environ.get("AQ_PORT") or os.environ.get("PORT") or "8000")  # PORT: set by Render/Railway
    uvicorn.run(create_app(), host=os.environ.get("AQ_HOST", "127.0.0.1"), port=port, log_config=None,
                proxy_headers=True, forwarded_allow_ips="*")
