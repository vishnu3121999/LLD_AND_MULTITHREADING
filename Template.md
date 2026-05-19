# Verbose LLD Interview Template / Playbook - Good

This template is meant to be used in an LLD interview where you need to convert a vague system statement into a clean object-oriented design, justify trade-offs, and optionally write code. The goal is not to mechanically force every design pattern, but to show that you can identify requirements, model the domain, separate responsibilities, handle edge cases, and evolve the design when the interviewer adds new constraints.

---

## 0. How to Use This Template in an Interview - Needs Refinement

In an LLD interview, do not start with classes immediately. First understand the problem, clarify the operating mode, identify the core entities, decide responsibilities, and then design APIs/services. A good flow is:

1. Clarify requirements.
2. Identify actors and use cases.
3. Identify core entities and relationships.
4. Decide where the system boundary is: offline/local program, server-side API, or production-style service.
5. Draw the class diagram.
6. Define the service/facade APIs.
7. Walk through important flows.
8. Add extensibility points.
9. Handle exceptions, edge cases, and concurrency.
10. Write code for the most important parts.

A useful sentence to say early:

> I will first clarify functional requirements and assumptions, then model the core entities, then expose the main operations through a service/facade layer, and finally discuss extensibility, concurrency, and edge cases.

---

# 1. Requirements

Requirements are the foundation of LLD. Most bad designs happen because the candidate starts coding before fixing the scope. Requirements can be divided into system-specific functional requirements and common non-functional or design-level requirements.

---

## 1.1 System-Specific Requirements

These are requirements that are unique to the problem being asked. (TODO - these fall into two categories)

### A. Physical / Structural Requirements

These describe the physical or conceptual structure of the system.

Examples:

#### Parking Lot

- A parking lot has multiple floors.
- Each floor has multiple parking spots.
- Spots can have different sizes: bike, compact, large, EV, handicapped, etc.
- A vehicle has a type and registration number.
- A ticket is issued when a vehicle enters. - (TODO)
- Payment is calculated when the vehicle exits. - (TODO)

#### Chess (TODO - Didnt review)

- A game has one board.
- A board has 64 cells.
- Each cell may or may not contain a piece.
- Pieces have colors and movement rules.
- A game has two players.
- The system tracks current turn, game status, and move history. 

#### Vending Machine (TODO - Didnt review)

- A vending machine has inventory slots.
- Each slot contains an item type and quantity.
- The machine accepts money.
- The user selects an item.
- The machine dispenses the item and returns change.

When clarifying physical structure, ask: (TODO - last 2 points feel too much)

- What are the main objects in the real world?
- What contains what?
- Is the relationship one-to-one, one-to-many, or many-to-many?
- Can a child object exist independently of the parent?
- Will the child object be queried independently?

---

### B. Action-Based Requirements

These describe what different actors can do. 
Often these actions are clubbed together and methioned in a single line.
So first find the actions and they club them into flows.

Examples: (TODO - Didnt review)

#### Parking Lot

User actions:

- Enter parking lot.
- Get ticket.
- Park vehicle.
- Pay fee.
- Exit parking lot.

Admin actions:

- Add floor.
- Add spot.
- Configure pricing strategy.
- Mark spot unavailable.

System actions:

- Assign nearest available spot.
- Calculate fee.
- Update spot availability.
- Generate ticket.

#### BookMyShow / Movie Booking

User actions:

- Search movies.
- View shows.
- Select seats.
- Book seats.
- Make payment.
- Cancel booking.

Admin actions:

- Add movie.
- Add theatre.
- Add screen.
- Add show.
- Configure seat pricing.

System actions:

- Lock selected seats temporarily.
- Confirm booking after payment.
- Release seats after timeout or payment failure.

When clarifying actions, ask:

- Who performs this action?
- What input is required?
- What output is returned?
- Which entities are read?
- Which entities are modified?
- What can go wrong?

---

## 1.2 Common Miscellaneous Requirements

These are reusable requirement checks that apply to many LLD problems.

---

## 1.2.1 Offline vs Online System

This is one of the most important early clarifications.

### Offline System

An offline system means the program runs locally in one process. Examples:

- TicTacToe command-line game.
- Chess local game.
- Snake and Ladder.
- Splitwise local machine coding version.
- Vending Machine
- ATM

Characteristics:

- Usually no API controller is needed.
- Usually no external database is needed.
- Parallelism is often 1 unless explicitly stated.
- The `main()` method acts like the UI/client.
- Objects can be held directly in memory.
- The current game/session can be stored in a facade/service object.

Example:

```java
public class Main {
    public static void main(String[] args) {
        Game game = new Game(player1, player2, new Board(3));
        GameService gameService = new GameService(game);

        while (!game.isOver()) {
            // read input
            // call service
            // print board
        }
    }
}
```

Important note:

Even for offline systems, design the service methods as if they could later become APIs. If the interviewer asks for an interactive version, simply run a loop in `main()` and call the same service methods.

Good interview line:

> I will design the core logic independent of the UI. For an offline version, the main method can simulate user input through a loop. If later converted to an online API, the same service layer can be reused behind controllers.

---

### Online System

An online system means the design is closer to server-side production code. Examples:

- Parking lot API.
- BookMyShow.
- Uber.
- Food delivery.
- Splitwise server-side version.

Characteristics:

- Controllers expose APIs.
- Services contain business logic.
- Datastore/repositories store state.
- Multiple users may access the system concurrently.
- Thread-safety and consistency matter.
- IDs are usually required for core entities.

Typical layers:

```text
Client / UI
   ↓
Controller / API Layer
   ↓
Service / Facade Layer
   ↓
Repository / Datastore Layer
   ↓
Database / In-memory Store
```

Good interview line:

> I will keep the service layer independent of whether the caller is REST API, CLI, or tests. Controllers only translate requests into service calls.

---

### Offline vs In-Memory vs Persistent

Do not confuse these two dimensions:

```text
Offline vs Online = how users interact with the system.
In-memory vs Persistent = where state is stored.
```

Examples:

| System Type | Storage Type | Example |
|---|---|---|
| Offline + In-memory | Local game in one process | TicTacToe CLI |
| Offline + Persistent | Local app with saved state | Desktop expense tracker |
| Online + In-memory | API simulation for interview | Parking lot service with maps |
| Online + Persistent | Production service | BookMyShow with DB |

In LLD interviews, you can often start with online + in-memory because it gives clean APIs while avoiding DB details.

---

## 1.2.2 Concurrency and Thread Safety

Ask whether multiple users/threads can operate at the same time.

Concurrency matters when:

- Multiple users can book the same seat.
- Multiple drivers can accept the same ride.
- Multiple vehicles can try to occupy the same parking spot.
- Multiple players/users can modify the same game/session.
- Multiple payments can update the same booking.

Concurrency may not matter when:

- The problem is clearly offline and single-player/single-threaded.
- A game loop processes one move at a time.
- The interviewer explicitly says assume one request at a time.

Good interview line:

> I will first design the single-threaded version. If concurrent requests are in scope, I will protect check-and-update sections using locks or atomic operations.

---

## 1.2.3 History, Undo, and Replay

Ask whether the system needs to store history.

Examples:

