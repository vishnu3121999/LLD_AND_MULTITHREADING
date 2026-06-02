package F_Concurrency.pricing;

import F_Concurrency.model.enums.SeatType;

import java.time.LocalDateTime;

public class PricingContext {
    private final int basePrice;
    private final SeatType seatType;
    private final LocalDateTime startTime;
    private double currentPrice;

    public PricingContext(int basePrice, SeatType seatType, LocalDateTime startTime) {
        this.basePrice = basePrice;
        this.seatType = seatType;
        this.startTime = startTime;
        this.currentPrice = basePrice;
    }

    public int roundedPrice() {
        return (int) Math.round(currentPrice);
    }

    public int getBasePrice() {
        return basePrice;
    }

    public SeatType getSeatType() {
        return seatType;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }
}
