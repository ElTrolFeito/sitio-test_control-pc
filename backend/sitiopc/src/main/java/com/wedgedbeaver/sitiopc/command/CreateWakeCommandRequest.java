package com.wedgedbeaver.sitiopc.command;

import java.util.UUID;

public class CreateWakeCommandRequest {
    private UUID managedPcId;

    public UUID getManagedPcId() {
        return managedPcId;
    }

    public void setManagedPcId(UUID managedPcId) {
        this.managedPcId = managedPcId;
    }
}
