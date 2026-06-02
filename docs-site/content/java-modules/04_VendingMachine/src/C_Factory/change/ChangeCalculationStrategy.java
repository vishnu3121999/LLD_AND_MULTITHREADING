package C_Factory.change;

import C_Factory.model.enums.Coin;

import java.util.Map;

public interface ChangeCalculationStrategy {
    Map<Coin, Integer> calculateChange(int changeAmount, Map<Coin, Integer> coinMap);
}