- Chess: move history.
- TicTacToe: move history.
- Splitwise: transaction history.
- Parking lot: ticket/payment history.
- Vending machine: transaction logs.

If undo is required, consider:

- Command Pattern.
- Memento Pattern.
- Event log / history stack.

### Command Pattern

Use when each action can be represented as an object that knows how to execute and undo itself.

Example:

```java
interface Command {
    void execute();
    void undo();
}
```

Useful for:

- Undo/redo.
- Audit log.
- Replay.
- Encapsulating operations.

### Memento Pattern

Use when you want to save snapshots of object state.

Useful for:

- Board games.
- Editor state.
- Restoring previous state.

Trade-off:

- Command stores operations.
- Memento stores snapshots.

Good interview line:

> If undo is required, I can store each move as a command or store board snapshots as mementos. Command is more memory efficient if undo logic is simple; memento is simpler if state is small.

---

## 1.2.4 Extensibility

Extensibility means adding new types or behavior with minimal changes to existing code.

Think in two buckets:

```text
Entity extensibility  → abstract class / inheritance / composition
Behavior extensibility → strategy / factory / policy classes
```

Examples:

### Entity Extensibility

Parking lot:

- `Vehicle` → `Bike`, `Car`, `Truck`, `ElectricCar`
- `ParkingSpot` → `BikeSpot`, `CompactSpot`, `LargeSpot`, `EVSpot`

Chess:

- `Piece` → `King`, `Queen`, `Bishop`, `Knight`, `Rook`, `Pawn`

Payment:

- `Payment` → `CardPayment`, `UPIPayment`, `CashPayment`

### Behavior Extensibility

Parking lot:

- Spot assignment strategy: nearest spot, cheapest spot, random spot.
- Fee calculation strategy: hourly, daily, weekend pricing.

BookMyShow:

- Seat pricing strategy: normal, premium, dynamic pricing.
- Seat locking strategy: pessimistic lock, optimistic lock, timeout-based lock.

Uber:

- Driver matching strategy: nearest driver, highest-rated driver, cheapest driver.
- Fare calculation strategy: distance-based, surge pricing, time-based.

Good interview line:

> Wherever the entity itself has different state and behavior, I will model it using inheritance. Wherever only an algorithm varies, I will use Strategy.

---

## 1.2.5 Exception Handling

Handle invalid actions and invalid data explicitly.

Common exception categories:

### IllegalStateException

Use when an operation is invalid because of the current state of the object/system.

Examples:

- Trying to dispense an item before payment in a vending machine.
- Trying to make a move after the game is over.
- Trying to exit parking lot without payment.
- Trying to cancel an already completed ride.

### IllegalArgumentException

Use when method arguments are invalid.

Examples:

- Negative amount.
- Invalid board position.
- Invalid vehicle number.
- Seat count less than 1.

### NoSuchElementException / NotFoundException

Use when an expected entity is missing.

Examples:

- User not found.
- Ticket not found.
- Booking not found.
- Parking spot not found.

### Custom Domain Exceptions

Use when the exception is important enough in the domain.

Examples:

- `ParkingFullException`
- `SeatAlreadyBookedException`
- `InsufficientBalanceException`
- `InvalidMoveException`
- `ItemOutOfStockException`

Good interview line:

> I will throw domain-specific exceptions for important business failures and catch them at the boundary layer, such as controller or main method.

---

## 1.2.6 Notifications / Broadcasts

Ask whether events need to be broadcast to multiple listeners.

Use Observer Pattern when:

- Multiple subscribers need to react to the same event.
- The publisher should not know concrete subscribers.
- Adding a new listener should not require changing business logic.

Examples:

- Booking confirmed → send email, SMS, push notification, analytics event.
- Ride accepted → notify rider, driver, monitoring system.
- Game completed → update leaderboard, notify players.
- Payment successful → update booking, send receipt, log transaction.

Do not overuse Observer for simple one-to-one responses.

Bad use:

- User calls `bookTicket()` and the service directly returns the ticket. No observer needed.

Good use:

- User calls `bookTicket()` and multiple downstream systems need to react.

Good interview line:

> If the event has multiple independent subscribers, I will use Observer/EventBus. If it is only a direct response to the caller, I will simply return the result.

---

# 2. Use Case Diagram

The use case diagram is a simple way to show actors and their actions. You do not need to draw a formal UML diagram unless asked. A structured list is enough.

---

## 2.1 Actors

Common actors:

- User / Customer.
- Admin.
- System.
- External service.
- Operator.
- Guest.

Examples:

### Parking Lot

- Driver/User.
- Admin.
- Payment Gateway.
- System.

### BookMyShow

- Customer.
- Theatre Admin.
- Payment Gateway.
- Notification Service.
- System.

### TicTacToe

- Player.
- Game System.

---

## 2.2 Use Cases

For each actor, list what they can do.

Template:

```text
Actor: User
- Register/login, if needed
- Search/view available resources
- Create/modify/cancel transaction
- Make payment, if needed
- View status/history

Actor: Admin
- Add/update/remove resources
- Configure rules/pricing
- View reports/status

Actor: System
- Assign resources
- Validate state transitions
- Calculate price/result
- Send notifications
- Maintain logs/history
```

Example for Parking Lot:

```text
Driver:
- Enter parking lot
- Get ticket
- Park vehicle
- Pay fee
- Exit parking lot

Admin:
- Add floor
- Add parking spot
- Configure pricing strategy
- Mark spot unavailable

System:
- Find available spot
- Generate ticket
- Calculate fee
- Update spot status
```

---

# 3. Class Diagram / Layering

Before designing classes, clarify which layer each class belongs to.

---

## 3.1 Production vs Interview In-Memory Design

In production, you may have:

```text
Controller
Service
Repository
Database
External clients
Async workers
Cache
```

In an LLD interview, you can simplify to:

```text
Main / Driver
Service / Facade
InMemoryDataStore
Core Entities
Strategies / Factories
```

Good interview line:

> I will design this in a way that currently uses in-memory storage, but the storage is behind an interface so it can later be replaced by a persistent repository.

---

## 3.2 Layer Responsibilities

### Controller / API Layer

Belongs to server code.

Responsibilities:

- Receive API request.
- Validate basic request format.
- Convert DTO to domain/service input.
- Call service.
- Convert service response to API response.
- Catch exceptions and map them to HTTP responses.

Should not contain:

- Business logic.
- Complex state transitions.
- Pricing algorithms.
- Assignment logic.

---

### Service / Facade Layer

Belongs to server/application code.

Responsibilities:

- Expose use-case-level methods.
- Orchestrate multiple entities.
- Fetch/update data from datastore.
- Apply business rules.
- Handle transactions/consistency.
- Call strategies/factories.
- Publish events if needed.

Examples:

```java
public class ParkingLotService {
    public Ticket parkVehicle(Vehicle vehicle) { ... }
    public Receipt exitVehicle(String ticketId, PaymentMode paymentMode) { ... }
}
```

---

### Core Entities / Models

Belong to domain/library code.

Responsibilities:

- Hold domain state.
- Encapsulate simple operations on their own fields.
- Maintain invariants of the entity.

Examples:

- `User`
- `Vehicle`
- `ParkingSpot`
- `Ticket`
- `Board`
- `Piece`
- `Booking`

