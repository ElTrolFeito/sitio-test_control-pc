# SitioPC Agent

A lightweight Python agent for Raspberry Pi Zero W (and other Linux devices) that connects to the SitioPC server, polls for Wake On LAN commands, and executes them on your local network.

## Features

- **Device Registration** — Register your Raspberry Pi as a managed device linked to your user account
- **Command Polling** — Polls the server every 10 seconds for pending WOL commands
- **Wake On LAN** — Sends magic packets to wake up PCs on your local network
- **Auto-login** — Re-authenticates automatically when the JWT token expires
- **Systemd Service** — Run as a background service on your Raspberry Pi
- **Minimal Dependencies** — Only requires `requests` (Python standard library handles WOL)

## Requirements

- Python 3.7+
- Raspberry Pi Zero W (or any Linux device with Python and network access)
- SitioPC server running and accessible
- A user account on the SitioPC server

## Installation

1. Install the required dependency:
   ```bash
   pip3 install requests
   ```
   Or use the requirements file:
   ```bash
   pip3 install -r requirements.txt
   ```

2. Run the setup to register your device:
   ```bash
   python3 main.py --setup
   ```
   You will be prompted for:
   - Your SitioPC username and password
   - A name for this device (e.g., "Raspberry Pi Zero W")
   - A serial number (auto-generated if left blank)

3. Start the agent:
   ```bash
   python3 main.py
   ```

## Configuration

The agent stores its configuration in `~/.config/sitiopc-agent/config.json`.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITIOPC_SERVER` | `http://localhost:8081` | URL of the SitioPC server |
| `SITIOPC_POLL_INTERVAL` | `10` | Polling interval in seconds (minimum 5) |

## Running as a Systemd Service

1. Copy the service file:
   ```bash
   sudo cp sitiopc-agent.service /etc/systemd/system/
   ```

2. Edit the service file to match your setup:
   ```bash
   sudo nano /etc/systemd/system/sitiopc-agent.service
   ```
   Update the `WorkingDirectory`, `ExecStart`, `User`, and `Environment` variables.

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sitiopc-agent
   sudo systemctl start sitiopc-agent
   ```

4. Check status and logs:
   ```bash
   sudo systemctl status sitiopc-agent
   sudo journalctl -u sitiopc-agent -f
   ```

## How It Works

1. **Authentication** — The agent logs in as the user who registered the device. It stores the JWT token locally.
2. **Registration** — A device is created on the server and linked to that user. The device ID is saved locally.
3. **Polling Loop** — Every 10 seconds, the agent asks the server for pending commands for this device.
4. **Command Execution** — When a WOL command is received, the agent sends a magic packet to the target PC's MAC address via the broadcast IP.
5. **Completion** — After sending the WOL packet, the agent marks the command as completed on the server.

## Files

| File | Description |
|------|-------------|
| `main.py` | Entry point. Handles setup, CLI arguments, and the main polling loop |
| `api_client.py` | HTTP client for the SitioPC REST API |
| `wol.py` | Wake On LAN magic packet sender |
| `config.py` | Configuration and environment helpers |
| `requirements.txt` | Python dependencies |
| `sitiopc-agent.service` | Systemd service template |

## Troubleshooting

- **"Login failed"** — Check your username and password. Ensure the server URL is correct.
- **"No device_id configured"** — Run the setup again with `python3 main.py --setup`.
- **WOL not working** — Verify the PC is configured for Wake On LAN in BIOS/UEFI and the network card supports it.
- **Connection refused** — Check that the SitioPC server is running and accessible from the Raspberry Pi.

## License

This is part of the SitioPC open-source project. See the root `LICENSE` file for details.
