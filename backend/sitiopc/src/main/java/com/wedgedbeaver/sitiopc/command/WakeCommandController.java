package com.wedgedbeaver.sitiopc.command;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.wedgedbeaver.sitiopc.pc.ManagedPc;
import com.wedgedbeaver.sitiopc.pc.ManagedPcRepository;
import com.wedgedbeaver.sitiopc.user.User;
import com.wedgedbeaver.sitiopc.user.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/commands")
public class WakeCommandController {

    private final WakeCommandRepository wakeCommandRepository;
    private final ManagedPcRepository managedPcRepository;
    private final UserRepository userRepository;

    public WakeCommandController(
            WakeCommandRepository wakeCommandRepository,
            ManagedPcRepository managedPcRepository,
            UserRepository userRepository) {
        this.wakeCommandRepository = wakeCommandRepository;
        this.managedPcRepository = managedPcRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/wake")
    public ResponseEntity<WakeCommand> sendWakeCommand(
            @RequestBody CreateWakeCommandRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuario no encontrado"));

        ManagedPc pc = managedPcRepository.findById(request.getManagedPcId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "PC no encontrada"));

        if (pc.getDevice() == null ||
                pc.getDevice().getUser() == null ||
                !pc.getDevice().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permisos para esta PC");
        }

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

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<WakeCommand>> getPendingCommands(
            @PathVariable UUID deviceId) {
        return ResponseEntity.ok(
                wakeCommandRepository.findByManagedPc_DeviceIdAndStatus(deviceId, "PENDING"));
    }

    @PostMapping("/{commandId}/complete")
    public ResponseEntity<WakeCommand> completeCommand(@PathVariable UUID commandId) {
        WakeCommand command = wakeCommandRepository.findById(commandId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Comando no encontrado"));

        command.setStatus("COMPLETED");
        command.setCompletedAt(LocalDateTime.now());
        return ResponseEntity.ok(wakeCommandRepository.save(command));
    }
}
