package A_basic.model;

import A_basic.model.enums.OrderStatus;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Order {
    private final String orderId;
    private final String diningTableId;
    private final List<OrderItem> orderItemList;
    private final double totalAmount;
    private OrderStatus orderStatus;
    public Order(String orderId, String diningTableId, List<OrderItem> orderItemList, double totalAmount) { this.orderId = orderId; this.diningTableId = diningTableId; this.orderItemList = new ArrayList<>(orderItemList); this.totalAmount = totalAmount; this.orderStatus = OrderStatus.PLACED; }
    public void serve() { orderStatus = OrderStatus.SERVED; }
    @Override public String toString() { return "Order{" + "orderId='" + orderId + "'" + ", diningTableId='" + diningTableId + "'" + ", orderItemList=" + orderItemList + ", totalAmount=" + totalAmount + ", orderStatus=" + orderStatus + '}'; }
    public String getOrderId() { return orderId; }
    public String getDiningTableId() { return diningTableId; }
    public List<OrderItem> getOrderItemList() { return Collections.unmodifiableList(orderItemList); }
    public double getTotalAmount() { return totalAmount; }
    public OrderStatus getOrderStatus() { return orderStatus; }
}
