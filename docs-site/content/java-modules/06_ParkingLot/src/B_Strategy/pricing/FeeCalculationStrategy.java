package B_Strategy.pricing;

import java.time.LocalDateTime;

public interface FeeCalculationStrategy {
    double calculate(LocalDateTime entryTime, LocalDateTime exitTime);
}
