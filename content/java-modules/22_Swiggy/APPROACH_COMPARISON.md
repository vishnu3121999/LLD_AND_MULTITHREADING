# Approach Comparison

## Existing Packages

`A_basic` demonstrates customers, restaurants, menu items, delivery partners, order placement, partner assignment, and delivery completion.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system has customers, restaurants, menu items, delivery partners, and orders.
- Restaurants own menu item IDs.
- Orders store customer, restaurant, selected menu items, total, partner, and status.

Action based points:
- Admin adds customers, restaurants, menu items, and delivery partners.
- User places an order.
- System calculates total and assigns an available delivery partner.
- User/system completes delivery.

Misc:
- A_basic assumes menu items and partners are available.
- Search, cart, payment, restaurant acceptance, ETA, and validations are deferred.

#### Common Misc

Offline or online:
- Treat as online marketplace because all entities are independently stored.

Extensibility:
- Partner assignment, pricing, delivery fee, restaurant search, and notifications are future extensions.

History and undo:
- Order records provide history; cancellation is deferred.

Notifications:
- Customer/restaurant/partner notifications are deferred.

Exception handling:
- Missing restaurant/item/partner and unavailable partner are later validations.

Concurrency:
- Concurrent assignment of the same partner is deferred.

### UseCase Diagram

Actors:
- Customer
- Admin
- System

UseCases:
- addCustomer/addRestaurant/addMenuItem/addDeliveryPartner(Admin)
- placeOrder(Customer) -> calculate total(System) -> assignDeliveryPartner(System) -> create Order(System)
- completeOrder(System) -> mark Order delivered(System) -> mark partner available(System)

### Class Diagram

Core entities:
- `Customer(customerId, name)` stores customer data.
- `Restaurant(restaurantId, name, menuItemList)` stores menu IDs.
- `MenuItem(menuItemId, name, price)` stores menu data.
- `DeliveryPartner(deliveryPartnerId, name, partnerStatus)` stores rider availability.
- `Order(orderId, customerId, restaurantId, menuItemList, totalAmount, deliveryPartnerId, orderStatus)` stores order flow.

Method placement:
- `placeOrder` belongs in the facade because it coordinates menu items, partner assignment, and order creation.
- `assignDeliveryPartner` is a facade system method in A_basic; Strategy comes later.
- Partner and order status transitions stay in their entities.
