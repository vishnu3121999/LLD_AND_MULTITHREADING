package C_Factory.model;

import C_Factory.change.ChangeCalculationStrategy;
import C_Factory.model.enums.Coin;
import C_Factory.model.enums.VendingMachineState;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VendingMachine {
    private final String name;
    private final List<String> rackList;
    private final Map<Coin, Integer> coinMap;
    private final ChangeCalculationStrategy changeCalculationStrategy;
    private String selectedRackId;
    private VendingMachineState vendingMachineState;

    public VendingMachine(String name, ChangeCalculationStrategy changeCalculationStrategy) {
        this.name = name;
        this.rackList = new ArrayList<>();
        this.coinMap = new HashMap<>();
        this.changeCalculationStrategy = changeCalculationStrategy;
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
        return changeCalculationStrategy.calculateChange(changeAmount, coinMap);
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
