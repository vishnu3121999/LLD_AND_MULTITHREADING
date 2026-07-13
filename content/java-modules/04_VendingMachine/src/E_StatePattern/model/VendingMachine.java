package E_StatePattern.model;

import E_StatePattern.change.ChangeCalculationStrategy;
import E_StatePattern.model.enums.Coin;
import E_StatePattern.model.enums.VendingMachineState;
import E_StatePattern.state.IdleState;
import E_StatePattern.state.VMState;

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
    private VMState vendingMachineState;

    public VendingMachine(String name, ChangeCalculationStrategy changeCalculationStrategy) {
        this.name = name;
        this.rackList = new ArrayList<>();
        this.coinMap = new HashMap<>();
        this.changeCalculationStrategy = changeCalculationStrategy;
        this.selectedRackId = null;
        this.vendingMachineState = new IdleState(this);
    }

    public void addRack(String rackId) {
        rackList.add(rackId);
    }

    public void addCoin(Coin coin, int count) {
        coinMap.put(coin, coinMap.getOrDefault(coin, 0) + count);
    }

    public void reduceCoin(Coin coin, int count) {
        if (coinMap.getOrDefault(coin, 0) < count) {
            throw new IllegalStateException("Insufficient change coin count: " + coin);
        }
        coinMap.put(coin, coinMap.get(coin) - count);
    }

    public Map<Coin, Integer> calculateChange(int changeAmount) {
        return changeCalculationStrategy.calculateChange(changeAmount, coinMap);
    }

    public void selectRack(String rackId) {
        vendingMachineState.selectRack(rackId);
    }

    public void paymentCompleted() {
        vendingMachineState.paymentCompleted();
    }

    public void completeTransaction() {
        vendingMachineState.completeTransaction();
    }

    public void cancelTransaction() {
        vendingMachineState.cancelTransaction();
    }

    public void setSelectedRackId(String rackId) {
        this.selectedRackId = rackId;
    }

    public void setVendingMachineState(VMState vendingMachineState) {
        this.vendingMachineState = vendingMachineState;
    }

    @Override
    public String toString() {
        return "VendingMachine{" +
                "name='" + name + '\'' +
                ", rackList=" + rackList +
                ", coinMap=" + coinMap +
                ", selectedRackId='" + selectedRackId + '\'' +
                ", vendingMachineState=" + getVendingMachineState() +
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
        return vendingMachineState.getState();
    }
}
