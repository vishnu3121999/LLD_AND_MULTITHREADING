package B_Strategy.strategy.fare;

import B_Strategy.model.Location;
import B_Strategy.model.enums.VehicleType;

public class BaseFareStrategy implements FareStrategy {
    @Override
    public double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                                int activeBookingCount, int nearbyCabCount) {
        return pickupLocation.distanceTo(destinationLocation) * ratePerDistance(vehicleType);
    }

    private double ratePerDistance(VehicleType vehicleType) {
        if (vehicleType == VehicleType.BIKE) {
            return 8.0;
        }
        if (vehicleType == VehicleType.AUTO) {
            return 10.0;
        }
        if (vehicleType == VehicleType.GO) {
            return 12.0;
        }
        return 16.0;
    }
}
