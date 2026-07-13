package F_Concurrency.change;

import F_Concurrency.model.enums.Coin;

import java.util.Map;

public interface ChangeCalculationStrategy {
    Map<Coin, Integer> calculateChange(int changeAmount, Map<Coin, Integer> coinMap);
}
