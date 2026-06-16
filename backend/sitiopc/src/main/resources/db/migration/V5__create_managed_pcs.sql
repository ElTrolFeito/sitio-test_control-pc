CREATE TABLE managed_pcs (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id),

    name VARCHAR(100) NOT NULL,

    mac_address VARCHAR(17) NOT NULL,

    broadcast_ip VARCHAR(45) NOT NULL,

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);