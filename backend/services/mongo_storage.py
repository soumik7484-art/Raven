import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import motor.motor_asyncio
from config import MONGODB_URI, MONGODB_DB_NAME

class MongoStorage:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False
        self._memory_store: Dict[str, Dict[str, Any]] = {}
        self._connect_task = None

    async def connect(self):
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=2000
            )
            # Ping
            await self.client.admin.command('ping')
            self.db = self.client[MONGODB_DB_NAME]
            self.is_connected = True
            
            # Create indexes
            await self.db.github_scans.create_index("scan_id", unique=True)
            await self.db.github_scans.create_index("created_at")
            await self.db.github_reports.create_index("scan_id", unique=True)
        except Exception:
            self.is_connected = False
            self.client = None
            self.db = None

    async def save_scan_state(self, scan_id: str, data: Dict[str, Any]):
        record = {
            **data,
            "scan_id": scan_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self._memory_store[scan_id] = record
        
        if self.is_connected and self.db is not None:
            try:
                await self.db.github_scans.update_one(
                    {"scan_id": scan_id},
                    {"$set": record},
                    upsert=True
                )
            except Exception:
                pass

    async def get_scan_state(self, scan_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.github_scans.find_one({"scan_id": scan_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception:
                pass
        return self._memory_store.get(scan_id)

    async def save_report(self, scan_id: str, report: Dict[str, Any]):
        record = {
            **report,
            "scan_id": scan_id,
            "saved_at": datetime.now(timezone.utc).isoformat()
        }
        self._memory_store[f"report_{scan_id}"] = record
        
        if self.is_connected and self.db is not None:
            try:
                await self.db.github_reports.update_one(
                    {"scan_id": scan_id},
                    {"$set": record},
                    upsert=True
                )
            except Exception:
                pass

    async def get_report(self, scan_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.github_reports.find_one({"scan_id": scan_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception:
                pass
        return self._memory_store.get(f"report_{scan_id}")

    async def health_status(self) -> Dict[str, Any]:
        return {
            "status": "connected" if self.is_connected else "in_memory_fallback",
            "database": MONGODB_DB_NAME if self.is_connected else "memory_cache",
            "message": "Connected to MongoDB" if self.is_connected else "MongoDB offline; using memory fallback storage without data loss during session"
        }

storage = MongoStorage()
