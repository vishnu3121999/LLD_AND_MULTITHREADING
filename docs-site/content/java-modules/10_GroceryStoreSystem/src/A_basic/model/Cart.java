package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Cart {
    private final String cartId;
    private final String customerId;
    private final List<CartItem> cartItemList;
    public Cart(String cartId, String customerId) { this.cartId = cartId; this.customerId = customerId; this.cartItemList = new ArrayList<>(); }
    public void addCartItem(CartItem cartItem) { cartItemList.add(cartItem); }
    public void clear() { cartItemList.clear(); }
    @Override public String toString() { return "Cart{" + "cartId='" + cartId + "'" + ", customerId='" + customerId + "'" + ", cartItemList=" + cartItemList + '}'; }
    public String getCartId() { return cartId; }
    public String getCustomerId() { return customerId; }
    public List<CartItem> getCartItemList() { return Collections.unmodifiableList(cartItemList); }
}
