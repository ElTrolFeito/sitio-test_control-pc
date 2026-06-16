package com.wedgedbeaver.sitiopc.pc;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

import com.wedgedbeaver.sitiopc.device.Device;

@Getter
@Setter
@Entity
@Table(name = "managed_pcs")
public class ManagedPc {

    @Id
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "device_id")
    private Device device;

    @Column(nullable = false)
    private String name;

    @Column(name = "mac_address", nullable = false)
    private String macAddress;

    @Column(name = "broadcast_ip", nullable = false)
    private String broadcastIp;

    @Column(nullable = false)
    private Boolean enabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}