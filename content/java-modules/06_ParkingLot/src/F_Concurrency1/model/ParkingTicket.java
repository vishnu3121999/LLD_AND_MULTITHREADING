package F_Concurrency1.model;

import F_Concurrency1.model.enums.TicketStatus;

import java.time.LocalDateTime;

public class ParkingTicket {
    private final String parkingTicketId;
    private final String vehicleId;
    private final String parkingSlotId;
    private final LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private double amount;
    private TicketStatus ticketStatus;

    public ParkingTicket(String parkingTicketId, String vehicleId, String parkingSlotId, LocalDateTime entryTime) {
        this.parkingTicketId = parkingTicketId;
        this.vehicleId = vehicleId;
        this.parkingSlotId = parkingSlotId;
        this.entryTime = entryTime;
        this.ticketStatus = TicketStatus.ACTIVE;
    }

    public void recordExit(LocalDateTime exitTime, double amount) {
        validateCanRecordExit();
        this.exitTime = exitTime;
        this.amount = amount;
        this.ticketStatus = TicketStatus.PAYMENT_PENDING;
    }

    public void close() {
        validateCanClose();
        this.ticketStatus = TicketStatus.CLOSED;
    }

    public void validateCanRecordExit() {
        if (ticketStatus != TicketStatus.ACTIVE) {
            throw new IllegalStateException("Parking ticket can only record exit from ACTIVE state: " + parkingTicketId);
        }
    }

    public void validateCanClose() {
        if (ticketStatus != TicketStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("Parking ticket can only be closed from PAYMENT_PENDING state: " + parkingTicketId);
        }
    }

    @Override
    public String toString() {
        return "ParkingTicket{" + "parkingTicketId='" + parkingTicketId + "'" + ", vehicleId='" + vehicleId + "'" + ", parkingSlotId='" + parkingSlotId + "'" + ", entryTime=" + entryTime + ", exitTime=" + exitTime + ", amount=" + amount + ", ticketStatus=" + ticketStatus + '}';
    }

    public String getParkingTicketId() { return parkingTicketId; }
    public String getVehicleId() { return vehicleId; }
    public String getParkingSlotId() { return parkingSlotId; }
    public LocalDateTime getEntryTime() { return entryTime; }
    public LocalDateTime getExitTime() { return exitTime; }
    public double getAmount() { return amount; }
    public TicketStatus getTicketStatus() { return ticketStatus; }
}