Core entities should not depend on controllers or databases.

---

### Strategies / Policies

Belong to library/domain code.

Responsibilities:

- Encapsulate algorithms that can vary.
- Avoid large `if-else` or `switch` blocks.
- Make behavior extensible.

Examples:

- `FeeCalculationStrategy`
- `SpotAssignmentStrategy`
- `WinningStrategy`
- `MovementStrategy`
- `DriverMatchingStrategy`

---

### Factories

Belong to library/domain code or application setup code.

Responsibilities:

- Encapsulate complex object creation.
- Create subtype objects based on type.
- Avoid repeated switch logic in clients.

Examples:

- `VehicleFactory`
- `PaymentStrategyFactory`
- `PieceFactory`

Do not create factories for every simple object.

---

### Datastore / Repository

Belongs to persistence/data layer.

Responsibilities:

- Store and retrieve entities.
- Hide in-memory vs DB details.
- Provide lookup methods.

Examples:

```java
interface ParkingLotRepository {
    Optional<ParkingLot> findLotById(String lotId);
    Optional<ParkingSpot> findSpotById(String spotId);
    void saveTicket(Ticket ticket);
}
```

For machine coding, one `InMemoryDataStore` class with maps is usually enough.

---

### Main / Driver / Client

Belongs to client code or test code.

Responsibilities:

- Instantiate datastore.
- Instantiate strategies.
- Instantiate services.
- Create sample objects.
- Simulate API calls or user input.

The main method is like a UI. It converts user input/forms into objects and calls service methods.

Example:

```java
public class Main {
    public static void main(String[] args) {
        DataStore dataStore = new InMemoryDataStore();
        SpotAssignmentStrategy assignmentStrategy = new NearestSpotStrategy();
        FeeCalculationStrategy feeStrategy = new HourlyFeeStrategy();

        ParkingLotService service = new ParkingLotService(
            dataStore,
            assignmentStrategy,
            feeStrategy
        );

        User user = new User("U1", "Vishnu");
        Vehicle vehicle = new Car("V1", "AP01AB1234");
        service.registerUser(user);
        service.parkVehicle(vehicle);
    }
}
```

---

# 4. Designing Core Entities

Core entities are the most important part of LLD. A clean domain model makes the rest of the design natural.

---

## 4.1 How to Identify Core Entities

Look for these categories:

### A. Infrastructure / Physical Entities

These compose the system.

Examples:

- Parking lot, floor, spot.
- Theatre, screen, seat.
- Board, cell.
- Vending machine, rack, slot.

### B. User Entities

These represent people or system users.

Examples:

- User.
- Admin.
- Player.
- Driver.
- Rider.

These are optional in simple offline problems.

### C. Transaction / Connector Entities

These connect users with infrastructure.

Examples:

- Ticket.
- Booking.
- Move.
- RideRequest.
- Payment.
- Order.

These are often the most important entities because they represent business state transitions.

---

## 4.2 Entity Identification Checklist

For every candidate entity, ask:

- Does it have identity?
- Does it have state?
- Does it have behavior?
- Is it queried independently?
- Is it stored separately?
- Does it participate in relationships with other entities?
- Does it have a lifecycle/status?
- Does it need history?

If yes to many of these, it is probably a core entity.

---

## 4.3 Fields

Fields should represent the entity's own state.

Example:

```java
class Ticket {
    private String id;
    private String vehicleId;
    private String spotId;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private TicketStatus status;
}
```

Avoid putting unrelated fields inside an entity just because another method needs them.

Bad:

```java
class Ticket {
    private PricingStrategy pricingStrategy;
    private PaymentGateway paymentGateway;
}
```

Better:

```java
class ParkingLotService {
    private PricingStrategy pricingStrategy;
    private PaymentGateway paymentGateway;
}
```

---

## 4.4 Methods Inside Entities

A method should be inside an entity when:

- It acts mostly on the entity's own fields.
- It protects the entity's invariants.
- It is not a high-level business use case involving many entities.

Examples:

```java
class ParkingSpot {
    public boolean isAvailable() { ... }
    public void occupy(String vehicleId) { ... }
    public void release() { ... }
}
```

```java
class Board {
    public boolean isInside(Position position) { ... }
    public Piece getPiece(Position position) { ... }
    public void movePiece(Position from, Position to) { ... }
}
```

A method should go to service when:

- It coordinates multiple entities.
- It calls datastore/repository.
- It represents a user use case.
- It depends on strategies or external services.

Examples:

```java
class ParkingLotService {
    public Ticket parkVehicle(Vehicle vehicle) { ... }
    public Receipt exitVehicle(String ticketId) { ... }
}
```

---

## 4.5 Getter/Setter Rule

Do not blindly create getters and setters for every field.

Use getters when:

- Another class genuinely needs to read that value.
- The value is part of a response or decision.

Use setters carefully because they can break invariants.

Prefer meaningful methods:

```java
spot.occupy(vehicleId);
spot.release();
booking.confirm();
booking.cancel();
```

Instead of:

```java
spot.setAvailable(false);
booking.setStatus(BookingStatus.CONFIRMED);
```

Good interview line:

> I will expose behavior-oriented methods instead of setters wherever state transitions need validation.

---

## 4.6 Reverse Links

Reverse links are references from child to parent or related objects.

Example:

```text
ParkingLot → List<Floor>
Floor → List<Spot>
Spot → Floor?
```

Ask whether reverse lookup is needed.

Use reverse links when:

- You frequently need to navigate from child to parent.
- The child needs parent context for validation.
- It improves performance or simplifies logic.

Avoid reverse links when:

- They are not needed.
- They create circular dependencies.
- They complicate serialization/storage.

For in-memory design, object references may be okay. For persistent design, IDs are safer.

---

## 4.7 Object Reference vs ID Reference

This is a common LLD decision.

### Use Object References When

- The relationship is strong composition.
- The child does not exist independently.
- The child is not queried independently.
- The system is offline/in-memory.

Example:

```java
class Game {
    private Board board;
}
```

A chess game has exactly one board, and the board is not queried independently outside the game.

---

### Use IDs When

- The entity is stored independently.
- The entity can be queried independently.
- The relationship is one-to-many or many-to-many.
- You want a DB-friendly design.

Example:

```java
class ParkingLot {
    private List<String> floorIds;
}

class Floor {
    private List<String> spotIds;
}
```

A parking spot can be independently queried while assigning a ticket.

Good interview line:

> For a pure in-memory version I can keep object references, but for DB-friendly design I will store IDs between aggregate roots.

---

# 5. Inheritance, Interfaces, and Abstract Classes

This is one of the most important design decisions in LLD.

---

## 5.1 When to Use Abstract Class

Use abstract class when:

- Subclasses share common state.
- Subclasses share common helper methods.
- There is a clear is-a relationship.
- You want to reduce duplicated fields/getters/setters.

Examples:

```java
abstract class Vehicle {
    protected String id;
    protected String registrationNumber;
    protected VehicleType type;

    protected Vehicle(String id, String registrationNumber, VehicleType type) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public VehicleType getType() {
        return type;
    }
}

class Car extends Vehicle {
    public Car(String id, String registrationNumber) {
        super(id, registrationNumber, VehicleType.CAR);
    }
}
```

