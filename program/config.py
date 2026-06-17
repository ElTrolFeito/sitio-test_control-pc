import os
from pathlib import Path

CONFIG_DIR = Path.home() / ".config" / "sitiopc-agent"
CONFIG_FILE = CONFIG_DIR / "config.json"


def ensure_config_dir():
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def get_default_server_url():
    return os.environ.get("SITIOPC_SERVER", "http://localhost:8081")


def get_poll_interval():
    val = os.environ.get("SITIOPC_POLL_INTERVAL", "10")
    try:
        return max(5, int(val))
    except ValueError:
        return 10
