package B_Strategy.datastore;

import B_Strategy.model.ParkingFloor;
import B_Strategy.model.ParkingLot;
import B_Strategy.model.ParkingSlot;
import B_Strategy.model.ParkingTicket;
import B_Strategy.model.Vehicle;

import java.util.HashMap;
import java.util.Map;

public class InMemoryDataStore implements DataStore {
    private final Map<String, ParkingLot> parkingLotMap;
    private final Map<String, ParkingFloor> parkingFloorMap;
    private final Map<String, ParkingSlot> parkingSlotMap;
    private final Map<String, Vehicle> vehicleMap;
    private final Map<String, ParkingTicket> parkingTicketMap;

    public InMemoryDataStore() {
        this.parkingLotMap = new HashMap<>();
        this.parkingFloorMap = new HashMap<>();
        this.parkingSlotMap = new HashMap<>();
        this.vehicleMap = new HashMap<>();
        this.parkingTicketMap = new HashMap<>();
    }


    @Override
    public ParkingLot getParkingLot(String key) {
        return parkingLotMap.get(key);
    }

    @Override
    public void putParkingLot(String key, ParkingLot value) {
        parkingLotMap.put(key, value);
    }

    @Override
    public boolean containsParkingLot(String key) {
        return parkingLotMap.containsKey(key);
    }

    @Override
    public ParkingLot removeParkingLot(String key) {
        return parkingLotMap.remove(key);
    }

    @Override
    public ParkingFloor getParkingFloor(String key) {
        return parkingFloorMap.get(key);
    }

    @Override
    public void putParkingFloor(String key, ParkingFloor value) {
        parkingFloorMap.put(key, value);
    }

    @Override
    public boolean containsParkingFloor(String key) {
        return parkingFloorMap.containsKey(key);
    }

    @Override
    public ParkingFloor removeParkingFloor(String key) {
        return parkingFloorMap.remove(key);
    }

    @Override
    public ParkingSlot getParkingSlot(String key) {
        return parkingSlotMap.get(key);
    }

    @Override
    public void putParkingSlot(String key, ParkingSlot value) {
        parkingSlotMap.put(key, value);
    }

    @Override
    public boolean containsParkingSlot(String key) {
        return parkingSlotMap.containsKey(key);
    }

    @Override
    public ParkingSlot removeParkingSlot(String key) {
        return parkingSlotMap.remove(key);
    }

    @Override
    public Vehicle getVehicle(String key) {
        return vehicleMap.get(key);
    }

    @Override
    public void putVehicle(String key, Vehicle value) {
        vehicleMap.put(key, value);
    }

    @Override
    public boolean containsVehicle(String key) {
        return vehicleMap.containsKey(key);
    }

    @Override
    public Vehicle removeVehicle(String key) {
        return vehicleMap.remove(key);
    }

    @Override
    public ParkingTicket getParkingTicket(String key) {
        return parkingTicketMap.get(key);
    }

    @Override
    public void putParkingTicket(String key, ParkingTicket value) {
        parkingTicketMap.put(key, value);
    }

    @Override
    public boolean containsParkingTicket(String key) {
        return parkingTicketMap.containsKey(key);
    }

    @Override
    public ParkingTicket removeParkingTicket(String key) {
        return parkingTicketMap.remove(key);
    }
}

