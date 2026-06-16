package com.wedgedbeaver.sitiopc.device;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService service;

    public DeviceController(DeviceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Device> getDevices() {
        return service.findAll();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterDeviceRequest request
    ) {

        try {
            return ResponseEntity.ok(
                    service.register(request)
            );

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(ex.getMessage());
        }
}
}