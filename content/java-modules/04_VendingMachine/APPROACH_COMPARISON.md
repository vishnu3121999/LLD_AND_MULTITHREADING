# 04_VendingMachine Approach Progression

These packages model a simple vending-machine system:

- Admin setup for products, racks, and stock
- Rack-id-based product selection where the rack id is the visible slot code
- Payment by cash or UPI with coin denominations for cash
- Greedy-order change calculation with bounded coin inventory
- Single-machine state stored as a simple field
- State-pattern package for state-specific transition behavior
- Concurrency package for single-machine transaction locking
- Selected rack state stored on the offline vending machine
- Offline-style object lookup through `DataStore`

The progression keeps each package runnable on its own. Later packages should copy the previous package and introduce one focused idea.

## A_basic: Rack Selection, Payment, Dispense, And Cancel

Main idea:

```text
VendingMachine, Product, Rack, and Payment are simple domain models
VendingMachine owns name, rack id list, selected rack id, current vending-machine state, and coin inventory
VendingMachine has no id and no payment type list
Rack stores rack id, product id, product count, and max count
Rack has no separate slot code; rack id is the visible slot code
Product does not store rack ids
Payment follows the 03_BookMyShow shape: abstract Payment with id, amount, status, concrete payment children, and PaymentProcessor
CashPayment stores the inserted coin list
Coin = ONE, TWO, FIVE, TEN, TWENTY, FIFTY
VendingMachine stores available change as Map<Coin, Integer>
PaymentStatus = PENDING, COMPLETED, FAILED
VendingMachineState = IDLE, PENDING_PAYMENT, READY_TO_DISPENSE
VendingMachine calculates change directly by trying largest available denominations first and backtracking within available coin counts
VendingMachineFacade.selectProduct returns the selected product price
PaymentProcessor.process accepts payment and selectedProductPrice
DispatcherService dispatches the selected product and change
VendingMachineFacade owns the first-version admin and user workflows directly
Main creates random ids for products, while rack ids use display codes like A1, A2, and B1
Facade method sequence is user methods, system methods, admin methods
Facade user methods select product, pay, and cancel before payment
Facade admin methods are add-only: add coin count, add product, add rack, add product to rack, and add product count
PaymentProcessor simulates external payment processing and updates PaymentStatus
DataStore is the storage interface
InMemoryDataStore stores one VendingMachine object directly, with no vendingMachineMap
InMemoryDataStore stores catalog and inventory objects in HashMap fields named productMap and rackMap
VendingMachine state is a simple enum field, not the State design pattern
Main demonstrates machine setup, product listing, rack-id selection, coin payment, direct change calculation, stock decrement, and cancel before payment
Main_Interactive provides a Scanner-based flow similar to 01_TicTacToe
```

Best for:

- A first interview-friendly vending-machine design
- Keeping the first version centered around one readable facade
- Separating fixed product catalog from machine rack stock
- Selecting products by visible rack id
- Representing cash payments with coin denominations
- Keeping change calculation inside VendingMachine before strategy is introduced
- Keeping dispatch behavior out of the facade through DispatcherService
- Showing machine state without introducing state classes
- Explaining the normal user flow before introducing payment strategy

Tradeoff:

- The facade is intentionally broad in package A; later packages can split behavior only when a new capability needs it.
- Payment processing is direct and type-based; strategy comes later.
- Package A keeps validation out of selection and payment flows; richer validation comes later.
- No thread-safety is guaranteed yet.

## B_Strategy: Change Strategy And Payment Strategies

Adds two focused strategy seams on top of A:

```text
ChangeCalculationStrategy defines calculateChange(changeAmount, coinMap)
GreedyChangeCalculationStrategy keeps the largest-denomination-first preference and backtracks within available coin counts
VendingMachine keeps calculateChange as its domain behavior, but delegates the algorithm to ChangeCalculationStrategy
PaymentStrategy defines pay(payment, selectedProductPrice)
CashPaymentStrategy owns adding inserted cash coins to the machine coin map
UPIPaymentStrategy simulates UPI payment
PaymentProcessor owns concrete CashPaymentStrategy and UPIPaymentStrategy fields, matching 03_BookMyShow B_Strategy
PaymentProcessor still updates PaymentStatus
No payment strategy factory is introduced in this package
```

Best for:

- Showing payment behavior variation before introducing factory.
- Moving change calculation algorithm out of VendingMachine without moving the vending-machine behavior itself.

Tradeoff:

- PaymentProcessor still selects strategies using `instanceof`.

## C_Factory: Payment Strategy Factory

Adds one focused idea on top of B:

```text
PaymentStrategyFactory chooses CashPaymentStrategy or UPIPaymentStrategy for a Payment object
PaymentProcessor depends on PaymentStrategyFactory instead of owning concrete strategy fields
Factory is used only for payment strategies
ChangeCalculationStrategy remains wired directly through VendingMachine
```

Best for:

- Matching the 03_BookMyShow C_Factory progression.
- Keeping payment strategy selection out of PaymentProcessor.

Tradeoff:

- Factory still switches on payment subclass; richer metadata can come later if needed.

## D_ExceptionHandling: Direct Built-In Exceptions

Adds one focused idea on top of C:

