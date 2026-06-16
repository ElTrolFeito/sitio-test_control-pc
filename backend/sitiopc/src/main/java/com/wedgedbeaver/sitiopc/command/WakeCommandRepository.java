package com.wedgedbeaver.sitiopc.command;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WakeCommandRepository extends JpaRepository<WakeCommand, UUID> {
    List<WakeCommand> findByManagedPc_DeviceIdAndStatus(UUID deviceId, String status);
}