package D_ExceptionHandling.service;

import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.model.ParkingFloor;
import D_ExceptionHandling.model.ParkingLot;
import D_ExceptionHandling.model.ParkingSlot;
import D_ExceptionHandling.model.ParkingTicket;
import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.Vehicle;
import D_ExceptionHandling.model.enums.SlotType;
import D_ExceptionHandling.model.enums.VehicleType;
import D_ExceptionHandling.payment.PaymentProcessor;
import D_ExceptionHandling.pricing.FeeCalculationStrategy;
import D_ExceptionHandling.strategy.assignment.SlotAssignmentStrategy;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
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
        requireText(parkingLotId, "parkingLotId");
        requireText(vehicleId, "vehicleId");
        requireText(registrationNumber, "registrationNumber");
        requireNotNull(vehicleType, "vehicleType");
        getRequiredParkingLot(parkingLotId);
        if (dataStore.containsVehicle(vehicleId)) {
            throw new RuntimeException("Vehicle already exists: " + vehicleId);
        }
        ParkingSlot parkingSlot = findAvailableSlot(parkingLotId, slotTypeFor(vehicleType));
        if (parkingSlot == null) {
            throw new RuntimeException("No available slot for vehicle type: " + vehicleType);
        }
        Vehicle vehicle = new Vehicle(vehicleId, registrationNumber, vehicleType);
        dataStore.putVehicle(vehicle.getVehicleId(), vehicle);
        parkingSlot.occupy(vehicleId);
        ParkingTicket parkingTicket = issueTicket(vehicleId, parkingSlot.getParkingSlotId());
        dataStore.putParkingTicket(parkingTicket.getParkingTicketId(), parkingTicket);
        return parkingTicket.getParkingTicketId();
    }

    public ParkingTicket unparkVehicle(String parkingTicketId) {
        requireText(parkingTicketId, "parkingTicketId");
        ParkingTicket parkingTicket = getRequiredParkingTicket(parkingTicketId);
        ParkingSlot parkingSlot = getRequiredParkingSlot(parkingTicket.getParkingSlotId());
        LocalDateTime exitTime = now();
        parkingSlot.vacate();
        parkingTicket.recordExit(exitTime, feeCalculationStrategy.calculate(parkingTicket.getEntryTime(), exitTime));
        dataStore.removeVehicle(parkingTicket.getVehicleId());
        return parkingTicket;
    }

    public ParkingTicket pay(String parkingTicketId, Payment payment) {
        requireText(parkingTicketId, "parkingTicketId");
        requireNotNull(payment, "payment");
        requirePositive(payment.getAmount(), "payment amount");
        ParkingTicket parkingTicket = getRequiredParkingTicket(parkingTicketId);
        if (Double.compare(payment.getAmount(), parkingTicket.getAmount()) != 0) {
            throw new RuntimeException("Payment amount does not match ticket amount");
        }
        if (!paymentProcessor.process(payment)) {
            throw new RuntimeException("Payment failed for ticket: " + parkingTicketId);
        }
        parkingTicket.close();
        return parkingTicket;
    }

    // System methods

    public ParkingSlot findAvailableSlot(String parkingLotId, SlotType slotType) {
        return slotAssignmentStrategy.assignSlot(getParkingSlots(parkingLotId), slotType);
    }

    // Admin methods

    public void addParkingLot(String parkingLotId, String name) {
        requireText(parkingLotId, "parkingLotId");
        requireText(name, "name");
        if (dataStore.containsParkingLot(parkingLotId)) {
            throw new RuntimeException("Parking lot already exists: " + parkingLotId);
        }
        ParkingLot parkingLot = new ParkingLot(parkingLotId, name);
        dataStore.putParkingLot(parkingLot.getParkingLotId(), parkingLot);
    }

    public void addParkingFloor(String parkingLotId, String parkingFloorId, String name) {
        requireText(parkingLotId, "parkingLotId");
        requireText(parkingFloorId, "parkingFloorId");
        requireText(name, "name");
        ParkingLot parkingLot = getRequiredParkingLot(parkingLotId);
        if (dataStore.containsParkingFloor(parkingFloorId)) {
            throw new RuntimeException("Parking floor already exists: " + parkingFloorId);
        }
        ParkingFloor parkingFloor = new ParkingFloor(parkingFloorId, name);
        dataStore.putParkingFloor(parkingFloor.getParkingFloorId(), parkingFloor);
        parkingLot.addParkingFloor(parkingFloorId);
    }

    public void addParkingSlot(String parkingFloorId, String parkingSlotId, String number, SlotType slotType) {
        requireText(parkingFloorId, "parkingFloorId");
        requireText(parkingSlotId, "parkingSlotId");
        requireText(number, "number");
        requireNotNull(slotType, "slotType");
        ParkingFloor parkingFloor = getRequiredParkingFloor(parkingFloorId);
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

    private void requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requireNotNull(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requirePositive(double value, String fieldName) {
        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    private ParkingLot getRequiredParkingLot(String parkingLotId) {
        ParkingLot parkingLot = dataStore.getParkingLot(parkingLotId);
        if (parkingLot == null) {
            throw new NoSuchElementException("Parking lot not found: " + parkingLotId);
        }
        return parkingLot;
    }

    private ParkingFloor getRequiredParkingFloor(String parkingFloorId) {
        ParkingFloor parkingFloor = dataStore.getParkingFloor(parkingFloorId);
        if (parkingFloor == null) {
            throw new NoSuchElementException("Parking floor not found: " + parkingFloorId);
        }
        return parkingFloor;
    }

    private ParkingSlot getRequiredParkingSlot(String parkingSlotId) {
        ParkingSlot parkingSlot = dataStore.getParkingSlot(parkingSlotId);
        if (parkingSlot == null) {
            throw new NoSuchElementException("Parking slot not found: " + parkingSlotId);
        }
        return parkingSlot;
    }

    private ParkingTicket getRequiredParkingTicket(String parkingTicketId) {
        ParkingTicket parkingTicket = dataStore.getParkingTicket(parkingTicketId);
        if (parkingTicket == null) {
            throw new NoSuchElementException("Parking ticket not found: " + parkingTicketId);
        }
        return parkingTicket;
    }

    private LocalDateTime now() {
        return LocalDateTime.now();
    }
}