Good for:

- `Vehicle` hierarchy.
- `ParkingSpot` hierarchy.
- `Piece` hierarchy in chess.
- `Account` hierarchy.

---

## 5.2 When to Use Interface

Use interface when:

- You want to represent behavior/capability.
- There is no shared state.
- Multiple inheritance of type is useful.
- It is a strategy/policy.

Examples:

```java
interface FeeCalculationStrategy {
    Money calculateFee(Ticket ticket);
}

interface SpotAssignmentStrategy {
    ParkingSpot findSpot(Vehicle vehicle, ParkingLot lot);
}
```

Good for:

- Strategies.
- Repositories.
- Payment gateways.
- Notification channels.

---

## 5.3 Simple Rule for Interviews

```text
Core entity with common state → abstract class
Pure behavior variation → interface
Fixed values with no behavior → enum
```

Examples:

```text
Vehicle, Piece, ParkingSpot → abstract class
FeeStrategy, PaymentStrategy → interface
VehicleType, BookingStatus → enum
```

---

## 5.4 Interface With Extra Methods Problem

If an interface has a method, every implementation must meaningfully support it. Otherwise, you may violate LSP.

Bad:

```java
interface Piece {
    boolean canCastle();
}
```

Only King can castle, so this is wrong for all pieces.

Better:

```java
class King extends Piece {
    public boolean canCastle(...) { ... }
}
```

Or use a specific capability interface only when needed:

```java
interface CastleCapable {
    boolean canCastle(...);
}
```

But avoid overengineering in interviews unless the capability is central.

---

## 5.5 Downcasting Warning

Downcasting usually means the abstraction is incomplete or the caller knows too much.

Example:

```java
if (piece instanceof King) {
    ((King) piece).castle();
}
```

This may be acceptable in rare cases, but generally prefer:

- Put common behavior in parent if all children support it.
- Move special behavior to the subclass and call it only in a context that knows it has that subclass.
- Use strategy or capability interface if behavior is extensible.

Good interview line:

> I will avoid exposing subtype-specific behavior through downcasting unless the use case is genuinely subtype-specific.

---

# 6. Extensibility Design

Extensibility should be intentional. Do not add abstract classes, factories, strategies, and observers everywhere.

---

## 6.1 Entity Extensibility Decision Tree

For each entity, ask:

```text
Can this entity have multiple types?
```

If no:

- Model it as a simple class.

If yes:

Ask:

```text
Do the types have different state or behavior?
```

If yes:

- Use inheritance, usually abstract class for core entities.

If only one field changes:

- Use enum.

If only algorithm changes and state is same:

- Use Strategy.

---

## 6.2 Options for Extensible Entities

### Option 1: Multiple Independent Simple Classes

Example:

```java
class Car { ... }
class Bike { ... }
```

Problem:

- No polymorphism.
- Service cannot work with common parent type.
- Duplicated logic.

Usually avoid.

---

### Option 2: Single Class With Type Enum

Example:

```java
class Vehicle {
    private VehicleType type;
}
```

Good when:

- Only type changes.
- No different behavior.
- No different fields.

Bad when:

- Behavior differs by type.
- You start writing many switch statements.

---

### Option 3: Inheritance

Example:

```java
abstract class Vehicle { ... }
class Car extends Vehicle { ... }
class Bike extends Vehicle { ... }
```

Good when:

- Common state exists.
- Subtypes have specific behavior.
- You want polymorphism.

---

### Option 4: Composition With Strategy

Example:

```java
class Vehicle {
    private ParkingEligibilityStrategy eligibilityStrategy;
}
```

Good when:

- Entity state is mostly same.
- Only one behavior varies.
- You want behavior to be changed at runtime.

Can be overkill when inheritance is simpler.

---

## 6.3 Behavior Extensibility Decision Tree

For each important business method, ask:

```text
Can this algorithm change independently of the entity?
```

If yes, use Strategy.

Examples:

- Fee calculation.
- Spot assignment.
- Driver matching.
- Winner checking.
- Discount calculation.
- Payment processing.

Good strategy interface:

```java
interface FeeCalculationStrategy {
    Money calculate(Ticket ticket, ParkingSpot spot);
}
```

Implementations:

```java
class HourlyFeeStrategy implements FeeCalculationStrategy { ... }
class DailyFeeStrategy implements FeeCalculationStrategy { ... }
class WeekendFeeStrategy implements FeeCalculationStrategy { ... }
```

---

## 6.4 Strategy Inside Entity vs Service

This is a common confusion.

### Keep Strategy in Service When

- The behavior is a business use case.
- The behavior uses multiple entities.
- The behavior may depend on configuration.
- The entity should remain lightweight.

Example:

```java
class ParkingLotService {
    private FeeCalculationStrategy feeStrategy;
}
```

Better than putting fee calculation inside `Ticket`, because fee may need ticket, vehicle, spot, pricing rules, day/time, discount, etc.

---

### Keep Behavior in Entity When

- The behavior naturally belongs to that entity.
- It mostly uses the entity's own fields.
- Different subclasses implement the behavior differently.

Example:

```java
abstract class Piece {
    public abstract boolean canMove(Board board, Position from, Position to);
}
```

Each chess piece has a different movement rule, so keeping `canMove` in the piece hierarchy is natural.

---

## 6.5 Example: Chess Piece Design

### Option 1: Direct Inheritance

```java
abstract class Piece {
    protected Color color;
    public abstract boolean canMove(Board board, Position from, Position to);
}

class Bishop extends Piece {
    public boolean canMove(Board board, Position from, Position to) { ... }
}

class Knight extends Piece {
    public boolean canMove(Board board, Position from, Position to) { ... }
}
```

Advantages:

- Simple.
- Natural OO design.
- Each piece owns its movement rule.
- No unnecessary strategy classes.

Disadvantages:

- Changing movement dynamically is harder.
- Shared movement logic must be extracted carefully.

Best for interviews.

---

### Option 2: Piece With Movement Strategy

```java
class Piece {
    private Color color;
    private MovementStrategy movementStrategy;

    public boolean canMove(Board board, Position from, Position to) {
        return movementStrategy.canMove(board, from, to);
    }
}
```

Advantages:

- Behavior is highly composable.
- Movement can be changed at runtime.

Disadvantages:

- More classes.
- Less natural for standard chess.
- May violate KISS in interviews.

Conclusion:

For chess LLD, direct inheritance is usually cleaner.

---

## 6.6 Example: TicTacToe Winning Strategy

For TicTacToe, winner-checking can be a strategy because different game variations may have different winning rules.

Examples:

- Standard 3x3 TicTacToe.
- NxN TicTacToe.
- Connect K.
- Misere TicTacToe.

```java
interface WinningStrategy {
    boolean hasWon(Board board, Symbol symbol, Move lastMove);
}
```

The `GameService` or `Game` can use this strategy after every move.

Where to keep the strategy?

- If `Game` controls the move flow, keep the winning strategy inside `Game`.
- If `GameService` orchestrates moves, keep it inside `GameService`.

A clean design:

```java
class Game {
    private Board board;
    private WinningStrategy winningStrategy;

    public void makeMove(Player player, Position position) {
        // validate turn
        // update board
        // check winner using strategy
    }
}
```

