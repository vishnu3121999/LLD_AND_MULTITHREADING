package D_ExceptionHandling.change;

import D_ExceptionHandling.model.enums.Coin;

import java.util.Map;

public interface ChangeCalculationStrategy {
    Map<Coin, Integer> calculateChange(int changeAmount, Map<Coin, Integer> coinMap);
}
