package com.wedgedbeaver.sitiopc.device;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.wedgedbeaver.sitiopc.user.User;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "devices")
public class Device {

    @Id
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String serial;

    @Column(name = "token_hash", nullable = false)
    @JsonIgnore
    private String tokenHash;

    @Column(nullable = false)
    private Boolean enabled;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}