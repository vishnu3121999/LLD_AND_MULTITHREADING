package G_Concurrency2.observer;

import G_Concurrency2.model.Booking;
import G_Concurrency2.model.Driver;

public class ConsoleDriverNotificationObserver implements DriverNotificationObserver {
    @Override
    public void onRideRequested(Booking booking, Driver driver) {
        System.out.println("Notification sent to driver " + driver.getName()
                + " for booking " + booking.getBookingId());
    }

    @Override
    public boolean equals(Object object) {
        return object instanceof ConsoleDriverNotificationObserver;
    }

    @Override
    public int hashCode() {
        return ConsoleDriverNotificationObserver.class.hashCode();
    }
}
