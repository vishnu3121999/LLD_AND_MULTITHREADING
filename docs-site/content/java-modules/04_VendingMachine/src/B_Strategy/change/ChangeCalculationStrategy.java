package B_Strategy.change;

import B_Strategy.model.enums.Coin;

import java.util.Map;

public interface ChangeCalculationStrategy {
    Map<Coin, Integer> calculateChange(int changeAmount, Map<Coin, Integer> coinMap);
}
