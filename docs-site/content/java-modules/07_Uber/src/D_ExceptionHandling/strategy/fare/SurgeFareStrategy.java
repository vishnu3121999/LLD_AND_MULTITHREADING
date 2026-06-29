package D_ExceptionHandling.strategy.fare;

import D_ExceptionHandling.model.Location;
import D_ExceptionHandling.model.enums.VehicleType;

public class SurgeFareStrategy implements FareStrategy {
    private final FareStrategy baseFareStrategy;

    public SurgeFareStrategy(FareStrategy baseFareStrategy) {
        this.baseFareStrategy = baseFareStrategy;
    }

    @Override
    public double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                                int activeBookingCount, int nearbyCabCount) {
        double fare = baseFareStrategy.calculateFare(pickupLocation, destinationLocation, vehicleType,
                activeBookingCount, nearbyCabCount);
        if (nearbyCabCount > 0 && activeBookingCount >= nearbyCabCount) {
            fare = fare * 1.5;
        }
        return Math.round(fare * 100.0) / 100.0;
    }
}
