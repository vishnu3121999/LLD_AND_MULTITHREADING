# Approach Comparison

## Existing Packages

`A_basic` demonstrates stores, products, inventory, customers, carts, checkout, inventory reduction, and paid order creation.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The grocery system supports stores.
- A store has inventory items.
- Inventory items point to products and carry quantity and price.
- Customers use carts and produce orders.

Action based points:
- Admin adds stores, customers, products, and inventory.
- User creates a cart, adds inventory items, and checks out.
- System calculates order total and reduces inventory.

Misc:
- A_basic assumes inventory exists and quantity is sufficient.
- Offers, delivery slots, payments, substitutions, and validations are deferred.

#### Common Misc

Offline or online:
- Treat as online/catalog because store, inventory, customer, cart, and order are stored independently.

Extensibility:
- Pricing, discounts, inventory reservation, and delivery assignment are future extension points.

History and undo:
- Order history exists through orders; undo is not needed in A_basic.

Notifications:
- Order confirmation notifications are future concerns.

Exception handling:
- Missing cart/product/inventory and insufficient stock are later validations.

Concurrency:
- Multiple users buying the same inventory is a later concurrency concern.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addStore/addProduct/addInventoryItem(Admin)
- createCart(User) -> create Cart(System)
- addItemToCart(User) -> read InventoryItem(System) -> add CartItem(System)
- checkout(User) -> calculateTotal(System) -> reduceInventory(System) -> create paid Order(System) -> clear Cart(System)

### Class Diagram

Layers:
- `Main` creates IDs and runs the cart flow.
- `GroceryStoreSystemFacade` owns setup, cart, and checkout workflows.
- `DataStore` stores maps only.
- Models own local state such as quantity and cart items.

Core entities:
- `Store(storeId, name, inventoryItemList)` stores inventory IDs.
- `Product(productId, name, brand)` stores catalog data.
- `InventoryItem(inventoryItemId, productId, quantity, price)` stores stock and price.
- `Customer(customerId, name)` represents buyer.
- `Cart(cartId, customerId, cartItemList)` stores chosen items.
- `Order(orderId, customerId, orderItemList, totalAmount, orderStatus)` stores checkout result.

Method placement:
- Cart and checkout workflows belong in the facade because they coordinate multiple entities.
- `reduceQuantity` belongs in `InventoryItem` because it only mutates stock.
- `pay` belongs in `Order` because payment is simulated as a simple status transition in A_basic.
