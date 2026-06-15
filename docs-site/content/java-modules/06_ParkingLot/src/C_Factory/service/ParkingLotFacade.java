package C_Factory.service;

import C_Factory.datastore.DataStore;
import C_Factory.model.ParkingFloor;
import C_Factory.model.ParkingLot;
import C_Factory.model.ParkingSlot;
import C_Factory.model.ParkingTicket;
import C_Factory.model.Payment;
import C_Factory.model.Vehicle;
import C_Factory.model.enums.SlotType;
import C_Factory.model.enums.VehicleType;
import C_Factory.payment.PaymentProcessor;
import C_Factory.pricing.FeeCalculationStrategy;
import C_Factory.strategy.assignment.SlotAssignmentStrategy;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

public class ParkingLotFacade {
    private final DataStore dataStore;
    private final PaymentProcessor paymentProcessor;
    private final SlotAssignmentStrategy slotAssignmentStrategy;
    private final FeeCalculationStrategy feeCalculationStrategy;

    public ParkingLotFacade(DataStore dataStore, PaymentProcessor paymentProcessor,
                            SlotAssignmentStrategy slotAssignmentStrategy,
                            FeeCalculationStrategy feeCalculationStrategy) {
        this.dataStore = dataStore;
        this.paymentProcessor = paymentProcessor;
        this.slotAssignmentStrategy = slotAssignmentStrategy;
        this.feeCalculationStrategy = feeCalculationStrategy;
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
        parkingTicket.recordExit(exitTime, feeCalculationStrategy.calculate(parkingTicket.getEntryTime(), exitTime));
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
        return slotAssignmentStrategy.assignSlot(getParkingSlots(parkingLotId), slotType);
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

    private List<ParkingSlot> getParkingSlots(String parkingLotId) {
        List<ParkingSlot> parkingSlotList = new ArrayList<>();
        ParkingLot parkingLot = dataStore.getParkingLot(parkingLotId);
        for (String parkingFloorId : parkingLot.getParkingFloorList()) {
            ParkingFloor parkingFloor = dataStore.getParkingFloor(parkingFloorId);
            for (String parkingSlotId : parkingFloor.getParkingSlotList()) {
                parkingSlotList.add(dataStore.getParkingSlot(parkingSlotId));
            }
        }
        return parkingSlotList;
    }

    private SlotType slotTypeFor(VehicleType vehicleType) {
        if (vehicleType == VehicleType.BIKE) return SlotType.SMALL;
        if (vehicleType == VehicleType.TRUCK) return SlotType.LARGE;
        return SlotType.MEDIUM;
    }

    private LocalDateTime now() {
        return LocalDateTime.now();
    }
}