This is acceptable because the game owns the board and the game flow.

---

# 7. Service / Facade Design

The facade/service exposes operations that match use cases.

---

## 7.1 Why Use a Facade

The facade gives a simple API to the outside world.

Without facade:

- Main/controller talks directly to many entities.
- Business logic gets scattered.
- Consistency becomes hard.

With facade:

- One class orchestrates use cases.
- Controllers remain thin.
- Main method remains simple.
- Easy to test use cases.

---

## 7.2 Facade Fields

Typical service fields:

```java
class ParkingLotService {
    private final DataStore dataStore;
    private final SpotAssignmentStrategy spotAssignmentStrategy;
    private final FeeCalculationStrategy feeCalculationStrategy;
    private final PaymentService paymentService;
    private final EventPublisher eventPublisher;
}
```

Fields can include:

- Datastore/repositories.
- Other services.
- Strategies.
- Factories.
- Event publishers.
- Locks, if needed.

---

## 7.3 Facade Methods

Group methods by actor.

### Admin Methods

Examples:

```java
boolean registerUser(User user);
boolean addParkingFloor(String lotId, ParkingFloor floor);
boolean addParkingSpot(String floorId, ParkingSpot spot);
boolean configurePricingStrategy(FeeCalculationStrategy strategy);
```

### User Methods

Examples:

```java
Ticket enterParkingLot(String lotId, Vehicle vehicle);
Receipt exitParkingLot(String ticketId, PaymentMode paymentMode);
Booking bookSeats(String userId, String showId, List<String> seatIds);
void cancelBooking(String bookingId);
```

### System Methods

Examples:

```java
void releaseExpiredSeatLocks();
void notifyBookingConfirmed(String bookingId);
void reconcilePayments();
```

---

## 7.4 Service Method Template

For every service method, follow this structure:

```text
1. Fetch all required entities.
2. Validate inputs and entity existence.
3. Validate current state.
4. Execute business logic.
5. Update all affected entities.
6. Persist changes.
7. Publish events, if required.
8. Return response.
```

Example:

```java
public Ticket parkVehicle(String lotId, Vehicle vehicle) {
    ParkingLot lot = dataStore.getParkingLot(lotId)
        .orElseThrow(() -> new NotFoundException("Lot not found"));

    ParkingSpot spot = spotAssignmentStrategy.findSpot(lot, vehicle)
        .orElseThrow(() -> new ParkingFullException("No spot available"));

    spot.occupy(vehicle.getId());

    Ticket ticket = new Ticket(
        idGenerator.generate(),
        vehicle.getId(),
        spot.getId(),
        LocalDateTime.now()
    );

    dataStore.saveVehicle(vehicle);
    dataStore.saveSpot(spot);
    dataStore.saveTicket(ticket);

    return ticket;
}
```

---

## 7.5 Where to Catch Exceptions

General rule:

```text
Throw inside domain/service.
Catch at boundary.
```

Boundary means:

- Controller in server-side design.
- Main method in CLI design.
- Test case in unit testing.

Do not catch exceptions in every small method unless you can recover.

Good interview line:

> The service will throw domain exceptions, and the controller/main layer will catch them and convert them into user-friendly responses.

---

# 8. Datastore / Repository Design

---

## 8.1 In-Memory DataStore

For interviews, in-memory maps are usually enough.

Example:

```java
class InMemoryDataStore {
    private final Map<String, User> users = new HashMap<>();
    private final Map<String, Vehicle> vehicles = new HashMap<>();
    private final Map<String, ParkingSpot> spots = new HashMap<>();
    private final Map<String, Ticket> tickets = new HashMap<>();
}
```

If concurrency is in scope, consider:

```java
private final Map<String, Ticket> tickets = new ConcurrentHashMap<>();
```

But remember: concurrent collections only make individual map operations thread-safe. They do not automatically make multi-step business operations safe.

---

## 8.2 Repository Interface

Use an interface if you want storage to be replaceable.

```java
interface TicketRepository {
    Optional<Ticket> findById(String ticketId);
    void save(Ticket ticket);
}

class InMemoryTicketRepository implements TicketRepository { ... }
class SqlTicketRepository implements TicketRepository { ... }
```

For machine coding, a single `InMemoryDataStore` is simpler. For LLD discussions, interfaces show extensibility.

---

## 8.3 Offline Games and Datastore

For offline games:

- Usually no datastore is required.
- No need to register every entity in maps.
- Create objects directly in `main()`.
- Store game state inside `Game` or `GameService`.
- Store history only if undo/replay is required.

Example:

```java
Game game = new Game(player1, player2, new Board(3), winningStrategy);
GameService service = new GameService(game);
```

No need for:

```java
Map<String, Board> boards;
Map<String, Cell> cells;
```

unless boards/cells are independently queried.

---

## 8.4 Which Objects Need IDs?

Use IDs when:

- The object is stored independently.
- It is referenced by other objects.
- It is queried independently.
- Logs/debugging need stable identification.
- It maps naturally to a DB row.

No ID may be needed when:

- The object is a value object.
- It exists only inside a parent.
- It is never queried independently.

Examples:

### Parking Lot Spot

A parking spot should usually have an ID because:

- A lot has many spots.
- Tickets refer to spots.
- Spot availability is queried independently.
- In SQL, spots would be normalized into a separate table.

### Chess Board

A board may not need an ID because:

- A game has exactly one board.
- The board is not queried independently.
- It can be stored inside the game object.

Good interview line:

> If the object is an aggregate root or independently queried, I will give it an ID. If it is a value object fully owned by another object, I may keep it embedded.

---

# 9. Object Creation and Registration

---

## 9.1 Create Objects in Main / Controller

The main/controller acts like UI. It receives input and converts it into objects or request DTOs.

Example:

```java
User user = new User("U1", "Vishnu");
service.registerUser(user);
```

For inheritance-based objects:

```java
Vehicle vehicle = VehicleFactory.createVehicle(
    VehicleType.CAR,
    "V1",
    "AP01AB1234"
);
service.registerVehicle(vehicle);
```

Creating IDs in main/test code is often useful for readable logs:

```text
U1, U2, V1, T1, B1
```

instead of random UUIDs during interview demos.

In production, ID generation can move into service or infrastructure.

---

## 9.2 Registration Methods

Service methods can register created objects.

Examples:

```java
boolean registerUser(User user);
boolean registerVehicle(Vehicle vehicle);
boolean addParkingSpot(String floorId, ParkingSpot spot);
```

If short on time during coding, you can insert directly into datastore from main for setup data, but mention that in production this should go through service/admin APIs.

Good interview line:

> For demo setup, I may seed the datastore directly, but real user/admin operations should go through service methods so validations are not bypassed.

---

## 9.3 Factory Pattern

Use Factory when object creation depends on type or involves complex construction.

Good use cases:

- Create `Vehicle` based on `VehicleType`.
- Create `PaymentStrategy` based on payment mode.
- Create `Piece` based on piece type.
- Create external clients from configuration.

Example:

