package D_ExceptionHandlingV2.datastore;

import D_ExceptionHandlingV2.model.ParkingFloor;
import D_ExceptionHandlingV2.model.ParkingLot;
import D_ExceptionHandlingV2.model.ParkingSlot;
import D_ExceptionHandlingV2.model.ParkingTicket;
import D_ExceptionHandlingV2.model.Vehicle;

public interface DataStore {
    ParkingLot getParkingLot(String key);

    void putParkingLot(String key, ParkingLot value);

    boolean containsParkingLot(String key);

    ParkingLot removeParkingLot(String key);

    ParkingFloor getParkingFloor(String key);

    void putParkingFloor(String key, ParkingFloor value);

    boolean containsParkingFloor(String key);

    ParkingFloor removeParkingFloor(String key);

    ParkingSlot getParkingSlot(String key);

    void putParkingSlot(String key, ParkingSlot value);

    boolean containsParkingSlot(String key);

    ParkingSlot removeParkingSlot(String key);

    Vehicle getVehicle(String key);

    void putVehicle(String key, Vehicle value);

    boolean containsVehicle(String key);

    Vehicle removeVehicle(String key);

    ParkingTicket getParkingTicket(String key);

    void putParkingTicket(String key, ParkingTicket value);

    boolean containsParkingTicket(String key);

    ParkingTicket removeParkingTicket(String key);
}




