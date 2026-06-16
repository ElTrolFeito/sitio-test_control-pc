package com.wedgedbeaver.sitiopc.pc;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ManagedPcRepository extends JpaRepository<ManagedPc, UUID> {

    List<ManagedPc> findByDeviceId(UUID deviceId);

}