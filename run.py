import os
import sys

# Ensure backend directory is in python search path
backend_path = os.path.join(os.path.dirname(__file__), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