```text
VendingMachineFacade throws IllegalArgumentException for invalid method inputs such as blank ids, missing payment, non-positive price, non-positive stock count, and non-positive coin count
VendingMachineFacade and DispatcherService convert missing rack or product datastore lookups into NoSuchElementException
VendingMachineFacade throws RuntimeException for duplicate products, duplicate racks, rack product mismatch, rack capacity exceeded, out-of-stock rack, insufficient payment, and payment failure
Insufficient payment intentionally uses plain RuntimeException instead of a custom exception class
Rack remains a simple inventory model and does not throw exceptions in this package
VendingMachineFacade and DispatcherService resolve rack and product lookups before running rack business validations
VendingMachine owns machine state checks: select only from IDLE, pay only from PENDING_PAYMENT, complete only from READY_TO_DISPENSE, and cancel only from PENDING_PAYMENT
GreedyChangeCalculationStrategy validates exact change availability and uses greedy-order backtracking so limited coin inventory does not create false impossible cases
PaymentStrategyFactory throws IllegalArgumentException for unsupported payment objects
Main and Main_Interactive are the only catch boundaries
No validation chain or State pattern is introduced
```

Best for:

- Making invalid admin/user calls fail with interview-friendly messages.
- Keeping datastore null handling out of the datastore itself.
- Keeping state validation in the model class that owns the state.
- Showing exception handling without adding custom exception classes.

Tradeoff:

- Validation is direct and method-local.
- Cash insertion still happens before change dispatch; production rollback/refund handling is intentionally outside this package.

## D_ExceptionHandlingV2: No Argument Or Lookup Exceptions

Alternative exception-handling package copied from D:

```text
IllegalArgumentException validations are removed
NoSuchElementException lookup translations are removed
Facade and services use direct datastore access for rack and product lookups
RuntimeException remains for duplicate products, duplicate racks, rack product mismatch, rack capacity exceeded, out-of-stock rack, insufficient payment, and payment failure
Rack remains a simple inventory model and does not throw exceptions in this package
Facade and services keep rack business validations after direct datastore access
VendingMachine still owns machine state checks through IllegalStateException
GreedyChangeCalculationStrategy validates exact change availability and uses greedy-order backtracking so limited coin inventory does not create false impossible cases
PaymentStrategyFactory returns null for unsupported payment objects instead of throwing IllegalArgumentException
Main and Main_Interactive remain the only catch boundaries
```

Best for:

- Comparing explicit boundary validation against a minimal state-focused variant.
- Keeping exception discussion focused on business/state errors only.

Tradeoff:

- Bad input and missing lookup failures are intentionally less descriptive in this variant.

## E_StatePattern: State Objects For Machine Transitions

Adds one focused idea on top of D_ExceptionHandlingV2:

```text
VMState defines state-specific transition behavior and a next method for the normal forward transition
VendingMachine is the State Pattern context and delegates select, payment completion, dispense completion, and cancel to the current state
IdleState.next returns PendingPaymentState for product selection
PendingPaymentState.next returns ReadyToDispenseState after payment completion
ReadyToDispenseState.next returns IdleState after transaction completion
PendingPaymentState.cancelTransaction clears the selected rack through setSelectedRackId(null) and rolls back to IdleState
Invalid transitions throw IllegalStateException from the current state class
VendingMachine keeps selected rack id and coin inventory, exposes minimal context mutation methods for concrete states, and does not expose a separate clearSelection method
The existing VendingMachineState enum remains as read-only status output for Main and Main_Interactive
No facade-side state checks are added
No validation Chain of Responsibility is introduced
```

Best for:

- Keeping state-transition rules localized as machine states grow.
- Avoiding conditional growth inside VendingMachine.
- Preparing for future states like maintenance, refund, and dispatching without changing facade logic.

Tradeoff:

- More classes than enum checks, so it is introduced only after state behavior becomes explicit.

## F_Concurrency: Aggregate Locks For Single-Machine Transactions

Adds one focused idea on top of E_StatePattern:

```text
productMap and rackMap use ConcurrentHashMap because admin writes can run with user/admin reads
coinMap stays a regular HashMap because exact-change calculation plus coin reduction is a compound machine operation protected by the vending-machine lock
rackList stays a regular List because it belongs to the VendingMachine aggregate and is updated through the vending-machine lock
VendingMachineFacade synchronizes pay, cancel, and addCoin on the single VendingMachine aggregate
selectProduct validates rack product and stock, then updates selected rack without locking because pending selection is intentionally last-write-wins
PendingPaymentState.selectRack replaces the selected rack and keeps the machine in PENDING_PAYMENT
pay reads the selected rack through VendingMachine so stale payment attempts fail as machine state errors instead of datastore lookup errors
pay locks the VendingMachine and selected Rack through payment, change calculation, product dispatch, change dispatch, and state completion
DispatcherService locks Rack before stock check plus decrement
DispatcherService locks VendingMachine before change coin check plus decrement
Admin duplicate check plus insert operations lock the datastore
Rack product/capacity check plus update operations lock the specific Rack
VendingMachine returns snapshot copies for rack ids and coin inventory instead of exposing live mutable collection views
Main includes a two-thread demo where two users try to buy from a single-stock rack and only one succeeds
No locks are added to Product, enums, payment strategy factory, UPI payment strategy, or the stateless change strategy
No validation Chain of Responsibility is introduced
```

Best for:

- Preventing two users from interleaving selection, payment, dispense, and cancel on the same physical machine.
- Preventing rack stock from going negative when concurrent purchases target the same rack.
- Preventing change inventory from being calculated and reduced inconsistently.
- Keeping locking close to facade-owned workflows instead of blindly synchronizing every method.

Tradeoff:

- The single vending-machine lock serializes user transactions for this offline one-machine model.
- Long-running external payment calls are still inside the machine transaction boundary in this interview version.

## Planned Next Packages

```text
No next package planned yet.
```
