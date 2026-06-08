# Approach Comparison

## Existing Packages

`A_basic` demonstrates restaurants, tables, menu items, table reservation, order placement, and serving an order.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- A restaurant has dining tables and menu items.
- A table has capacity and status.
- An order belongs to a table and has order items.

Action based points:
- Admin adds restaurant, tables, and menu items.
- User reserves a table and places an order.
- System calculates order total.
- Staff/system marks order served.

Misc:
- A_basic assumes menu items and table are valid.
- Reservations calendar, kitchen workflow, billing, and validations are deferred.

#### Common Misc

Offline or online:
- Treat as online/storefront style with datastore maps.

Extensibility:
- Pricing, kitchen routing, reservation policy, and table assignment can be added later.

History and undo:
- Order history exists; undo is not needed in A_basic.

Notifications:
- Kitchen/table notifications are deferred.

Exception handling:
- Missing table/menu item and unavailable table are later validations.

Concurrency:
- Duplicate reservations and concurrent orders are later concerns.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addRestaurant/addDiningTable/addMenuItem(Admin)
- reserveTable(User) -> mark DiningTable reserved(System)
- placeOrder(User) -> build OrderItems(System) -> calculate total(System) -> create Order(System)
- serveOrder(System) -> mark Order served(System)

### Class Diagram

Core entities:
- `Restaurant(restaurantId, name, diningTableList, menuItemList)` stores table and menu item IDs.
- `DiningTable(diningTableId, capacity, tableStatus)` stores table state.
- `MenuItem(menuItemId, name, price)` stores menu data.
- `Order(orderId, diningTableId, orderItemList, totalAmount, orderStatus)` stores order data.
- `OrderItem(menuItemId, quantity, price)` snapshots item choice.

Method placement:
- `placeOrder` belongs in the facade because it coordinates menu items and order creation.
- `reserve` belongs in `DiningTable` because it only mutates table status.
- `serve` belongs in `Order` because it only mutates order status.
