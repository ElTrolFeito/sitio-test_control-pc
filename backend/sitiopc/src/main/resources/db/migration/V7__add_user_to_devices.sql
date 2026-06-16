ALTER TABLE devices
ADD COLUMN user_id UUID;

ALTER TABLE devices
ADD CONSTRAINT fk_devices_user
FOREIGN KEY (user_id)
REFERENCES users(id);