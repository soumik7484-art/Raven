import os
from dotenv import load_dotenv

load_dotenv()

# Read token only on the backend - never expose in responses or logs
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
# Handle potential leading "GITHUB_TOKEN=" or whitespace if copied directly
if GITHUB_TOKEN.startswith("github_pat_") or GITHUB_TOKEN.startswith("ghp_"):
    pass
elif "=" in GITHUB_TOKEN:
    GITHUB_TOKEN = GITHUB_TOKEN.split("=", 1)[1].strip()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "hackmatrix_db")
PORT = int(os.getenv("PORT", "8000"))

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
