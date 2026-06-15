package B_Strategy.model;

import B_Strategy.model.enums.TicketStatus;

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
        this.exitTime = exitTime;
        this.amount = amount;
        this.ticketStatus = TicketStatus.PAYMENT_PENDING;
    }

    public void close() {
        this.ticketStatus = TicketStatus.CLOSED;
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

