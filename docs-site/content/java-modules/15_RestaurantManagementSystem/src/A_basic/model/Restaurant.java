package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Restaurant {
    private final String restaurantId;
    private final String name;
    private final List<String> diningTableList;
    private final List<String> menuItemList;
    public Restaurant(String restaurantId, String name) { this.restaurantId = restaurantId; this.name = name; this.diningTableList = new ArrayList<>(); this.menuItemList = new ArrayList<>(); }
    public void addDiningTable(String diningTableId) { diningTableList.add(diningTableId); }
    public void addMenuItem(String menuItemId) { menuItemList.add(menuItemId); }
    @Override public String toString() { return "Restaurant{" + "restaurantId='" + restaurantId + "'" + ", name='" + name + "'" + ", diningTableList=" + diningTableList + ", menuItemList=" + menuItemList + '}'; }
    public String getRestaurantId() { return restaurantId; }
    public String getName() { return name; }
    public List<String> getDiningTableList() { return Collections.unmodifiableList(diningTableList); }
    public List<String> getMenuItemList() { return Collections.unmodifiableList(menuItemList); }
}
