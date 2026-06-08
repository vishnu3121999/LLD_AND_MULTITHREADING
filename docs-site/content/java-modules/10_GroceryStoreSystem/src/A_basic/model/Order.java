package A_basic.model;

import A_basic.model.enums.OrderStatus;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Order {
    private final String orderId;
    private final String customerId;
    private final List<CartItem> orderItemList;
    private final double totalAmount;
    private OrderStatus orderStatus;
    public Order(String orderId, String customerId, List<CartItem> orderItemList, double totalAmount) { this.orderId = orderId; this.customerId = customerId; this.orderItemList = new ArrayList<>(orderItemList); this.totalAmount = totalAmount; this.orderStatus = OrderStatus.CREATED; }
    public void pay() { orderStatus = OrderStatus.PAID; }
    @Override public String toString() { return "Order{" + "orderId='" + orderId + "'" + ", customerId='" + customerId + "'" + ", orderItemList=" + orderItemList + ", totalAmount=" + totalAmount + ", orderStatus=" + orderStatus + '}'; }
    public String getOrderId() { return orderId; }
    public String getCustomerId() { return customerId; }
    public List<CartItem> getOrderItemList() { return Collections.unmodifiableList(orderItemList); }
    public double getTotalAmount() { return totalAmount; }
    public OrderStatus getOrderStatus() { return orderStatus; }
}
