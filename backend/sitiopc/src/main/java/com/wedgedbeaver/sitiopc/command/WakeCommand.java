package com.wedgedbeaver.sitiopc.command;

import com.wedgedbeaver.sitiopc.pc.ManagedPc;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "wake_commands")
public class WakeCommand {

    @Id
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "managed_pc_id")
    private ManagedPc managedPc;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}