```java
class VehicleFactory {
    public static Vehicle createVehicle(VehicleType type, String id, String number) {
        switch (type) {
            case CAR: return new Car(id, number);
            case BIKE: return new Bike(id, number);
            case TRUCK: return new Truck(id, number);
            default: throw new IllegalArgumentException("Unsupported vehicle type");
        }
    }
}
```

---

## 9.4 When Not to Use Factory

Do not use factory for simple classes without creation complexity.

Overkill:

```java
User user = UserFactory.createUser("U1", "Vishnu");
```

Better:

```java
User user = new User("U1", "Vishnu");
```

Good interview line:

> I could create a factory for this, but since object creation is simple and there are no subtypes, that would be overengineering and would violate KISS.

---

## 9.5 Builder Pattern

Use Builder when:

- The object has many optional fields.
- Constructor becomes too long.
- You want readable object creation.
- Request objects have many parameters.

Good examples:

- `RideRequest`
- `BookingRequest`
- `NotificationRequest`
- `PaymentRequest`

Example:

```java
BookingRequest request = BookingRequest.builder()
    .userId("U1")
    .showId("S1")
    .seatIds(List.of("A1", "A2"))
    .couponCode("NEWUSER")
    .build();
```

Avoid builder for tiny objects with 2-3 required fields.

---

## 9.6 Singleton Pattern

Use Singleton carefully. It is often overused.

Acceptable cases:

- Configuration manager.
- Logger.
- Application-wide registry in a small demo.

Avoid Singleton for:

- Services that need dependency injection.
- Repositories in testable code.
- Anything that makes tests hard.

Good interview line:

> In production I would prefer dependency injection over Singleton. For interview simplicity, singleton can be used for configuration-like classes.

---

# 10. Handling Non-Functional Requirements

---

## 10.1 Creation Patterns Summary

| Need | Pattern |
|---|---|
| Create subtype based on type | Factory |
| Many optional constructor parameters | Builder |
| One shared configuration-like instance | Singleton |
| Vary algorithm independently | Strategy |
| Notify multiple subscribers | Observer |
| Manage state-specific behavior | State |
| Undo/replay operations | Command/Memento |

Do not force a pattern. First identify the problem, then apply the pattern.

---

## 10.2 Observer Pattern

Use Observer when one event has multiple subscribers.

Example:

```java
interface EventListener {
    void onEvent(Event event);
}

class EventPublisher {
    private List<EventListener> listeners;

    public void publish(Event event) {
        for (EventListener listener : listeners) {
            listener.onEvent(event);
        }
    }
}
```

Possible listeners:

- EmailNotificationService.
- PushNotificationService.
- WebSocketService.
- AnalyticsService.
- MonitoringService.

Do not use Observer for simple one-to-one method response.

---

## 10.3 State Pattern

Use State Pattern when behavior depends heavily on the current state and invalid order of operations is common.

Examples:

- Vending machine.
- ATM.
- Elevator.
- Order lifecycle.
- Ride lifecycle.

### Without State Pattern

```java
if (state == IDLE) { ... }
else if (state == HAS_MONEY) { ... }
else if (state == ITEM_SELECTED) { ... }
```

Problem:

- Large conditionals.
- Hard to add new states.
- State transition logic scattered.

### With State Pattern

```java
interface VendingMachineState {
    void insertMoney(VendingMachine machine, Money money);
    void selectItem(VendingMachine machine, String itemCode);
    void dispense(VendingMachine machine);
}
```

Each state decides which operations are valid.

Good interview line:

> I will first show state validation with simple checks. If the number of states and transitions grows, I will refactor to State Pattern.

---

## 10.4 When UI Can Hide Invalid Actions

Some invalid actions are prevented by UI.

Example:

- In a ride booking app, user may not see `cancelRide` before booking a ride.
- In BookMyShow, user may not see `pay` before selecting seats.

But some systems cannot rely on UI:

- ATM buttons can be pressed in many orders.
- Vending machine buttons can be pressed in invalid order.
- APIs can be called directly by malicious clients.

Interview clarification:

> Can I assume the UI hides invalid actions, or should the backend explicitly validate all invalid method orders?

Safe answer:

> Even if UI hides invalid actions, backend/service should still validate important state transitions for correctness.

---

# 11. Exception Handling in Detail

---

## 11.1 IllegalStateException

Use when the object exists, the input may be valid, but the current state does not allow the operation.

Examples:

```java
class Booking {
    public void confirm() {
        if (status != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending booking can be confirmed");
        }
        status = BookingStatus.CONFIRMED;
    }
}
```

State-based exceptions should be thrown where the state lives.

Example:

- If booking status is inside `Booking`, then `Booking.confirm()` should validate.
- Do not expose status only so that service can validate everything externally.

Good design:

```java
booking.confirm();
```

Less ideal:

```java
if (booking.getStatus() == PENDING) {
    booking.setStatus(CONFIRMED);
}
```

---

## 11.2 IllegalArgumentException

Use for invalid method parameters.

Examples:

```java
public Board(int size) {
    if (size <= 0) {
        throw new IllegalArgumentException("Board size must be positive");
    }
    this.size = size;
}
```

Other examples:

- Invalid row/column.
- Negative amount.
- Null required field.
- Invalid enum value from request.

---

## 11.3 Not Found Exceptions

Use when an entity is not present in datastore.

Example:

```java
Ticket ticket = dataStore.getTicket(ticketId)
    .orElseThrow(() -> new NotFoundException("Ticket not found"));
```

Prefer fetching all required entities at the beginning of the service method. This reduces partial updates.

---

## 11.4 Custom Exceptions

Use custom exceptions for domain errors that the caller may handle differently.

Examples:

```java
class ParkingFullException extends RuntimeException { ... }
class SeatAlreadyLockedException extends RuntimeException { ... }
class InvalidMoveException extends RuntimeException { ... }
class InsufficientInventoryException extends RuntimeException { ... }
```

Good interview line:

> I will use custom exceptions for business errors that are meaningful to the caller and generic exceptions for basic validation issues.

---

## 11.5 Avoiding Inconsistent State

A common mistake is updating one entity and then throwing an exception before updating the rest.

Bad flow:

```text
1. Mark spot occupied.
2. Try to create ticket.
3. Ticket creation fails.
4. Spot remains occupied without ticket.
```

Better flow:

```text
1. Fetch all required entities.
2. Validate all preconditions.
3. Perform updates together.
4. Persist changes together.
```

For in-memory code, be careful with operation order. For production, use database transactions.

Good interview line:

> In production, I would wrap these updates in a DB transaction. In this in-memory design, I will validate first and keep the update section small to avoid partial state changes.

---

# 12. Concurrency Checks

Concurrency is one of the strongest ways to show senior-level thinking in LLD.

---

## 12.1 When Race Conditions Happen

Race conditions usually happen in check-and-update operations.

Pattern:

```text
1. Check current state.
2. Based on that state, update it.
```

Example:

```java
if (seat.isAvailable()) {
    seat.book(userId);
}
```

Two threads can both see the seat as available and both book it.

---

## 12.2 Common Race Condition Examples

### BookMyShow

Two users book the same seat at the same time.

### Uber

Two drivers accept the same ride request.

### Parking Lot

Two vehicles get assigned the same parking spot.

### Splitwise

Two transactions update the same balance concurrently.

### Vending Machine

Two users try to buy the last unit of an item.

