package com.wedgedbeaver.sitiopc.pc;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.wedgedbeaver.sitiopc.device.Device;
import com.wedgedbeaver.sitiopc.device.DeviceRepository;
import com.wedgedbeaver.sitiopc.user.User;
import com.wedgedbeaver.sitiopc.user.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pcs")
public class ManagedPcController {

    private final ManagedPcRepository managedPcRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;

    public ManagedPcController(
            ManagedPcRepository managedPcRepository,
            DeviceRepository deviceRepository,
            UserRepository userRepository) {

        this.managedPcRepository = managedPcRepository;
        this.deviceRepository = deviceRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ManagedPc>> listPcs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
        return ResponseEntity.ok(managedPcRepository.findByDevice_User(user));
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<ManagedPc>> listByDevice(
            @PathVariable UUID deviceId) {
        return ResponseEntity.ok(
                managedPcRepository.findByDeviceId(deviceId));
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<ManagedPc> createPc(
            @RequestBody CreatePcRequest request) {

        Device existingDevice = deviceRepository.findById(request.getDeviceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El dispositivo no existe"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuario no encontrado"));

        if (existingDevice.getUser() == null ||
                !existingDevice.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permisos para utilizar este dispositivo");
        }

        ManagedPc pc = new ManagedPc();
        pc.setId(UUID.randomUUID());
        pc.setDevice(existingDevice);
        pc.setName(request.getName());
        pc.setMacAddress(request.getMacAddress());
        pc.setBroadcastIp(request.getBroadcastIp());
        pc.setEnabled(true);
        pc.setCreatedAt(LocalDateTime.now());

        ManagedPc saved = managedPcRepository.save(pc);
        return ResponseEntity.ok(saved);
    }
}
