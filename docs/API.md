# SitioPC API Documentation

## Authentication

All endpoints (except `POST /auth/login`) require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": "username"
}
```

---

### Devices

#### GET /api/devices

List all devices belonging to the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "serial": "string",
    "enabled": true,
    "lastSeen": "2024-01-01T00:00:00",
    "createdAt": "2024-01-01T00:00:00"
  }
]
```

#### POST /api/devices/register

Register a new device for the authenticated user.

**Request Body:**
```json
{
  "name": "string",
  "serial": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "token": "device-token"
}
```

---

### PCs (Managed PCs)

#### GET /api/pcs

List all PCs linked to the authenticated user's devices.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "macAddress": "00:11:22:33:44:55",
    "broadcastIp": "192.168.1.255",
    "enabled": true,
    "createdAt": "2024-01-01T00:00:00",
    "deviceId": "uuid"
  }
]
```

#### POST /api/pcs

Create a new PC linked to a device.

**Request Body:**
```json
{
  "deviceId": "uuid",
  "name": "string",
  "macAddress": "00:11:22:33:44:55",
  "broadcastIp": "192.168.1.255"
}
```

---

### Commands (Wake On LAN)

#### POST /api/commands/wake

Send a Wake On LAN command to a PC.

**Request Body:**
```json
{
  "managedPcId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "action": "WAKE_ON_LAN",
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00"
}
```

#### GET /api/commands/device/{deviceId}

Get pending commands for a device (used by the IoT device).

#### POST /api/commands/{commandId}/complete

Mark a command as completed (used by the IoT device).

---

## Security Notes

- All endpoints that modify or return user-specific data enforce ownership checks via JWT token
- Devices are linked to users — devices or PCs cannot be accessed by another user
- The device token returned on registration is used by the IoT device for authentication
