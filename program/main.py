#!/usr/bin/env python3
"""
SitioPC Agent — Raspberry Pi Zero W compatible
Polls for Wake On LAN commands from the SitioPC server and executes them.
"""

import argparse
import json
import sys
import time
from uuid import uuid4

from api_client import ApiClient
from config import CONFIG_FILE, ensure_config_dir, get_default_server_url, get_poll_interval
from wol import send_wol_packet


def load_or_create_config():
    ensure_config_dir()
    if not CONFIG_FILE.exists():
        return {}
    return json.loads(CONFIG_FILE.read_text())


def save_config(data):
    ensure_config_dir()
    CONFIG_FILE.write_text(json.dumps(data, indent=2))


def setup_device(api):
    print("\n[SETUP] Device Registration")
    print("This agent needs a user account on the SitioPC server.")
    username = input("Username: ").strip()
    password = input("Password: ").strip()
    if not username or not password:
        print("[ERROR] Username and password are required.")
        return False

    if not api.login(username, password):
        return False
    print("[OK] Logged in successfully.")

    device_name = input("Device name (e.g., 'Raspberry Pi Zero W'): ").strip() or "SitioPC Agent"
    serial = input("Device serial (leave blank for auto-generated): ").strip()
    if not serial:
        serial = f"rpi-{uuid4().hex[:12]}"
        print(f"[INFO] Auto-generated serial: {serial}")

    result = api.register_device(device_name, serial)
    if result:
        print(f"[OK] Device registered. ID: {result.get('deviceId')}")
        # Persist all setup data — use _save_config with extra so it merges
        # with the token/device_id already written by login+register_device.
        api._save_config(extra={
            "username": username,
            "password": password,
            "device_name": device_name,
            "serial": serial,
        })
        return True
    return False


def run_agent(api):
    cfg = load_or_create_config()
    poll_interval = get_poll_interval()
    print(f"[AGENT] Starting. Polling every {poll_interval}s.")
    print(f"[AGENT] Device ID: {api.device_id}")
    print(f"[AGENT] Server: {api.base_url}")
    print("[AGENT] Press Ctrl+C to stop.\n")

    while True:
        commands = api.get_pending_commands()
        if commands:
            for cmd in commands:
                cmd_id = cmd.get("id")
                pc = cmd.get("managedPc", {})
                mac = pc.get("macAddress")
                broadcast = pc.get("broadcastIp")
                pc_name = pc.get("name", "Unknown")
                action = cmd.get("action")

                print(f"[COMMAND] {action} for PC '{pc_name}' (MAC: {mac}, Broadcast: {broadcast})")

                if action == "WAKE_ON_LAN" and mac and broadcast:
                    success = send_wol_packet(mac, broadcast)
                    if success:
                        api.complete_command(cmd_id)
                        print(f"[OK] Command {cmd_id} completed.")
                    else:
                        print(f"[WARN] WOL failed for command {cmd_id}.")
                else:
                    print(f"[WARN] Unknown action or missing data: {action}")
        else:
            print("[POLL] No pending commands.")

        time.sleep(poll_interval)


def main():
    parser = argparse.ArgumentParser(description="SitioPC Agent")
    parser.add_argument("--setup", action="store_true", help="Run device setup/registration")
    parser.add_argument("--server", default=get_default_server_url(), help="SitioPC server URL")
    args = parser.parse_args()

    cfg = load_or_create_config()
    base_url = args.server or cfg.get("base_url", "https://backend-sitiopc-pablo.up.railway.app")
    api = ApiClient(base_url=base_url)

    if args.setup:
        if setup_device(api):
            print("[OK] Setup complete. Run without --setup to start the agent.")
        else:
            print("[ERROR] Setup failed.")
            sys.exit(1)
        return

    if not api.device_id or not api.token:
        print("[ERROR] Agent not configured. Run with --setup first.")
        sys.exit(1)

    # If credentials are stored, try auto-login on token expiry
    if cfg.get("username") and cfg.get("password"):
        api.login(cfg["username"], cfg["password"])

    try:
        run_agent(api)
    except KeyboardInterrupt:
        print("\n[AGENT] Stopped.")
        sys.exit(0)


if __name__ == "__main__":
    main()
