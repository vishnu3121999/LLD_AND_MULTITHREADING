package D_ExceptionHandlingV2.pricing;

import java.time.LocalDateTime;

public interface FeeCalculationStrategy {
    double calculate(LocalDateTime entryTime, LocalDateTime exitTime);
}



