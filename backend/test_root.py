#!/usr/bin/env python3
"""Minimal test: does root route work?"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pathlib, uvicorn

STATIC_DIR = pathlib.Path('/c/Users/Aaqil/EditorMarketplace/backend/app/static')

app = FastAPI()
api_app = FastAPI()
api_app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.mount('/api', api_app)

@app.get('/')
async def root():
    f = STATIC_DIR / 'index.html'
    print(f'root: file={f}, exists={f.exists()}', flush=True)
    if not f.exists():
        raise HTTPException(status_code=500, detail=f'File not found: {f}')
    return FileResponse(f)

@app.get('/{full_path:path}')
async def spa_fallback(full_path: str):
    if full_path == '':
        f = STATIC_DIR / 'index.html'
        print(f'spa_fallback empty: {f}, exists={f.exists()}', flush=True)
        return FileResponse(f)
    file_path = STATIC_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    return FileResponse(STATIC_DIR / 'index.html')

print('Starting server on 127.0.0.1:9989...', flush=True)
uvicorn.run(app, host='127.0.0.1', port=9989, log_level='debug')
