package B_Strategy.pricing;

import java.time.Duration;
import java.time.LocalDateTime;

public class HourlyFeeCalculationStrategy implements FeeCalculationStrategy {
    private static final double HOURLY_RATE = 20.0;

    @Override
    public double calculate(LocalDateTime entryTime, LocalDateTime exitTime) {
        long minutes = Math.max(1, Duration.between(entryTime, exitTime).toMinutes());
        long hours = Math.max(1, (minutes + 59) / 60);
        return hours * HOURLY_RATE;
    }
}
