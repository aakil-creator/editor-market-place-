#!/usr/bin/env python3
"""Debug the root route 500 error."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pathlib

app = FastAPI()
api_app = FastAPI()
api_app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.mount('/api', api_app)

STATIC_DIR = pathlib.Path('/c/Users/Aaqil/EditorMarketplace/backend/app/static')
print(f'STATIC_DIR: {STATIC_DIR}', file=sys.stderr)
print(f'index.html exists: {(STATIC_DIR / "index.html").exists()}', file=sys.stderr)
print(f'app.js exists: {(STATIC_DIR / "app.js").exists()}', file=sys.stderr)

@app.get('/')
async def root():
    print(f'ROOT CALLED: STATIC_DIR={STATIC_DIR}', file=sys.stderr)
    print(f'index exists: {(STATIC_DIR / "index.html").exists()}', file=sys.stderr)
    try:
        resp = FileResponse(STATIC_DIR / 'index.html')
        print(f'FileResponse created OK', file=sys.stderr)
        return resp
    except Exception as e:
        print(f'FileResponse ERROR: {e}', file=sys.stderr)
        raise

@app.get('/{full_path:path}')
async def spa_fallback(full_path: str):
    file_path = STATIC_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    return FileResponse(STATIC_DIR / 'index.html')

import uvicorn
print('Starting server on port 9993...', file=sys.stderr)
uvicorn.run(app, host='127.0.0.1', port=9993, log_level='debug')
