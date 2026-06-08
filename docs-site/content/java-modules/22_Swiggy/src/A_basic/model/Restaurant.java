package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Restaurant { private final String restaurantId; private final String name; private final List<String> menuItemList; public Restaurant(String restaurantId, String name) { this.restaurantId = restaurantId; this.name = name; this.menuItemList = new ArrayList<>(); } public void addMenuItem(String menuItemId) { menuItemList.add(menuItemId); } @Override public String toString() { return "Restaurant{" + "restaurantId='" + restaurantId + "'" + ", name='" + name + "'" + ", menuItemList=" + menuItemList + '}'; } public String getRestaurantId() { return restaurantId; } public String getName() { return name; } public List<String> getMenuItemList() { return Collections.unmodifiableList(menuItemList); } }
