import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

# Read token only on the backend - never expose in responses or logs
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
if GITHUB_TOKEN.startswith("github_pat_") or GITHUB_TOKEN.startswith("ghp_"):
    pass
elif "=" in GITHUB_TOKEN:
    GITHUB_TOKEN = GITHUB_TOKEN.split("=", 1)[1].strip()

# Database
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "trustlens_db")
PORT = int(os.getenv("PORT", "8000"))

# External Threat Intelligence APIs
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "").strip()
GOOGLE_SAFE_BROWSING_API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "").strip()
URLHAUS_API_KEY = os.getenv("URLHAUS_API_KEY", "").strip()
OPENPHISH_API_KEY = os.getenv("OPENPHISH_API_KEY", "").strip()

# Google Gemini API Settings (Configurable AI Report Refinement)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest").strip()

# ML Model Toggles
ENABLE_URLBERT = os.getenv("ENABLE_URLBERT", "true").lower() == "true"
ENABLE_DISTILBERT = os.getenv("ENABLE_DISTILBERT", "true").lower() == "true"
ENABLE_CLASSICAL_MODEL = os.getenv("ENABLE_CLASSICAL_MODEL", "true").lower() == "true"

# AI Investigation Settings
ENABLE_AI_ANALYSIS = os.getenv("ENABLE_AI_ANALYSIS", "true").lower() == "true"
AI_MODEL_NAME = os.getenv("AI_MODEL_NAME", "Qwen/Qwen2.5-3B-Instruct")
AI_MODEL_PROVIDER = os.getenv("AI_MODEL_PROVIDER", "heuristic_fallback")

# Security Settings
FETCH_TIMEOUT_SECONDS = float(os.getenv("FETCH_TIMEOUT_SECONDS", "6.0"))
MAX_RESPONSE_BYTES = int(os.getenv("MAX_RESPONSE_BYTES", "2097152"))

# Scan Limits
MAX_REPO_SIZE_KB = 100 * 1024  # 100 MB limit
MAX_FILES_TO_SCAN = 60
MAX_SINGLE_FILE_SIZE_BYTES = 250 * 1024  # 250 KB
MAX_HISTORY_COMMITS = 10

# Ignored binary or generated extensions
IGNORED_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.mp4', '.webm', '.mov', '.mp3', '.wav',
    '.zip', '.tar', '.gz', '.tgz', '.rar', '.7z',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.exe', '.dll', '.so', '.dylib', '.bin', '.iso',
    '.pyc', '.pyo', '.pyd', '.class',
}

IGNORED_DIRECTORIES = {
    'node_modules', 'dist', 'build', '.git', '.github',
    'vendor', 'venv', '.venv', '__pycache__', 'coverage',
    '.next', '.nuxt', 'target', 'bin', 'obj'
}
