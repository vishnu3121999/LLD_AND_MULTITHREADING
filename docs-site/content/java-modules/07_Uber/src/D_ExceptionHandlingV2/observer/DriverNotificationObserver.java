package D_ExceptionHandlingV2.observer;

import D_ExceptionHandlingV2.model.Booking;
import D_ExceptionHandlingV2.model.Driver;

public interface DriverNotificationObserver {
    void onRideRequested(Booking booking, Driver driver);
}
