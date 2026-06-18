import json
import time
from pathlib import Path
from urllib.parse import urljoin

import requests

from config import CONFIG_FILE, ensure_config_dir, get_default_server_url


class ApiClient:
    def __init__(self, base_url=None):
        self.base_url = base_url or get_default_server_url()
        self.token = None
        self.device_id = None
        self._load_config()

    def _load_config(self):
        if CONFIG_FILE.exists():
            data = json.loads(CONFIG_FILE.read_text())
            self.token = data.get("token")
            self.device_id = data.get("device_id")

    def _save_config(self, extra=None):
        ensure_config_dir()
        # Read existing config so we don't overwrite keys we don't own (e.g. username/password)
        data = {}
        if CONFIG_FILE.exists():
            try:
                data = json.loads(CONFIG_FILE.read_text())
            except (json.JSONDecodeError, OSError):
                pass
        data["token"] = self.token
        data["device_id"] = self.device_id
        data["base_url"] = self.base_url
        if extra:
            data.update(extra)
        CONFIG_FILE.write_text(json.dumps(data, indent=2))

    def _request(self, method, path, json_data=None, auth=True):
        url = urljoin(self.base_url, path)
        headers = {"Content-Type": "application/json"}
        if auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        try:
            resp = requests.request(method, url, headers=headers, json=json_data, timeout=30)
            return resp
        except requests.RequestException as e:
            print(f"[ERROR] Request failed: {e}")
            return None

    def login(self, username, password):
        resp = self._request("POST", "/auth/login", {"username": username, "password": password}, auth=False)
        if resp is None:
            return False
        if resp.status_code == 200:
            data = resp.json()
            self.token = data.get("token")
            self._save_config()
            return True
        print(f"[ERROR] Login failed: {resp.status_code} {resp.text}")
        return False

    def register_device(self, name, serial):
        resp = self._request("POST", "/api/devices/register", {"name": name, "serial": serial})
        if resp is None:
            return None
        if resp.status_code == 200:
            data = resp.json()
            self.device_id = data.get("deviceId")
            self._save_config()
            return data
        print(f"[ERROR] Device registration failed: {resp.status_code} {resp.text}")
        return None
    def get_pending_commands(self):
        if not self.device_id:
            print("[ERROR] No device_id configured.")
            return []
        resp = self._request("GET", f"/api/commands/device/{self.device_id}")
        if resp is None:
            return []
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 401:
            print("[WARN] Token expired or invalid.")
            return []
        print(f"[ERROR] Failed to fetch commands: {resp.status_code} {resp.text}")
        return []

    def complete_command(self, command_id):
        resp = self._request("POST", f"/api/commands/{command_id}/complete")
        if resp is None:
            return False
        if resp.status_code == 200:
            return True
        print(f"[ERROR] Failed to complete command: {resp.status_code} {resp.text}")
        return False
