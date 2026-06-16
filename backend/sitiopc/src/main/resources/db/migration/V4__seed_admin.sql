CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (
    id,
    username,
    password_hash,
    enabled
)
VALUES (
    gen_random_uuid(),
    'admin',
    '$2a$10$RlcXCetMCHSheTRusgbt/OSnzjkP.j5IebJ9rHTJreZMHqzTzqnS2',
    TRUE
);