package E_StatePattern.model;

import E_StatePattern.model.enums.Coin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CashPayment extends Payment {
    private final List<Coin> coinList;

    public CashPayment(List<Coin> coinList) {
        super(calculateAmount(coinList));
        this.coinList = new ArrayList<>(coinList);
    }

    @Override
    public String toString() {
        return "CashPayment{" +
                "id='" + id + '\'' +
                ", amount=" + amount +
                ", coinList=" + coinList +
                ", status=" + status +
                '}';
    }

    public List<Coin> getCoinList() {
        return Collections.unmodifiableList(coinList);
    }

    private static int calculateAmount(List<Coin> coinList) {
        int amount = 0;
        for (Coin coin : coinList) {
            amount += coin.getValue();
        }
        return amount;
    }
}
