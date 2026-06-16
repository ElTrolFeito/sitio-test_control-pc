package com.wedgedbeaver.sitiopc.device;

public class RegisterDeviceRequest {

    private String name;
    private String serial;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSerial() {
        return serial;
    }

    public void setSerial(String serial) {
        this.serial = serial;
    }
}