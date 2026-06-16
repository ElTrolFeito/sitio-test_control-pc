package com.wedgedbeaver.sitiopc.pc;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private Device device;

    @Column(name = "device_id", insertable = false, updatable = false)
    private UUID deviceId;

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