import asyncio
import re
import base64
from typing import Dict, Any, List, Optional, Tuple
import httpx
from config import (
    GITHUB_TOKEN,
    MAX_REPO_SIZE_KB,
    MAX_FILES_TO_SCAN,
    MAX_SINGLE_FILE_SIZE_BYTES,
    IGNORED_EXTENSIONS,
    IGNORED_DIRECTORIES
)

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Raven-Security-Health-Check/1.0"
        }
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"
        return headers

    def parse_github_input(self, input_str: str) -> Dict[str, Any]:
        """
        Parses user input into either a user or repository target.
        Examples:
          - 'torvalds' -> {'type': 'user', 'username': 'torvalds'}
          - 'https://github.com/torvalds' -> {'type': 'user', 'username': 'torvalds'}
          - 'torvalds/linux' -> {'type': 'repo', 'owner': 'torvalds', 'repo': 'linux'}
          - 'https://github.com/torvalds/linux' -> {'type': 'repo', 'owner': 'torvalds', 'repo': 'linux'}
        """
        cleaned = input_str.strip()
        # Remove trailing slash and .git
        cleaned = re.sub(r'/$', '', cleaned)
        cleaned = re.sub(r'\.git$', '', cleaned)

        # Match full URL
        url_match = re.match(r'^(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_\-\.]+)(?:/([a-zA-Z0-9_\-\.]+))?/?$', cleaned)
        if url_match:
            user = url_match.group(1)
            repo = url_match.group(2)
            if repo:
                return {"type": "repo", "owner": user, "repo": repo, "valid": True}
            return {"type": "user", "username": user, "valid": True}

        # Match owner/repo
        if "/" in cleaned:
            parts = cleaned.split("/")
            if len(parts) == 2 and parts[0] and parts[1]:
                return {"type": "repo", "owner": parts[0], "repo": parts[1], "valid": True}
            return {"type": "unknown", "valid": False, "error": "Invalid repository format. Use owner/repo or full GitHub URL."}

        # Match single username
        if re.match(r'^[a-zA-Z0-9_\-\.]+$', cleaned):
            return {"type": "user", "username": cleaned, "valid": True}

        return {"type": "unknown", "valid": False, "error": "Invalid GitHub target. Provide a username or repository URL."}

    async def get_user_repositories(self, username: str) -> Dict[str, Any]:
        """
        Retrieves public repositories for a given GitHub username.
        """
        url = f"{self.base_url}/users/{username}/repos?type=public&sort=updated&per_page=30"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(url, headers=self._get_headers())
                if res.status_code == 404:
                    return {"success": False, "status": 404, "error": f"GitHub user '{username}' not found."}
                if res.status_code == 403:
                    return {"success": False, "status": 403, "error": "GitHub API rate limit exceeded. Please wait a moment or configure GITHUB_TOKEN."}
                if res.status_code != 200:
                    return {"success": False, "status": res.status_code, "error": f"GitHub API error: HTTP {res.status_code}"}

                repos_data = res.json()
                results = []
                for r in repos_data:
                    if not r.get("private", False):
                        results.append({
                            "name": r.get("name"),
                            "full_name": r.get("full_name"),
                            "owner": r.get("owner", {}).get("login"),
                            "description": r.get("description") or "No description provided",
                            "language": r.get("language") or "Other",
                            "stars": r.get("stargazers_count", 0),
                            "forks": r.get("forks_count", 0),
                            "updated_at": r.get("updated_at"),
                            "html_url": r.get("html_url"),
                            "default_branch": r.get("default_branch", "main"),
                            "size_kb": r.get("size", 0)
                        })
                return {"success": True, "username": username, "repositories": results}
            except httpx.TimeoutException:
                return {"success": False, "status": 504, "error": "GitHub API request timed out."}
            except Exception as e:
                return {"success": False, "status": 500, "error": f"Failed to reach GitHub: {str(e)}"}

    async def get_repository_details(self, owner: str, repo: str) -> Dict[str, Any]:
        """
        Retrieves metadata and validates public accessibility.
        """
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient(timeout=12.0) as client:
            try:
                res = await client.get(url, headers=self._get_headers())
                if res.status_code == 404:
                    return {"success": False, "status": 404, "error": f"Repository '{owner}/{repo}' not found or is private."}
                if res.status_code == 403:
                    return {"success": False, "status": 403, "error": "GitHub API rate limit exceeded."}
                if res.status_code != 200:
                    return {"success": False, "status": res.status_code, "error": f"GitHub API returned HTTP {res.status_code}"}

                data = res.json()
                if data.get("private", False):
                    return {"success": False, "status": 403, "error": "Private repositories are not supported in this public security scan."}

                size_kb = data.get("size", 0)
                if size_kb > MAX_REPO_SIZE_KB:
                    return {
                        "success": False,
                        "status": 413,
                        "error": f"Repository size ({size_kb // 1024} MB) exceeds maximum allowed size ({MAX_REPO_SIZE_KB // 1024} MB)."
                    }

                return {
                    "success": True,
                    "metadata": {
                        "name": data.get("name"),
                        "full_name": data.get("full_name"),
                        "owner": data.get("owner", {}).get("login"),
                        "description": data.get("description") or "",
                        "html_url": data.get("html_url"),
                        "default_branch": data.get("default_branch", "main"),
                        "stars": data.get("stargazers_count", 0),
                        "forks": data.get("forks_count", 0),
                        "language": data.get("language") or "Code",
                        "size_kb": size_kb,
                        "open_issues": data.get("open_issues_count", 0),
                        "created_at": data.get("created_at"),
                        "updated_at": data.get("updated_at"),
                        "pushed_at": data.get("pushed_at"),
                        "visibility": "public"
                    }
                }
            except httpx.TimeoutException:
                return {"success": False, "status": 504, "error": "GitHub request timed out."}
            except Exception as e:
                return {"success": False, "status": 500, "error": str(e)}

    async def fetch_repository_files(self, owner: str, repo: str, default_branch: str) -> Dict[str, Any]:
        """
        Retrieves Git tree and loads eligible source/manifest files within configured safety limits.
        """
        tree_url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        async with httpx.AsyncClient(timeout=18.0) as client:
            try:
                res = await client.get(tree_url, headers=self._get_headers())
                if res.status_code != 200:
                    return {"success": False, "error": f"Could not fetch Git tree: HTTP {res.status_code}"}

                tree_data = res.json()
                raw_tree = tree_data.get("tree", [])

                eligible_files = []
                manifest_files = []

                for item in raw_tree:
                    if item.get("type") != "blob":
                        continue
                    path = item.get("path", "")
                    
                    # Skip ignored dirs
                    parts = path.split("/")
                    if any(p in IGNORED_DIRECTORIES for p in parts[:-1]):
                        continue

                    # Check extension
                    ext = "." + path.split(".")[-1].lower() if "." in path else ""
                    if ext in IGNORED_EXTENSIONS:
                        continue

                    size = item.get("size", 0)
                    if size > MAX_SINGLE_FILE_SIZE_BYTES:
                        continue

                    # Identify dependency manifests
                    filename = parts[-1].lower()
                    if filename in {"package.json", "package-lock.json", "requirements.txt", "pipfile.lock", "pyproject.toml", "go.mod", "cargo.lock", "pom.xml"}:
                        manifest_files.append({"path": path, "sha": item.get("sha"), "size": size})
                    else:
                        eligible_files.append({"path": path, "sha": item.get("sha"), "size": size})

                # Combine with manifest files given top priority
                prioritized = manifest_files + eligible_files
                selected_files = prioritized[:MAX_FILES_TO_SCAN]

                # Download contents asynchronously in parallel
                sem = asyncio.Semaphore(12)

                async def fetch_one(f):
                    async with sem:
                        blob_url = f"{self.base_url}/repos/{owner}/{repo}/contents/{f['path']}?ref={default_branch}"
                        try:
                            content_res = await client.get(blob_url, headers=self._get_headers(), timeout=8.0)
                            if content_res.status_code == 200:
                                c_json = content_res.json()
                                raw_content = c_json.get("content", "")
                                encoding = c_json.get("encoding", "")
                                
                                decoded_text = ""
                                if encoding == "base64":
                                    decoded_text = base64.b64decode(raw_content).decode("utf-8", errors="ignore")
                                else:
                                    decoded_text = raw_content

                                return {
                                    "path": f["path"],
                                    "content": decoded_text,
                                    "size": f["size"],
                                    "is_manifest": any(f["path"] == m["path"] for m in manifest_files)
                                }
                        except Exception:
                            return None
                    return None

                results = await asyncio.gather(*(fetch_one(f) for f in selected_files), return_exceptions=True)
                downloaded_files: List[Dict[str, Any]] = [r for r in results if isinstance(r, dict) and r is not None]

                return {
                    "success": True,
                    "total_tree_blobs": len(raw_tree),
                    "scanned_files_count": len(downloaded_files),
                    "files": downloaded_files
                }
            except Exception as e:
                return {"success": False, "error": f"Failed to retrieve files: {str(e)}"}

    async def get_recent_commits(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """
        Retrieves recent commit metadata for bounded history review.
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/commits?per_page=10"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(url, headers=self._get_headers())
                if res.status_code == 200:
                    return [
                        {
                            "sha": c.get("sha", "")[:7],
                            "message": c.get("commit", {}).get("message", "").split("\n")[0],
                            "author": c.get("commit", {}).get("author", {}).get("name", "Unknown"),
                            "date": c.get("commit", {}).get("author", {}).get("date")
                        }
                        for c in res.json()
                    ]
            except Exception:
                pass
        return []

    async def check_api_health(self) -> Dict[str, Any]:
        """
        Checks GitHub API availability and remaining rate limits.
        """
        url = f"{self.base_url}/rate_limit"
        async with httpx.AsyncClient(timeout=6.0) as client:
            try:
                res = await client.get(url, headers=self._get_headers())
                if res.status_code == 200:
                    rl = res.json().get("rate", {})
                    return {
                        "status": "available",
                        "authenticated": bool(GITHUB_TOKEN),
                        "limit": rl.get("limit", 60),
                        "remaining": rl.get("remaining", 0),
                        "reset_time": rl.get("reset")
                    }
                return {"status": "degraded", "authenticated": bool(GITHUB_TOKEN), "http_code": res.status_code}
            except Exception as e:
                return {"status": "unavailable", "authenticated": bool(GITHUB_TOKEN), "error": str(e)}

github_service = GitHubService()
