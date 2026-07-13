package A_basic.model;

import A_basic.model.enums.Coin;
import A_basic.model.enums.VendingMachineState;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VendingMachine {
    private final String name;
    private final List<String> rackList;
    private final Map<Coin, Integer> coinMap;
    private String selectedRackId;
    private VendingMachineState vendingMachineState;

    public VendingMachine(String name) {
        this.name = name;
        this.rackList = new ArrayList<>();
        this.coinMap = new HashMap<>();
        this.selectedRackId = null;
        this.vendingMachineState = VendingMachineState.IDLE;
    }

    public void addRack(String rackId) {
        rackList.add(rackId);
    }

    public void addCoin(Coin coin, int count) {
        coinMap.put(coin, coinMap.getOrDefault(coin, 0) + count);
    }

    public void reduceCoin(Coin coin, int count) {
        coinMap.put(coin, coinMap.get(coin) - count);
    }

    public Map<Coin, Integer> calculateChange(int changeAmount) {
        Map<Coin, Integer> result = new HashMap<>();
        List<Coin> coinList = new ArrayList<>(coinMap.keySet());
        coinList.sort(Comparator.comparingInt(Coin::getValue).reversed());

        calculateChange(coinList, 0, changeAmount, result);
        return result;
    }

    private boolean calculateChange(List<Coin> coinList, int index, int remainingAmount, Map<Coin, Integer> result) {
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
            if (calculateChange(coinList, index + 1, remainingAmount - count * coin.getValue(), result)) {
                return true;
            }
        }
        result.remove(coin);
        return false;
    }

    public void selectRack(String rackId) {
        this.selectedRackId = rackId;
        this.vendingMachineState = VendingMachineState.PENDING_PAYMENT;
    }

    public void paymentCompleted() {
        this.vendingMachineState = VendingMachineState.READY_TO_DISPENSE;
    }

    public void completeTransaction() {
        this.selectedRackId = null;
        this.vendingMachineState = VendingMachineState.IDLE;
    }

    public void cancelTransaction() {
        this.selectedRackId = null;
        this.vendingMachineState = VendingMachineState.IDLE;
    }

    @Override
    public String toString() {
        return "VendingMachine{" +
                "name='" + name + '\'' +
                ", rackList=" + rackList +
                ", coinMap=" + coinMap +
                ", selectedRackId='" + selectedRackId + '\'' +
                ", vendingMachineState=" + vendingMachineState +
                '}';
    }

    public String getName() {
        return name;
    }

    public List<String> getRackList() {
        return Collections.unmodifiableList(rackList);
    }

    public Map<Coin, Integer> getCoinMap() {
        return Collections.unmodifiableMap(coinMap);
    }

    public String getSelectedRackId() {
        return selectedRackId;
    }

    public VendingMachineState getVendingMachineState() {
        return vendingMachineState;
    }
}
