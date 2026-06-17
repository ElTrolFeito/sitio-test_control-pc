package com.wedgedbeaver.sitiopc.admin;

import com.wedgedbeaver.sitiopc.auth.JwtService;
import com.wedgedbeaver.sitiopc.command.WakeCommand;
import com.wedgedbeaver.sitiopc.command.WakeCommandRepository;
import com.wedgedbeaver.sitiopc.device.Device;
import com.wedgedbeaver.sitiopc.device.DeviceRepository;
import com.wedgedbeaver.sitiopc.pc.ManagedPc;
import com.wedgedbeaver.sitiopc.pc.ManagedPcRepository;
import com.wedgedbeaver.sitiopc.user.User;
import com.wedgedbeaver.sitiopc.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final ManagedPcRepository managedPcRepository;
    private final WakeCommandRepository wakeCommandRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminController(UserRepository userRepository,
                           DeviceRepository deviceRepository,
                           ManagedPcRepository managedPcRepository,
                           WakeCommandRepository wakeCommandRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.managedPcRepository = managedPcRepository;
        this.wakeCommandRepository = wakeCommandRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("enabled", u.getEnabled());
            map.put("role", u.getRole());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String role = request.getOrDefault("role", "USER");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEnabled(true);
        user.setRole(role.toUpperCase());

        User saved = userRepository.save(user);

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", saved.getId());
        map.put("username", saved.getUsername());
        map.put("enabled", saved.getEnabled());
        map.put("role", saved.getRole());
        return ResponseEntity.ok(map);
    }

    // Devices
    @GetMapping("/devices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllDevices() {
        List<Device> devices = deviceRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Device d : devices) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", d.getId());
            map.put("name", d.getName());
            map.put("serial", d.getSerial());
            map.put("enabled", d.getEnabled());
            map.put("lastSeen", d.getLastSeen());
            map.put("createdAt", d.getCreatedAt());
            map.put("userId", d.getUser() != null ? d.getUser().getId() : null);
            map.put("username", d.getUser() != null ? d.getUser().getUsername() : null);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/devices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDevice(@PathVariable UUID id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));
        deviceRepository.delete(device);
        return ResponseEntity.ok(Map.of("message", "Device deleted"));
    }

    // PCs
    @GetMapping("/pcs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllPcs() {
        List<ManagedPc> pcs = managedPcRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (ManagedPc pc : pcs) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", pc.getId());
            map.put("name", pc.getName());
            map.put("macAddress", pc.getMacAddress());
            map.put("broadcastIp", pc.getBroadcastIp());
            map.put("enabled", pc.getEnabled());
            map.put("createdAt", pc.getCreatedAt());
            map.put("deviceId", pc.getDeviceId());
            map.put("deviceName", pc.getDevice() != null ? pc.getDevice().getName() : null);
            map.put("userId", pc.getDevice() != null && pc.getDevice().getUser() != null ? pc.getDevice().getUser().getId() : null);
            map.put("username", pc.getDevice() != null && pc.getDevice().getUser() != null ? pc.getDevice().getUser().getUsername() : null);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/pcs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePc(@PathVariable UUID id) {
        ManagedPc pc = managedPcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PC not found"));
        managedPcRepository.delete(pc);
        return ResponseEntity.ok(Map.of("message", "PC deleted"));
    }

    // Admin wake command
    @PostMapping("/commands/wake")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminWakeCommand(@RequestBody Map<String, Object> request) {
        Object pcIdObj = request.get("managedPcId");
        if (pcIdObj == null) {
            return ResponseEntity.badRequest().body("managedPcId is required");
        }
        UUID pcId = UUID.fromString(pcIdObj.toString());

        ManagedPc pc = managedPcRepository.findById(pcId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PC not found"));

        WakeCommand command = new WakeCommand();
        command.setId(UUID.randomUUID());
        command.setManagedPc(pc);
        command.setAction("WAKE_ON_LAN");
        command.setStatus("PENDING");
        command.setCreatedAt(LocalDateTime.now());
        command.setCompletedAt(null);

        WakeCommand saved = wakeCommandRepository.save(command);
        return ResponseEntity.ok(saved);
    }
}
