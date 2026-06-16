package com.wedgedbeaver.sitiopc.device;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;
import com.wedgedbeaver.sitiopc.user.User;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findBySerial(String serial);
    Optional<Device> findByIdAndUser(UUID id, User user);
    List<Device> findByUser(User user);
}