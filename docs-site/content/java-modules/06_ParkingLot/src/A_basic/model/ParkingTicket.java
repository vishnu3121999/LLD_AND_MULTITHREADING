package A_basic.model;

import A_basic.model.enums.TicketStatus;

public class ParkingTicket {
    private final String parkingTicketId;
    private final String vehicleId;
    private final String parkingSlotId;
    private final long entryTime;
    private long exitTime;
    private double amount;
    private TicketStatus ticketStatus;

    public ParkingTicket(String parkingTicketId, String vehicleId, String parkingSlotId, long entryTime) {
        this.parkingTicketId = parkingTicketId;
        this.vehicleId = vehicleId;
        this.parkingSlotId = parkingSlotId;
        this.entryTime = entryTime;
        this.ticketStatus = TicketStatus.ACTIVE;
    }

    public void close(long exitTime, double amount) { this.exitTime = exitTime; this.amount = amount; this.ticketStatus = TicketStatus.CLOSED; }

    @Override
    public String toString() {
        return "ParkingTicket{" + "parkingTicketId='" + parkingTicketId + "'" + ", vehicleId='" + vehicleId + "'" + ", parkingSlotId='" + parkingSlotId + "'" + ", entryTime=" + entryTime + ", exitTime=" + exitTime + ", amount=" + amount + ", ticketStatus=" + ticketStatus + '}';
    }

    public String getParkingTicketId() { return parkingTicketId; }
    public String getVehicleId() { return vehicleId; }
    public String getParkingSlotId() { return parkingSlotId; }
    public long getEntryTime() { return entryTime; }
    public TicketStatus getTicketStatus() { return ticketStatus; }
}
