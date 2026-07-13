package D_ExceptionHandlingV2.change;

import D_ExceptionHandlingV2.model.enums.Coin;

import java.util.Map;

public interface ChangeCalculationStrategy {
    Map<Coin, Integer> calculateChange(int changeAmount, Map<Coin, Integer> coinMap);
}
