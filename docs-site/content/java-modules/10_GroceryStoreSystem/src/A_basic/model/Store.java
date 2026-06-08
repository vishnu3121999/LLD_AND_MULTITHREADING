package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Store {
    private final String storeId;
    private final String name;
    private final List<String> inventoryItemList;
    public Store(String storeId, String name) { this.storeId = storeId; this.name = name; this.inventoryItemList = new ArrayList<>(); }
    public void addInventoryItem(String inventoryItemId) { inventoryItemList.add(inventoryItemId); }
    @Override public String toString() { return "Store{" + "storeId='" + storeId + "'" + ", name='" + name + "'" + ", inventoryItemList=" + inventoryItemList + '}'; }
    public String getStoreId() { return storeId; }
    public String getName() { return name; }
    public List<String> getInventoryItemList() { return Collections.unmodifiableList(inventoryItemList); }
}
