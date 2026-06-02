package D_ExceptionHandling.model;

import D_ExceptionHandling.change.ChangeCalculationStrategy;
import D_ExceptionHandling.model.enums.Coin;
import D_ExceptionHandling.model.enums.VendingMachineState;

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
        if (coinMap.getOrDefault(coin, 0) < count) {
            throw new IllegalStateException("Insufficient change coin count: " + coin);
        }
        coinMap.put(coin, coinMap.get(coin) - count);
    }

    public Map<Coin, Integer> calculateChange(int changeAmount) {
        return changeCalculationStrategy.calculateChange(changeAmount, coinMap);
    }

    public void selectRack(String rackId) {
        if (vendingMachineState != VendingMachineState.IDLE) {
            throw new IllegalStateException("Product can only be selected from IDLE state");
        }
        this.selectedRackId = rackId;
        this.vendingMachineState = VendingMachineState.PENDING_PAYMENT;
    }

    public void paymentCompleted() {
        if (vendingMachineState != VendingMachineState.PENDING_PAYMENT) {
            throw new IllegalStateException("Payment can only be completed from PENDING_PAYMENT state");
        }
        this.vendingMachineState = VendingMachineState.READY_TO_DISPENSE;
    }

    public void completeTransaction() {
        if (vendingMachineState != VendingMachineState.READY_TO_DISPENSE) {
            throw new IllegalStateException("Transaction can only be completed from READY_TO_DISPENSE state");
        }
        this.selectedRackId = null;
        this.vendingMachineState = VendingMachineState.IDLE;
    }

    public void cancelTransaction() {
        if (vendingMachineState != VendingMachineState.PENDING_PAYMENT) {
            throw new IllegalStateException("Transaction can only be cancelled from PENDING_PAYMENT state");
        }
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
