# SitioPC

**SitioPC** is an open-source web application that allows you to remotely manage IoT devices and send Wake On LAN (WOL) commands to wake up computers from anywhere. The application consists of a Spring Boot backend, a modern React frontend, and a Python agent for Raspberry Pi.

## Features

- **User Authentication** — Secure JWT-based login system
- **Device Management** — Register and manage IoT devices (e.g., Raspberry Pi Zero W)
- **PC Management** — Link computers to devices with MAC address and broadcast IP
- **Wake On LAN** — Send WOL magic packets remotely through your linked devices
- **Dark Mode** — Toggle between light and dark themes with localStorage persistence
- **Responsive Design** — Fully mobile-friendly interface
- **Toast Notifications** — Real-time feedback for all actions
- **Multi-User** — Devices and PCs are linked to individual users and cannot be shared
- **Raspberry Pi Agent** — Lightweight Python agent that listens for commands and sends WOL packets on your local network

## Architecture

The project is split into three main parts:

- **backend/** — Spring Boot REST API with JWT authentication
- **frontend/** — React SPA with Vite, Tailwind CSS, and React Router
- **program/** — Python agent for Raspberry Pi Zero W (command listener and WOL executor)

## Quick Start

### Backend

1. Ensure you have Java 17+ and Maven installed
2. Configure your database in `backend/sitiopc/src/main/resources/application.properties`
3. Run the backend:
   ```bash
   cd backend/sitiopc
   ./mvnw spring-boot:run
   ```
   The backend runs on port `8081`.

### Frontend

1. Ensure you have Node.js 18+ installed
2. Install dependencies and start the dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend runs on port `3000` and proxies API calls to the backend.

### Raspberry Pi Agent

1. On your Raspberry Pi Zero W, install the agent:
   ```bash
   cd program
   pip3 install -r requirements.txt
   python3 main.py --setup
   ```
2. Follow the prompts to register the device with your SitioPC account
3. Run the agent:
   ```bash
   python3 main.py
   ```
   For production use, run it as a systemd service (see `program/README.md`).

## Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Security (JWT)
- JPA / Hibernate
- Flyway migrations
- PostgreSQL

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Sonner (toast notifications)
- Lucide React (icons)

### Raspberry Pi Agent
- Python 3.7+
- Requests library
- Standard library (socket for WOL)

## Theme / Dark Mode

The application supports both light and dark themes. The toggle is available in the top navigation bar and on the login page. The chosen theme is saved to `localStorage` and persists across sessions.

## API Endpoints

See [docs/API.md](docs/API.md) for the full API documentation.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is open source and licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Project Status

This is a work-in-progress project. The current focus is on the Wake On LAN command flow between the web interface, IoT devices, and managed PCs.

## Author

wedgedbeaver
