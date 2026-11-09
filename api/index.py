import sys
import os
from pathlib import Path

# Add vendor packages and backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
pkg_dir = root_dir / ".vercel_python_packages"
if pkg_dir.exists() and str(pkg_dir) not in sys.path:
    sys.path.insert(0, str(pkg_dir))

backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app as fastapi_app

# Prefix middleware: ensures /api routes match whether Vercel preserves or strips /api
class ApiPrefixMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if not path.startswith("/api"):
                scope["path"] = "/api" + path
        await self.app(scope, receive, send)

app = ApiPrefixMiddleware(fastapi_app)
