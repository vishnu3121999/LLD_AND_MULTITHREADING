package D_ExceptionHandling.change;

import D_ExceptionHandling.model.enums.Coin;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GreedyChangeCalculationStrategy implements ChangeCalculationStrategy {
    @Override
    public Map<Coin, Integer> calculateChange(int changeAmount, Map<Coin, Integer> coinMap) {
        Map<Coin, Integer> result = new HashMap<>();
        List<Coin> coinList = new ArrayList<>(coinMap.keySet());
        coinList.sort(Comparator.comparingInt(Coin::getValue).reversed());

        if (!calculateChange(coinList, coinMap, 0, changeAmount, result)) {
            throw new RuntimeException("Exact change cannot be calculated for amount: " + changeAmount);
        }
        return result;
    }

    private boolean calculateChange(List<Coin> coinList, Map<Coin, Integer> coinMap, int index, int remainingAmount, Map<Coin, Integer> result) {
        if (remainingAmount == 0) {
            return true;
        }
        if (index == coinList.size()) {
            return false;
        }

        Coin coin = coinList.get(index);
        int maxCount = Math.min(coinMap.get(coin), remainingAmount / coin.getValue());
        for (int count = maxCount; count >= 0; count--) {
            if (count > 0) {
                result.put(coin, count);
            } else {
                result.remove(coin);
            }
            if (calculateChange(coinList, coinMap, index + 1, remainingAmount - count * coin.getValue(), result)) {
                return true;
            }
        }
        result.remove(coin);
        return false;
    }
}
