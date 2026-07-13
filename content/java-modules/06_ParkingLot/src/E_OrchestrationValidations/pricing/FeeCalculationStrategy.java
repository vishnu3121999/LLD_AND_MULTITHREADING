package E_OrchestrationValidations.pricing;

import java.time.LocalDateTime;

public interface FeeCalculationStrategy {
    double calculate(LocalDateTime entryTime, LocalDateTime exitTime);
}



