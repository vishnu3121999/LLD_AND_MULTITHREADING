package F_Concurrency1.pricing;

import java.time.LocalDateTime;

public interface FeeCalculationStrategy {
    double calculate(LocalDateTime entryTime, LocalDateTime exitTime);
}



