package com.wedgedbeaver.sitiopc.device;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import com.wedgedbeaver.sitiopc.user.User;

@Service
public class DeviceService {

    private final DeviceRepository repository;
    private final PasswordEncoder passwordEncoder;

    public DeviceService(DeviceRepository repository,
                         PasswordEncoder passwordEncoder) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Device> findByUser(User user) {
        return repository.findByUser(user);
    }

    public RegisterDeviceResponse register(RegisterDeviceRequest request, User user) {

        Optional<Device> existing =
                repository.findBySerial(request.getSerial());

        if (existing.isPresent()) {
            throw new RuntimeException(
                    "Ya existe un dispositivo con ese serial"
            );
        }

        String rawToken =
                UUID.randomUUID().toString()
                        + UUID.randomUUID();

        Device device = new Device();

        device.setId(UUID.randomUUID());
        device.setName(request.getName());
        device.setSerial(request.getSerial());

        device.setTokenHash(
                passwordEncoder.encode(rawToken)
        );

        device.setEnabled(true);
        device.setCreatedAt(LocalDateTime.now());
        device.setLastSeen(null);
        device.setUser(user);

        repository.save(device);

        return new RegisterDeviceResponse(
                device.getId(),
                rawToken
        );
    }
}