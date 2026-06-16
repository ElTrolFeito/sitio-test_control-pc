CREATE TABLE wake_commands (
    id UUID PRIMARY KEY,

    managed_pc_id UUID NOT NULL
        REFERENCES managed_pcs(id),

    action VARCHAR(20) NOT NULL,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    completed_at TIMESTAMP
);