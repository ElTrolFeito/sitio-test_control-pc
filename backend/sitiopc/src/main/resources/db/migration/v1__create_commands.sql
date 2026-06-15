CREATE TABLE commands (
    id UUID PRIMARY KEY,
    device_id UUID REFERENCES devices(id),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMP
);