---

## 12.3 How to Identify Concurrency Risk

For each write API:

1. List all entities modified by this API.
2. For each entity, ask whether another API also modifies it.
3. Check whether the operation has check-then-update logic.
4. If yes, protect the critical section.

Template:

```text
API: acceptRide(driverId, rideId)
Modified entities:
- RideRequest: status changes from REQUESTED to ACCEPTED
- Driver: status changes from AVAILABLE to BUSY

Race risk:
- Two drivers may accept same ride.
- Same driver may accept two rides.

Protection:
- Lock ride request and/or driver.
- Re-check status inside lock.
```

---

## 12.4 Concurrent Data Structures

Concurrent data structures make individual operations thread-safe.

Example:

```java
ConcurrentHashMap<String, Ticket> tickets = new ConcurrentHashMap<>();
```

Advantages:

- Safe concurrent `get`, `put`, `remove` operations.
- Better performance than synchronizing the whole map because it uses finer-grained locking internally.

Limitations:

- Does not automatically make multi-step business logic safe.

This is still unsafe:

```java
if (!tickets.containsKey(ticketId)) {
    tickets.put(ticketId, ticket);
}
```

Better:

```java
tickets.putIfAbsent(ticketId, ticket);
```

Or synchronize the full business operation if multiple entities are involved.

---

## 12.5 Map.get() From Multiple Threads

Calling `get()` from multiple threads on a normal `HashMap` while no thread is modifying it is generally fine in practice, but not a good general guarantee for mutable shared state.

Unsafe cases:

- One thread reads while another thread modifies the map.
- Multiple threads modify the map.
- The map is not safely published to other threads.

Safe options:

- Use immutable map for read-only shared data.
- Use `ConcurrentHashMap` for concurrent reads/writes.
- Use external synchronization.

Interview line:

> If the map is immutable after construction, concurrent reads are fine. If reads and writes can happen together, I will use ConcurrentHashMap or synchronization.

---

## 12.6 Manual Locking vs Concurrent Collections

### ConcurrentHashMap

Good for:

- Many independent key-based operations.
- High read/write concurrency.
- Atomic map operations like `putIfAbsent`, `compute`, `remove(key, value)`.

### Manual Locking

Good for:

- Multi-step operations.
- Updating multiple objects together.
- Business invariants across entities.

Example:

```java
synchronized (rideRequest) {
    if (rideRequest.getStatus() != REQUESTED) {
        throw new IllegalStateException("Ride already accepted");
    }
    rideRequest.accept(driverId);
}
```

For multiple locks, always acquire locks in a consistent order to avoid deadlocks.

---

## 12.7 Locking the Facade Method

Simplest option:

```java
public synchronized Ticket parkVehicle(Vehicle vehicle) { ... }
```

Advantages:

- Very simple.
- Good for interviews if concurrency is not the main focus.
- Prevents many race conditions.

Disadvantages:

- Low throughput.
- Blocks unrelated operations.
- Not production-grade for high-traffic systems.

Good interview line:

> For simplicity, I can synchronize the write methods at the service level. For better scalability, I would lock only the affected entity or use atomic datastore operations.

---

## 12.8 Only Write APIs Need Locks?

Usually, write APIs need locks because they modify state. But read APIs may also need protection if:

- They read data while writes are happening.
- They need a consistent snapshot across multiple entities.

Examples:

- Reading booking summary while payment update is happening.
- Reading all available seats while seats are being locked.

Options:

- Accept eventual consistency for simple reads.
- Use read-write lock.
- Use immutable snapshots.
- Use database isolation in production.

---

## 12.9 Double-Checked Locking in Business Logic

If you check before acquiring lock, re-check after acquiring lock.

Unsafe:

```java
if (seat.isAvailable()) {
    synchronized (seat) {
        seat.book(userId);
    }
}
```

Safe:

```java
if (seat.isAvailable()) {
    synchronized (seat) {
        if (!seat.isAvailable()) {
            throw new SeatAlreadyBookedException();
        }
        seat.book(userId);
    }
}
```

Better: only check inside lock unless there is a performance reason.

---

## 12.10 Volatile Variables

`volatile` ensures visibility of the latest value across threads. It does not make compound operations atomic.

Good for:

- Flags.
- Stop signals.
- Simple state visibility.

Not enough for:

```java
count++
```

because increment is read-modify-write.

For counters, use:

- `AtomicInteger`
- synchronization
- locks

In LLD interviews, do not introduce `volatile` unless the use case is specifically about visibility or flags.

---

## 12.11 Overusing Concurrent Data Structures

Concurrent collections have costs:

- More overhead than normal collections.
- More complex reasoning.
- Can hide bigger consistency issues.
- Not needed in single-threaded/offline systems.

Good interview line:

> I will not use concurrent collections everywhere. I will use normal collections for single-threaded/offline design and introduce concurrency controls only around shared mutable state accessed by multiple threads.

---

# 13. Mistakes to Avoid

---

## 13.1 Forgetting to Update Related Entities

For every write API, mentally loop through all core entities and ask whether they are affected.

Example: Parking vehicle.

Affected entities:

- Vehicle: may need to be registered/stored.
- ParkingSpot: status changes to occupied.
- Ticket: new ticket created.
- ParkingLot/Floor: available count may change.
- History/log: transaction may be recorded.

If you update ticket but forget spot status, the system becomes inconsistent.

---

## 13.2 Exposing Too Many Setters

Bad:

```java
booking.setStatus(CONFIRMED);
spot.setAvailable(false);
```

Better:

```java
booking.confirm();
spot.occupy(vehicleId);
```

Reason:

- State transition validation stays inside the entity.
- Invariants are protected.
- Service code becomes more readable.

---

## 13.3 Putting All Logic in Service

Services should orchestrate, but entities should still protect their own state.

Bad service:

```java
if (spot.getStatus() == AVAILABLE) {
    spot.setStatus(OCCUPIED);
    spot.setVehicleId(vehicleId);
}
```

Better:

```java
spot.occupy(vehicleId);
```

---

## 13.4 Putting Business Logic in Controller

Bad:

```java
@PostMapping("/book")
public BookingResponse book(...) {
    // seat lock logic
    // price calculation
    // payment handling
    // booking creation
}
```

Better:

```java
@PostMapping("/book")
public BookingResponse book(...) {
    return bookingService.bookSeats(request);
}
```

---

## 13.5 Overusing Design Patterns

Bad signs:

- Factory for every class.
- Strategy for behavior that will never vary.
- Singleton for every service.
- Observer for simple direct responses.
- State pattern for two states with simple checks.

Good line:

> I will keep the initial design simple and introduce patterns only where they solve a clear extensibility or maintainability problem.

---

## 13.6 Ignoring Transactions / Rollback

If one operation updates multiple entities, think about partial failure.

In production:

- Use DB transactions.
- Use optimistic/pessimistic locking where needed.

In in-memory interview design:

- Validate first.
- Update in a small critical section.
- Avoid throwing after partial updates.
- If necessary, manually rollback.

---

# 14. Problem-Specific Modeling Notes

---

## 14.1 Parking Lot

### Important Entities

- ParkingLot
- ParkingFloor
- ParkingSpot
- Vehicle
- Ticket
- Payment
- Receipt
- Gate
- User/Admin, if needed

