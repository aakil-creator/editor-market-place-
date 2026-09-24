#!/usr/bin/env python3
"""Test: does catch-all route intercept root?"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.responses import FileResponse
import pathlib, uvicorn

STATIC_DIR = pathlib.Path(r'C:\Users\Aaqil\EditorMarketplace\backend\app\static')

app = FastAPI()

@app.get('/')
async def root():
    f = STATIC_DIR / 'index.html'
    msg = f'ROOT: {f}, exists={f.exists()}'
    print(msg, flush=True)
    return FileResponse(f)

# REGISTER catch-all AFTER root
@app.get('/{full_path:path}')
async def catch_all(full_path: str):
    f = STATIC_DIR / full_path
    msg = f'CATCH: path={repr(full_path)}, file={f}, is_file={f.is_file()}'
    print(msg, flush=True)
    if f.is_file():
        return FileResponse(f)
    return FileResponse(STATIC_DIR / 'index.html')

print('Starting on 127.0.0.1:9984...', flush=True)
uvicorn.run(app, host='127.0.0.1', port=9984, log_level='info')