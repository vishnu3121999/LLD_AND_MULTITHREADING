package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.ParkingFloor;
import A_basic.model.ParkingLot;
import A_basic.model.ParkingSlot;
import A_basic.model.ParkingTicket;
import A_basic.model.Payment;
import A_basic.model.Vehicle;
import A_basic.model.enums.SlotStatus;
import A_basic.model.enums.SlotType;
import A_basic.model.enums.VehicleType;
import A_basic.payment.PaymentProcessor;

import java.time.Duration;
import java.time.LocalDateTime;

public class ParkingLotFacade {
    private final DataStore dataStore;
    private final PaymentProcessor paymentProcessor;

    public ParkingLotFacade(DataStore dataStore, PaymentProcessor paymentProcessor) {
        this.dataStore = dataStore;
        this.paymentProcessor = paymentProcessor;
    }

    // User methods

    public String parkVehicle(String parkingLotId, String vehicleId, String registrationNumber, VehicleType vehicleType) {
        Vehicle vehicle = new Vehicle(vehicleId, registrationNumber, vehicleType);
        dataStore.putVehicle(vehicle.getVehicleId(), vehicle);
        ParkingSlot parkingSlot = findAvailableSlot(parkingLotId, slotTypeFor(vehicleType));
        parkingSlot.occupy(vehicleId);
        ParkingTicket parkingTicket = issueTicket(vehicleId, parkingSlot.getParkingSlotId());
        dataStore.putParkingTicket(parkingTicket.getParkingTicketId(), parkingTicket);
        return parkingTicket.getParkingTicketId();
    }

    public ParkingTicket unparkVehicle(String parkingTicketId) {
        ParkingTicket parkingTicket = dataStore.getParkingTicket(parkingTicketId);
        ParkingSlot parkingSlot = dataStore.getParkingSlot(parkingTicket.getParkingSlotId());
        LocalDateTime exitTime = now();
        parkingSlot.vacate();
        parkingTicket.recordExit(exitTime, calculateAmount(parkingTicket.getEntryTime(), exitTime));
        dataStore.removeVehicle(parkingTicket.getVehicleId());
        return parkingTicket;
    }

    public ParkingTicket pay(String parkingTicketId, Payment payment) {
        ParkingTicket parkingTicket = dataStore.getParkingTicket(parkingTicketId);
        if (paymentProcessor.process(payment)) {
            parkingTicket.close();
        }
        return parkingTicket;
    }

    // System methods

    public ParkingSlot findAvailableSlot(String parkingLotId, SlotType slotType) {
        ParkingLot parkingLot = dataStore.getParkingLot(parkingLotId);
        for (String parkingFloorId : parkingLot.getParkingFloorList()) {
            ParkingFloor parkingFloor = dataStore.getParkingFloor(parkingFloorId);
            for (String parkingSlotId : parkingFloor.getParkingSlotList()) {
                ParkingSlot parkingSlot = dataStore.getParkingSlot(parkingSlotId);
                if (parkingSlot.getSlotType() == slotType && parkingSlot.getSlotStatus() == SlotStatus.AVAILABLE) {
                    return parkingSlot;
                }
            }
        }
        return null;
    }

    // Admin methods

    public void addParkingLot(String parkingLotId, String name) {
        ParkingLot parkingLot = new ParkingLot(parkingLotId, name);
        dataStore.putParkingLot(parkingLot.getParkingLotId(), parkingLot);
    }

    public void addParkingFloor(String parkingLotId, String parkingFloorId, String name) {
        ParkingFloor parkingFloor = new ParkingFloor(parkingFloorId, name);
        dataStore.putParkingFloor(parkingFloor.getParkingFloorId(), parkingFloor);
        dataStore.getParkingLot(parkingLotId).addParkingFloor(parkingFloorId);
    }

    public void addParkingSlot(String parkingFloorId, String parkingSlotId, String number, SlotType slotType) {
        ParkingSlot parkingSlot = new ParkingSlot(parkingSlotId, number, slotType);
        dataStore.putParkingSlot(parkingSlot.getParkingSlotId(), parkingSlot);
        dataStore.getParkingFloor(parkingFloorId).addParkingSlot(parkingSlotId);
    }

    // Util/helper methods

    private ParkingTicket issueTicket(String vehicleId, String parkingSlotId) {
        String parkingTicketId = "ticket-" + vehicleId;
        return new ParkingTicket(parkingTicketId, vehicleId, parkingSlotId, now());
    }

    private SlotType slotTypeFor(VehicleType vehicleType) {
        if (vehicleType == VehicleType.BIKE) return SlotType.SMALL;
        if (vehicleType == VehicleType.TRUCK) return SlotType.LARGE;
        return SlotType.MEDIUM;
    }

    private double calculateAmount(LocalDateTime entryTime, LocalDateTime exitTime) {
        long minutes = Math.max(1, Duration.between(entryTime, exitTime).toMinutes());
        long hours = Math.max(1, (minutes + 59) / 60);
        return hours * 20.0;
    }

    private LocalDateTime now() {
        return LocalDateTime.now();
    }
}