### Important Strategies

- SpotAssignmentStrategy
- FeeCalculationStrategy
- PaymentStrategy, if payment modes vary

### Spot ID Question

Should spots have IDs?

Usually yes.

Reason:

- One lot has many spots.
- A spot is assigned to a ticket.
- A spot can be queried independently.
- In SQL design, spots would be stored as separate rows.
- Lot/floor can store spot IDs or spot references depending on persistence needs.

### Class Relationship

```text
ParkingLot 1 → many ParkingFloor
ParkingFloor 1 → many ParkingSpot
Ticket many → 1 Vehicle
Ticket many → 1 ParkingSpot
```

### Important APIs

```java
Ticket enterParkingLot(String gateId, Vehicle vehicle);
Receipt exitParkingLot(String ticketId, PaymentMode paymentMode);
void addFloor(String lotId, ParkingFloor floor);
void addSpot(String floorId, ParkingSpot spot);
```

### Concurrency Risk

- Two vehicles may be assigned the same spot.
- Protect spot assignment + spot occupation together.

---

## 14.2 Chess

### Important Entities

- Game
- Board
- Cell
- Position
- Piece
- Player
- Move

### Entity Relationship

```text
Game 1 → 1 Board
Board 1 → many Cells
Cell 0/1 → 1 Piece
Game 1 → many Moves
```

### Board ID Question

Usually board does not need an ID.

Reason:

- A game has exactly one board.
- Board does not exist independently of the game.
- Board is not queried independently.
- It can be embedded inside `Game`.

### AI as Player or Game Type?

Two options:

#### Option 1: AI as Player

```java
abstract class Player { ... }
class HumanPlayer extends Player { ... }
class AIPlayer extends Player { ... }
```

Good if:

- AI participates just like a player.
- Game rules are the same.

#### Option 2: AI Game Type

```java
abstract class Game { ... }
class HumanVsHumanGame extends Game { ... }
class HumanVsAIGame extends Game { ... }
```

Good if:

- Game flow differs significantly.
- AI difficulty/configuration belongs to the game session.

For interviews, AI as a player is often cleaner unless the interviewer specifically wants different game modes.

### Piece Design

Use abstract class for `Piece` because pieces share state like color and maybe move count.

```java
abstract class Piece {
    protected Color color;
    public abstract boolean canMove(Board board, Position from, Position to);
}
```

### Why No Factory for Board?

A board is usually created as part of game creation and does not exist independently. If there is only one standard board creation flow, a factory is unnecessary.

Use factory only if:

- Board setup varies by game type.
- There are multiple variants.
- Creation is complex.

---

## 14.3 TicTacToe

### Important Entities

- Game
- Board
- Cell
- Player
- Move
- Symbol

### Important Strategies

- WinningStrategy
- PlayerSelectionStrategy, if needed

### Should Board Contain Winning Strategy?

Usually no.

Reason:

- Board should represent cells and provide board operations.
- Winning is a game rule, not a board responsibility.

Better locations:

- `Game` if game owns the full move flow.
- `GameService` if service orchestrates game play.

Good answer:

> I would not keep the winning strategy inside Board. Board should only manage cells. Winning logic belongs to Game or GameService because it is part of game rules.

---

## 14.4 BookMyShow

### Important Entities

- Movie
- Theatre
- Screen
- Seat
- Show
- ShowSeat
- Booking
- Payment
- User

### Important Modeling Point

Do not store booking status directly on physical `Seat` because the same physical seat exists across many shows.

Use `ShowSeat`:

```text
Seat = physical seat in a screen
ShowSeat = seat availability for a specific show
```

### Concurrency Risk

- Two users booking the same `ShowSeat`.
- Use locks or atomic seat status transition.

---

## 14.5 Uber / Ride Booking

### Important Entities

- Rider
- Driver
- Vehicle
- Location
- RideRequest
- Ride
- Payment

### Important Strategies

- DriverMatchingStrategy
- FareCalculationStrategy

### Concurrency Risk

- Two drivers accept the same ride.
- One driver accepts two rides.
- Rider cancels while driver accepts.

Protect ride request status transitions.

---

# 15. Interview Communication Templates

---

## 15.1 Starting the Design

Use this when the problem is given:

> I will start by clarifying the requirements. Then I will identify actors and use cases. After that I will design the core entities and expose operations through a service/facade layer. Finally I will discuss extensibility, edge cases, and concurrency.

---

## 15.2 Explaining In-Memory Design

> I will use an in-memory datastore for simplicity, but I will keep it behind an interface so that we can replace it with SQL/NoSQL storage later without changing business logic.

---

## 15.3 Avoiding Overengineering

> We can introduce a factory here, but since this object has no subtypes and construction is simple, direct construction is cleaner and follows KISS.

---

## 15.4 Introducing Strategy

> This logic is likely to vary independently of the entity, so I will extract it as a strategy. That allows us to add a new algorithm without modifying the service.

---

## 15.5 Introducing State Pattern

> Right now simple state checks are enough. If the number of states and transitions grows, I would refactor this into the State Pattern to avoid large conditionals.

---

## 15.6 Discussing Concurrency

> The risky part is the check-and-update section. Two requests may pass the check using stale state. I will protect this critical section by locking the affected entity or using an atomic update.

---

# 16. Final LLD Checklist

Before ending the design, verify these points:

## Requirements

- Did I clarify offline vs online?
- Did I identify actors?
- Did I list core use cases?
- Did I ask about concurrency?
- Did I ask about history/undo?
- Did I ask about notifications?

## Entities

- Did I identify infrastructure entities?
- Did I identify user entities?
- Did I identify transaction entities?
- Did I define fields and relationships?
- Did I decide object reference vs ID reference?
- Did I avoid unnecessary getters/setters?

## Services

- Did I expose use-case-level methods?
- Did I keep controller/main thin?
- Did I avoid putting too much business logic in entities?
- Did I avoid anemic entities with only setters?

## Extensibility

- Did I use abstract class for core entities with shared state?
- Did I use interface for strategies?
- Did I use enum for fixed simple types?
- Did I avoid unnecessary patterns?

## Exceptions

- Did I validate inputs?
- Did I validate state transitions?
- Did I handle not-found cases?
- Did I avoid partial updates?

## Concurrency

- Did I identify check-and-update operations?
- Did I protect shared mutable state?
- Did I avoid assuming ConcurrentHashMap solves all business races?
- Did I use simple synchronization if enough for interview scope?

## Code Quality

- Are classes cohesive?
- Are methods small and meaningful?
- Are names clear?
- Is the design easy to explain?
- Can the design handle one or two new requirements without major changes?

---

# 17. Quick Mental Model

Use this simplified mental model during interviews:

```text
1. What exists?                    → Entities
2. Who uses it?                    → Actors
3. What can they do?               → Use cases / APIs
4. What changes together?          → Service transactions
5. What varies?                    → Strategy / Factory / Abstract class
6. What can go wrong?              → Exceptions / edge cases
7. What happens concurrently?      → Locks / atomic operations
8. What should be remembered?      → History / audit / undo
```

This keeps the design structured and prevents jumping randomly between classes, patterns, and edge cases.

