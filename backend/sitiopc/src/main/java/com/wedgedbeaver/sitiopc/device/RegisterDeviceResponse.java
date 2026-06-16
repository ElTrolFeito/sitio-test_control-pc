package com.wedgedbeaver.sitiopc.device;

import java.util.UUID;

public class RegisterDeviceResponse {

    private UUID deviceId;
    private String deviceToken;

    public RegisterDeviceResponse(UUID deviceId, String deviceToken) {
        this.deviceId = deviceId;
        this.deviceToken = deviceToken;
    }

    public UUID getDeviceId() {
        return deviceId;
    }

    public String getDeviceToken() {
        return deviceToken;
    }
}