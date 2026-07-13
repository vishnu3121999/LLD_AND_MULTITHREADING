package G_Concurrency2.service;

import G_Concurrency2.datastore.DataStore;
import G_Concurrency2.model.ParkingFloor;
import G_Concurrency2.model.ParkingLot;
import G_Concurrency2.model.ParkingSlot;
import G_Concurrency2.model.ParkingTicket;
import G_Concurrency2.model.Payment;
import G_Concurrency2.model.Vehicle;
import G_Concurrency2.model.enums.SlotType;
import G_Concurrency2.model.enums.VehicleType;
import G_Concurrency2.payment.PaymentProcessor;
import G_Concurrency2.pricing.FeeCalculationStrategy;
import G_Concurrency2.strategy.assignment.SlotAssignmentStrategy;

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
        ParkingLot parkingLot = dataStore.getParkingLot(parkingLotId);
        synchronized (parkingLot) {
            if (dataStore.containsVehicle(vehicleId)) {
                throw new RuntimeException("Vehicle already exists: " + vehicleId);
            }
            ParkingSlot parkingSlot = findAvailableSlot(parkingLotId, slotTypeFor(vehicleType));
            if (parkingSlot == null) {
                throw new RuntimeException("No available slot for vehicle type: " + vehicleType);
            }
            synchronized (parkingSlot) {
                parkingSlot.occupy(vehicleId);
            }
            Vehicle vehicle = new Vehicle(vehicleId, registrationNumber, vehicleType);
            dataStore.putVehicle(vehicle.getVehicleId(), vehicle);
            ParkingTicket parkingTicket = issueTicket(vehicleId, parkingSlot.getParkingSlotId());
            dataStore.putParkingTicket(parkingTicket.getParkingTicketId(), parkingTicket);
            return parkingTicket.getParkingTicketId();
        }
    }

    public ParkingTicket unparkVehicle(String parkingTicketId) {
        ParkingTicket parkingTicket = dataStore.getParkingTicket(parkingTicketId);
        ParkingSlot parkingSlot = dataStore.getParkingSlot(parkingTicket.getParkingSlotId());
        synchronized (parkingTicket) {
            LocalDateTime exitTime = now();
            synchronized (parkingSlot) {
                parkingSlot.validateCanVacate();
                parkingTicket.validateCanRecordExit();
                parkingSlot.vacate();
            }
            parkingTicket.recordExit(exitTime, feeCalculationStrategy.calculate(parkingTicket.getEntryTime(), exitTime));
            dataStore.removeVehicle(parkingTicket.getVehicleId());
            return parkingTicket;
        }
    }

    public ParkingTicket pay(String parkingTicketId, Payment payment) {
        ParkingTicket parkingTicket = dataStore.getParkingTicket(parkingTicketId);
        synchronized (parkingTicket) {
            if (Double.compare(payment.getAmount(), parkingTicket.getAmount()) != 0) {
                throw new RuntimeException("Payment amount does not match ticket amount");
            }
            parkingTicket.validateCanClose();
            if (!paymentProcessor.process(payment)) {
                throw new RuntimeException("Payment failed for ticket: " + parkingTicketId);
            }
            parkingTicket.close();
            return parkingTicket;
        }
    }

    // System methods

    public ParkingSlot findAvailableSlot(String parkingLotId, SlotType slotType) {
        return slotAssignmentStrategy.assignSlot(getParkingSlots(parkingLotId), slotType);
    }

    // Admin methods

    public void addParkingLot(String parkingLotId, String name) {
        if (dataStore.containsParkingLot(parkingLotId)) {
            throw new RuntimeException("Parking lot already exists: " + parkingLotId);
        }
        ParkingLot parkingLot = new ParkingLot(parkingLotId, name);
        dataStore.putParkingLot(parkingLot.getParkingLotId(), parkingLot);
    }

    public void addParkingFloor(String parkingLotId, String parkingFloorId, String name) {
        ParkingLot parkingLot = dataStore.getParkingLot(parkingLotId);
        if (dataStore.containsParkingFloor(parkingFloorId)) {
            throw new RuntimeException("Parking floor already exists: " + parkingFloorId);
        }
        ParkingFloor parkingFloor = new ParkingFloor(parkingFloorId, name);
        dataStore.putParkingFloor(parkingFloor.getParkingFloorId(), parkingFloor);
        parkingLot.addParkingFloor(parkingFloorId);
    }

    public void addParkingSlot(String parkingFloorId, String parkingSlotId, String number, SlotType slotType) {
        ParkingFloor parkingFloor = dataStore.getParkingFloor(parkingFloorId);
        if (dataStore.containsParkingSlot(parkingSlotId)) {
            throw new RuntimeException("Parking slot already exists: " + parkingSlotId);
        }
        ParkingSlot parkingSlot = new ParkingSlot(parkingSlotId, number, slotType);
        dataStore.putParkingSlot(parkingSlot.getParkingSlotId(), parkingSlot);
        parkingFloor.addParkingSlot(parkingSlotId);
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
