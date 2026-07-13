# A General Framework for Solving Low-Level Design Interviews

`TODO` - https://www.hellointerview.com/learn/low-level-design/in-a-hurry/introduction this kind of section. Telling various variations/expectations from diff interviewers & the time split for each section for each variation. "Its good to check with the interviewer at the beginning itself what their expectation is in terms of writing code/psuedo-code or just class design"

`TODO` - Title for this section

Low-Level Design (LLD) interviews test whether you can convert a vague problem statement into a clean, extensible, and correct object-oriented design.

The interviewer is usually not looking for the largest possible class diagram or the maximum number of design patterns. They want to see whether you can:

- understand the problem before writing code;
- identify the important objects and their relationships;
- place responsibilities in the correct classes;
- keep the design extensible without overengineering it;
- handle invalid operations, partial updates, and concurrency;
- explain the trade-offs behind your decisions.

This chapter presents a reusable framework that can be applied to solve most of the LLD problems.

The exact classes will differ from problem to problem, but the thinking process remains largely the same.

`TODO` - why this framework special? becoz its like just dry running
---

## 1. The Complete Interview Flow

Use the following sequence during an interview:

1. **Requirements Gathering**
   - Functional Requirements
     - Structural Requirements
       - Problem specific structural requirements 
       - Offline or Online system clarification
     - Behavioral Requirements
       - Problem specific behavioral requirements
       - History & Undo
       - Notifications support
     - Out of Scope
   - Non-Functional Requirements (below are the common NFRs for all problems)
     - Extensibility
     - Exception Handling
     - Edge case handling
     - Concurrency handling
2. **Use Case Diagram**
3. **Class Design**
4. **Implementation (If Prompted)**


Do not treat these as completely isolated phases. LLD is iterative. While writing a use case, you may discover a new entity. While placing a method, you may discover that an entity needs a new field. Moving backward and refining the design is normal.

---

# Requirements gathering



Do not start by naming classes. First understand what the system represents and what it must do.

A useful way to gather requirements is to divide them into three groups:

1. **Structural requirements** — what the system contains;
2. **Behavioral requirements** — what users, administrators, and the system can do;
3. **Scope decisions** — what is included, simplified, or excluded.

---

## 2.1 Structural Requirements

Structural requirements describe the physical or logical composition of the system.

Ask questions such as:

- What objects exist in the real-world system?
- How are they arranged?
- Can one object contain several other objects?
- Are there different types of the same object?
- Which limits or dimensions are fixed?

### Example: Tic-Tac-Toe

- The game is played on a `3 × 3` board.
- The board contains nine cells.
- Two players use different symbols, normally `X` and `O`.

### Example: Chess

- The game is played on an `8 × 8` board.
- The board contains alternating light and dark squares.
- Two players control separate sets of pieces.
- Each player begins with sixteen pieces:
  - one king;
  - one queen;
  - two rooks;
  - two bishops;
  - two knights;
  - eight pawns.

### Example: BookMyShow

- The system supports multiple cities.
- A city contains multiple theaters.
- A theater contains one or more screens.
- A screen has a fixed seat layout.
- Seats may have types such as `NORMAL`, `PREMIUM`, and `RECLINER`.
- The system supports multiple movies.
- A movie can have multiple shows across theaters and screens.

### Example: Vending Machine

- A vending machine contains multiple racks or slots.
- Each rack stores one product type.
- A rack has a maximum capacity and a current product count.
- The machine accepts one or more supported payment methods.

### Example: Elevator System

- A building contains multiple floors.
- A building contains one or more elevators.
- Each elevator serves a configured set of floors.
- Floors and elevator cabins may contain displays and control buttons.

Structural requirements are the main source of your initial domain entities and their relationships.

---

## 2.2 Behavioral Requirements

Behavioral requirements describe the actions performed by different actors.

Typical actors are:

- **User** — the person using the system;
- **Administrator** — the person configuring or maintaining it;
- **System** — automated behavior performed after an external action;
- **External system** — payment gateway, notification service, hardware controller, and so on.

Write requirements in action-oriented language.

### Example: Tic-Tac-Toe

#### Player actions

- Players should take turns placing their symbols on empty cells.

#### System actions

- The system should reject moves outside the board.
- The system should reject moves on occupied cells.
- The system should enforce player turns.
- The system should detect a win or a draw.
- The system should announce the final result.

### Example: Chess

#### Player actions

- Players should take turns moving their pieces.

#### System actions

- The system should validate whether a piece can make the requested move.
- The system should reject moves through blocked paths where applicable.
- The system should prevent illegal moves.
- The system should detect check, checkmate, and stalemate when those rules are in scope.

### Example: BookMyShow

#### Administrator actions

- Add, update, or remove movies.
- Add, update, or remove theaters and screens.
- Configure the seat layout of a screen.
- Create, update, or cancel shows.
- Configure show or seat pricing.

#### User actions

- Search for shows for a movie in a city.
- View the seat availability for a show.
- Select one or more seats.
- Temporarily hold selected seats.
- Pay within the hold period.
- Confirm the booking after successful payment.

### Example: Vending Machine

#### Administrator actions

- Add, remove, or update racks.
- Refill products.
- Update product prices.
- Refill supported coin denominations.

#### User actions

- View available products.
- Select a product using a rack code.
- Insert money or choose a payment method.
- Cancel before the transaction is completed.
- Receive the product after successful payment.
- Receive change when excess cash is inserted.

### Example: Elevator System

#### User actions

- Request an elevator from a floor.
- Select a destination after entering the elevator.

#### Administrator actions

- Add, update, disable, or remove an elevator.
- Start or stop an elevator for maintenance.

#### System actions

- Choose an elevator for a request.
- Add stops to the selected elevator.
- Move the elevator between floors.
- Open and close doors safely.
- Update floor and cabin displays.

---

## 2.3 Scope and Out-of-Scope Requirements

LLD problems can grow indefinitely. Explicitly control the scope.

For every optional feature, ask the interviewer whether it should be:

- implemented fully;
- represented only as an extension point;
- mentioned but kept out of scope.

### Examples

#### Chess

The phrase “standard chess rules” can include:

- check and king safety;
- checkmate;
- stalemate;
- castling;
- en passant;
- pawn promotion;
- draw by repetition;
- fifty-move rule;
- timers.

You should not silently assume that every rule must be implemented. Confirm the expected scope.

#### Parking Lot

Possible out-of-scope features include:

- advance reservations;
- valet parking;
- dynamic pricing;
- electric-vehicle charging;
- monthly subscriptions.

#### BookMyShow

Possible out-of-scope features include:

- recommendations;
- coupons;
- refunds;
- seat rescheduling;
- theater onboarding workflows.

A clear scope protects the interview from becoming an unbounded implementation exercise.

---

## 3. Ask the Common Design Questions

After gathering problem-specific requirements, ask a small set of questions that influence almost every LLD design.

---

## 3.1 Is the System Offline or Online?

This decision affects the entry points, storage, concurrency, and communication model.

### Offline application

Examples include a console Tic-Tac-Toe game or a single physical vending machine simulation.

A simple offline design may use:

- a `main` method as the client;
- direct method calls instead of HTTP APIs;
- an in-memory object graph;
- a loop to accept user input.

Do not assume that “offline” automatically means “single-threaded.” Hardware events or multiple players may still arrive concurrently. However, when the interviewer explicitly permits a single-threaded simulation, you can avoid unnecessary synchronization.

### Online application

Examples include BookMyShow, online chess, or a building-management service.

An online design normally has:

- controllers or API handlers;
- application services;
- repositories or datastores;
- multiple concurrent requests;
- external integrations;
- push mechanisms such as WebSockets where required.

Even when coding an offline version, you can keep the service APIs clean so that an online controller can be added later.

---

## 3.2 What Must Be Extensible?

Do not say only, “the design should be extensible.” Identify exactly what may change.

Extensibility normally appears in three forms.

### A. Extensible entity types

Examples:

- different game variants;
- different seat types;
- different payment methods;
- different vehicle types;
- different notification channels.

### B. Extensible behavior or algorithms

Examples:

- Tic-Tac-Toe win detection;
- elevator assignment;
- elevator movement scheduling;
- vending-machine change calculation;
- ticket pricing;
- parking-fee calculation.

This is usually a good place for the **Strategy pattern**, often combined with a factory for runtime selection.

### C. Extensible validation rules or features

Examples:

- chess move rules;
- fraud checks;
- booking eligibility checks;
- coupon validation;
- king-safety validation.

When several independent rules are executed in sequence, the **Chain of Responsibility** pattern may help.

### Example extension inventory

| Problem | Entity extensions | Behavioral extensions | Feature extensions |
|---|---|---|---|
| Tic-Tac-Toe | Board type, game type | Win strategy | Timed mode, AI player |
| Chess | Piece or game variant | Move validation | King safety, castling, en passant |
| BookMyShow | Seat type, payment type | Pricing strategy | Coupons, cancellation rules |
| Vending Machine | Payment type, denomination | Change strategy | Refund policy |
| Elevator | Elevator configuration | Assignment and movement strategy | Priority or emergency mode |

For at least one extensible behavior, ask how the concrete algorithm should work. For example, an elevator system cannot be implemented meaningfully until the interviewer tells you whether the nearest elevator, minimum waiting time, direction-aware scheduling, or another rule should be used.

---

## 3.3 Is History or Undo Required?

History and undo are different requirements.

- **History** means previous actions must be retained for viewing, auditing, or replay.
- **Undo** means the system must reverse a previous action.

Useful patterns include:

### Command

Represent an action as an object. A command can store enough information to execute and potentially undo the action.

Good for:

- board-game moves;
- editor operations;
- remote-control actions;
- transaction histories.

### Memento

Capture a snapshot of an object’s state without exposing all of its internal details.

Good for:

- restoring a board to a previous state;
- save points;
- editor snapshots.

For a board game, storing compact move commands is usually cheaper than storing the complete board after every move. Full snapshots may still be useful when restoring arbitrary historical states quickly.

---

## 3.4 Does the System Need Event Broadcasting?

Use the **Observer pattern** when one event must be pushed to multiple interested consumers.

Examples:

- a game move is sent to the opponent, spectators, and an audit service;
- an elevator’s current floor is sent to multiple displays;
- a booking event is sent to email, SMS, and analytics consumers.

Do not use Observer merely because one method returns a response to its caller. A normal request-response flow is sufficient for one-to-one communication.

Ask:

- Is the communication one-to-one or one-to-many?
- Must the server push updates without a new client request?
- Are subscribers dynamic?
- Is delivery synchronous or asynchronous?

---

## 3.5 What Invalid Operations Must Be Rejected?

Identify invalid inputs and invalid workflows before choosing exception types.

Examples include:

- selecting a nonexistent rack;
- choosing an occupied board cell;
- moving after a game has ended;
- paying for an expired ticket;
- booking a seat that is already held;
- requesting a floor not served by an elevator;
- cancelling a completed transaction.

This discussion later determines:

- validation placement;
- custom exceptions;
- state transitions;
- whether the State pattern is useful.

---

## 3.6 Which Operations Must Be Atomic?

An operation is atomic when it either completes fully or leaves the system unchanged.

Look for methods that update multiple objects.

Examples:

- seat selection creates a ticket and holds several seats;
- payment confirms a ticket and books all selected seats;
- vending-machine purchase decrements inventory, records payment, dispenses a product, and returns change;
- a game move updates the board, move history, current player, and game status.

These operations can leave inconsistent state when an exception occurs halfway through. Plan to use:

- validate-all-then-mutate;
- safe ordering of mutations;
- rollback or compensating actions;
- a database transaction in a persistent implementation.

---

## 3.7 Which Operations Can Run Concurrently?

Identify shared mutable state.

Typical high-risk examples are:

- two users attempting to reserve the same seat;
- two drivers accepting the same ride;
- two players submitting moves simultaneously;
- multiple requests modifying an elevator’s stop queue;
- a user cancelling while another thread confirms the same booking.

Do not add locks everywhere. First identify the invariant that concurrent execution could break.

---

# Part II — Convert Requirements into Use Cases

## 4. Build a Use-Case View

A use-case view connects requirements to the methods your design must support.

For each use case, write:

1. the initiating actor;
2. the public action;
3. the important internal steps;
4. the objects that are read or modified;
5. the possible result or failure.

You do not need a formal UML diagram immediately. A text flow is often faster and clearer during an interview.

### Avoid CRUD-only use cases

A use-case diagram should emphasize business behavior, not every getter, setter, or repository operation.

Weak use cases:

- `getGame()`
- `saveTicket()`
- `updateSeatStatus()`

Stronger use cases:

- `makeMove()`
- `selectSeats()`
- `confirmBooking()`
- `purchaseProduct()`
- `requestElevator()`

CRUD operations may still exist, particularly for administrators, but they should not hide the main workflows.

---

## 4.1 Example Use Cases

### Chess

```text
startGame(player1, player2)
  → initializeBoard()
  → setCurrentPlayer()
  → changeGameStatus(IN_PROGRESS)

makeMove(playerId, from, to)
  → verifyTurn()
  → validateSourcePiece()
  → validatePieceMovement()
  → validatePathIsClear()
  → validateKingSafety()        // when in scope
  → applyMove()
  → recordMove()
  → determineGameResult()
  → switchTurn()
  → publishGameUpdate()
```

### BookMyShow

```text
searchShows(cityId, movieId, date)
  → findMatchingShows()
  → returnShowSummaries()

getSeats(showId)
  → releaseExpiredHolds()
  → loadShowSeats()
  → calculateDisplayPrices()
  → returnSeatAvailability()

selectSeats(userId, showId, seatIds)
  → validateSeatsExist()
  → validateSeatsAreAvailable()
  → holdSeats()
  → calculateTicketPrice()
  → createPendingTicket()

pay(ticketId, paymentRequest)
  → validateTicketIsActive()
  → processPayment()
  → bookHeldSeats()
  → confirmTicket()
  → publishBookingConfirmation()
```

### Vending Machine

```text
selectProduct(rackCode)
  → validateRack()
  → validateStock()
  → storeCurrentSelection()

makePayment(paymentInput)
  → validateCurrentState()
  → processPayment()
  → validateSufficientAmount()
  → calculateChange()
  → dispenseProduct()
  → dispenseChange()
  → resetTransaction()

cancel()
  → validateCancellationAllowed()
  → refundInsertedAmount()
  → resetTransaction()
```

### Elevator System

```text
requestElevator(sourceFloor, direction)
  → validateFloor()
  → selectElevator()
  → addPickupStop()
  → beginOrContinueMovement()

selectDestination(elevatorId, destinationFloor)
  → validateDestination()
  → addDestinationStop()
  → updateMovementPlan()
```

These flows become the source of your public service methods, domain methods, validations, events, and concurrency checks.

---

# Part III — Choose the Code Structure

## 5. Use a Simple Layered Structure

A reusable interview-friendly structure is:

```text
Client / Main / Controller
          ↓
Application Service or Façade
          ↓
Domain Entities + Domain Services + Strategies
          ↓
Repository / Datastore
          ↓
In-Memory Maps or Persistent Database
```

External services such as a payment gateway or notification provider are usually accessed through interfaces from the service layer.

---

## 5.1 Responsibilities of Each Layer

### Client, `main`, or controller

Responsible for:

- accepting input;
- converting input into request objects;
- calling application services;
- catching errors at the outer boundary;
- rendering or returning the result.

It should not contain core business rules.

### Application service or façade

Responsible for:

- exposing complete use cases;
- loading required entities;
- coordinating several objects;
- calling strategies and external gateways;
- controlling transaction or lock boundaries;
- persisting final changes;
- publishing events.

### Domain entities

Responsible for:

- holding domain state;
- protecting their own invariants;
- performing state transitions that belong to the entity;
- exposing meaningful domain operations rather than raw field mutation.

### Domain services and strategies

Responsible for logic that:

- does not naturally belong to one entity;
- depends on several entities;
- varies by algorithm;
- requires external information.

### Repository or datastore

Responsible for:

- finding and storing domain objects;
- hiding whether storage is in-memory, SQL, NoSQL, or something else;
- providing atomic persistence primitives when available.

### Factories

Responsible for creating objects when creation varies by type or is complex.

---

## 5.2 Offline and Online Variants

### Offline variant

```text
Main loop → GameService → Game/Board/Player
```

The datastore may simply hold one active game object and a move history.

### Online variant

```text
REST/WebSocket Controller
          ↓
GameService
          ↓
GameRepository + EventPublisher
```

The domain model can remain similar. Only the outer delivery and persistence mechanisms change.

This separation is useful because the same library-like domain code can be used by a console client, web server, or tests.

---

# Part IV — Design the Domain Model

## 6. Identify the Core Entities

Start from nouns in the requirements, but do not convert every noun into a class.

Group candidate entities into four useful categories.

---

## 6.1 Infrastructure or Composition Entities

These represent the structure of the system.

Examples:

| Problem | Composition |
|---|---|
| Chess | `Game → Board → Cell/Piece` |
| BookMyShow | `City → Theater → Screen → Seat` |
| Vending Machine | `VendingMachine → Rack → Product` |
| Elevator | `Building → Elevator`, `Floor → Display/Button` |
| Parking Lot | `ParkingLot → Floor → ParkingSpot` |

---

## 6.2 Actor Entities

These represent people or participants when their identity or state matters.

Examples:

- `Player` in Chess;
- `User` in BookMyShow;
- `Driver` and `Rider` in ride booking;
- `Admin` only when administrators have domain-specific state or permissions.

Do not create an `Admin` class merely because an administrator calls CRUD APIs. A role enum or authorization layer may be enough.

---

## 6.3 Interaction or Transaction Entities

These connect an actor to the infrastructure and often capture a business workflow.

Examples:

- `Move` connects a player and a game board;
- `Ticket` or `Booking` connects a user and show seats;
- `Ride` connects a rider, driver, and route;
- `ParkingTicket` connects a vehicle and a parking spot;
- `Order` connects a customer and products.

These are often the most important entities because they contain statuses and lifecycle transitions.

---

## 6.4 Supporting Entities and Value Objects

Examples:

- `Money`;
- `Position`;
- `TimeRange`;
- `Payment`;
- `Coin`;
- `Address`;
- `Direction`;
- `Display`.

A value object normally has no independent identity. Two value objects with the same values can be treated as equal.

For example, a chess `Position(row, column)` is usually a value object, while a `Game` has a unique identity.

---

## 7. Model Relationships and Cardinality

For every pair of related entities, ask:

- Is it one-to-one?
- Is it one-to-many?
- Is it many-to-many?
- Which object owns the relationship?
- Does the relationship contain its own state?

### One-to-one

Example:

```text
Game → Board
```

The owner can usually store the object directly in an in-memory domain model.

### One-to-many

Example:

```text
Theater → Screens
```

Possible representations include:

```java
List<Screen> screens;
```

or:

```java
List<String> screenIds;
```

Choose based on aggregate boundaries and loading needs. Direct object references are simple for an offline object graph. IDs or repository lookups are common when objects have independent lifecycles or are persisted separately.

### Many-to-many

If the relationship contains meaningful fields, create a mapping entity.

#### Example: `ShowSeat`

A physical `Seat` belongs to a screen. Its availability and price are different for every `Show`.

Therefore, do not put `AVAILABLE` or `BOOKED` directly on the physical seat. Create:

```text
ShowSeat
- id
- showId
- seatId
- status
- price
- heldByTicketId
- holdExpiresAt
```

`ShowSeat` is not merely a technical join table. It is a domain entity because the relationship has its own state and behavior.

Other examples include:

- `MovieActor`;
- `CourseEnrollment`;
- `OrderItem`;
- `ParkingAssignment`.

---

## 7.1 Avoid Accidental Dual Writes

A relationship may be stored on both sides:

```text
Theater.screenIds
Screen.theaterId
```

This can improve navigation but creates a consistency responsibility. Whenever the relationship changes, both sides must remain synchronized.

A practical interview rule is:

> Begin with one authoritative direction for each relationship. Add a reverse link only when a required use case benefits from it, and explain how consistency will be maintained.

Do not treat “never use reverse links” as a universal rule. Bidirectional relationships can be valid, but they increase the chance of dual-write bugs.

Also distinguish the **domain model** from the **database schema**. A persisted SQL schema may use foreign keys and joins even when the in-memory domain object does not hold every reverse collection.

---

## 8. Add Fields, Enums, and Statuses

Once entities are identified, add only the fields required by the current use cases and invariants.

### Chess

```text
Game
- id
- board
- whitePlayer
- blackPlayer
- currentPlayerId
- status
- winnerId
- moveHistory

Board
- cells or Piece[8][8]

Piece
- id
- color
- type
- position
- captured

Move
- playerId
- from
- to
- movedPieceId
- capturedPieceId
- createdAt
```

### BookMyShow

```text
City
- id
- name

Theater
- id
- cityId
- name
- screenIds

Screen
- id
- theaterId
- name
- seatIds

Seat
- id
- screenId
- row
- number
- type

Movie
- id
- title
- duration

Show
- id
- movieId
- screenId
- startTime
- endTime

ShowSeat
- id
- showId
- seatId
- status
- price
- heldByTicketId
- holdExpiresAt

Ticket
- id
- userId
- showId
- showSeatIds
- totalPrice
- status
- createdAt
- expiresAt

Payment
- id
- ticketId
- amount
- type
- status
- providerReference
```

### Vending Machine

```text
VendingMachine
- id
- rackIds
- state
- selectedRackId
- insertedCash
- availableCoins

Rack
- id
- code
- productId
- quantity
- capacity

Product
- id
- name
- price

Transaction
- id
- selectedRackId
- amountPaid
- changeAmount
- status
```

### Elevator System

```text
Building
- id
- name
- floors
- elevatorIds

Elevator
- id
- capacity
- currentFloor
- direction
- state
- allowedFloors
- pendingStops

Display
- id
- elevatorId or floorId
- currentFloor
- direction
```

Statuses and enums make state explicit.

Examples:

```text
GameStatus      = NOT_STARTED, IN_PROGRESS, WON, DRAW, CANCELLED
TicketStatus    = PENDING, HELD, CONFIRMED, EXPIRED, CANCELLED
ShowSeatStatus  = AVAILABLE, HELD, BOOKED
ElevatorState   = IDLE, MOVING, DOOR_OPEN, OUT_OF_SERVICE
Direction       = UP, DOWN, NONE
```

Avoid replacing a real lifecycle with several unrelated booleans such as `isPaid`, `isCancelled`, `isExpired`, and `isConfirmed`. Those combinations can represent impossible states. A status enum normally makes the valid states clearer.

---

# Part V — Model Extensibility Correctly

## 9. Choose Between an Enum, Type Field, Interface, and Inheritance

Not every possible type requires a hierarchy.

Use the simplest representation that supports the required behavior.

---

## 9.1 Use an Enum When There Is Only a Finite Label

Example:

```java
enum SeatType {
    NORMAL,
    PREMIUM,
    RECLINER
}
```

This is appropriate when all seat types have the same fields and behavior, and the type is mainly used by external policies such as pricing.

Similarly:

```java
enum Coin {
    ONE(1),
    TWO(2),
    FIVE(5),
    TEN(10);
}
```

A separate `Coin` class is unnecessary unless each coin has additional identity, metadata, or behavior.

---

## 9.2 Use One Class with a Type Field When Data Is Mostly Shared

Example:

```text
Seat
- id
- row
- number
- SeatType type
```

This is often better than creating `NormalSeat`, `PremiumSeat`, and `ReclinerSeat` when those subclasses would contain no meaningful behavior or different fields.

Avoid empty subclasses created only to demonstrate inheritance.

---

## 9.3 Use an Interface for Replaceable Behavior

Example:

```java
interface ElevatorAssignmentStrategy {
    Elevator selectElevator(Request request, List<Elevator> elevators);
}
```

Possible implementations:

```text
NearestElevatorStrategy
DirectionAwareStrategy
MinimumEstimatedWaitStrategy
```

Interfaces are a natural fit when implementations represent algorithms and do not need common instance state.

Other examples:

- `WinStrategy`;
- `PricingStrategy`;
- `ChangeCalculationStrategy`;
- `FeeCalculationStrategy`;
- `NotificationSender`.

---

## 9.4 Use an Abstract Class for a True Family with Shared State

Example:

```java
abstract class Payment {
    protected final String id;
    protected final Money amount;
    protected PaymentStatus status;

    protected Payment(String id, Money amount) {
        this.id = id;
        this.amount = amount;
        this.status = PaymentStatus.CREATED;
    }

    public abstract PaymentResult authorize();
}
```

Use an abstract class only when:

- the child classes have a genuine **is-a** relationship;
- common fields or behavior belong in the parent;
- callers benefit from polymorphism.

Do not use inheritance merely because two classes contain an `id` field.

In many production payment systems, the domain `Payment` record is separated from the external payment-processing strategy. For example:

```text
Payment                // stores transaction state
PaymentProcessor       // behavior interface
CardPaymentProcessor
UpiPaymentProcessor
CashPaymentProcessor
```

This avoids placing external API calls or sensitive credentials directly inside the entity.

---

## 9.5 A Simple Decision Guide

Use this sequence:

1. **Does the variation have no behavior and only a finite category?**  
   Use an enum.

2. **Do all variants share the same fields and behavior?**  
   Use one class with a type field.

3. **Does only an algorithm vary?**  
   Use a strategy interface.

4. **Do variants have different state or genuinely different entity behavior?**  
   Consider an interface or abstract class.

5. **Would subclasses be empty and used only for naming?**  
   Do not create the hierarchy.

6. **Can composition solve the problem more cleanly?**  
   Prefer composition over inheritance.

---

# Part VI — Place Methods in the Correct Classes

## 10. Derive Methods from Use Cases

Return to every use-case flow and underline the verbs.

For example:

```text
selectSeats
validateSeats
holdSeats
calculatePrice
createTicket
processPayment
bookSeats
confirmTicket
```

These are candidate methods, but they should not all go into one god class.

For every method, ask:

1. Which object owns the state being changed?
2. Does the method operate only on that object’s state?
3. Does the rule protect an invariant of that object?
4. Does it coordinate several entities?
5. Does it call an external dependency?
6. Is the algorithm expected to vary?

---

## 10.1 Put State Transitions in the Entity That Owns the State

Examples:

```text
ShowSeat.hold(ticketId, expiresAt)
ShowSeat.book(ticketId)
ShowSeat.releaseHold()
Ticket.confirm()
Ticket.expire()
Game.switchTurn()
Elevator.addStop(floor)
Elevator.arriveAt(floor)
Rack.decrementStock()
```

The entity can protect its own invariant:

```java
public void hold(String ticketId, Instant expiresAt) {
    if (status != ShowSeatStatus.AVAILABLE) {
        throw new SeatUnavailableException(id);
    }

    this.status = ShowSeatStatus.HELD;
    this.heldByTicketId = ticketId;
    this.holdExpiresAt = expiresAt;
}
```

This is stronger than exposing setters such as `setStatus()` to every service.

---

## 10.2 Put Cross-Entity Orchestration in a Service

Examples:

- hold several `ShowSeat` objects and create a `Ticket`;
- accept payment, book seats, and confirm the ticket;
- validate a chess move and update the game, board, and history;
- choose an elevator and add a pickup request;
- dispense a product and change.

These operations belong in an application service or façade because no single entity owns the complete workflow.

---

## 10.3 Put Variable Business Policies in Strategies

Examples:

- price calculation;
- elevator assignment;
- win detection;
- change calculation;
- parking-fee calculation.

Do not put a dynamic price calculation directly inside `Ticket` when it depends on:

- seat type;
- show time;
- weekday;
- occupancy;
- promotions;
- user category.

Use a `PriceCalculator` or `PricingStrategy` instead.

---

## 10.4 Put External Interactions Behind Interfaces

Examples:

```text
PaymentGateway
NotificationService
ProductDispenser
CashDispenser
DoorController
Clock
IdGenerator
```

A `Payment` entity should not make an HTTP call to a payment provider. A `Rack` should not directly operate a physical dispensing motor. Keep the domain behavior separate from infrastructure.

---

## 10.5 Example Method Placement

### BookMyShow

| Operation | Recommended owner | Reason |
|---|---|---|
| `hold()` | `ShowSeat` | Changes and validates the seat’s own state |
| `confirm()` | `Ticket` | Changes and validates ticket state |
| `calculatePrice()` | `PricingStrategy` | Depends on several external factors and may vary |
| `selectSeats()` | `BookingService` | Coordinates many seats and creates a ticket |
| `processPayment()` | `PaymentProcessor` | Calls an external payment system |
| `pay()` | `BookingService` | Orchestrates payment, seats, and ticket |

### Vending Machine

| Operation | Recommended owner | Reason |
|---|---|---|
| `decrementStock()` | `Rack` | Protects rack quantity |
| `calculateChange()` | `ChangeCalculationStrategy` | Algorithm may vary |
| `dispenseProduct()` | `Dispenser` | Interacts with hardware |
| `purchase()` | `VendingMachineService` | Coordinates state, payment, stock, and hardware |

### Elevator System

| Operation | Recommended owner | Reason |
|---|---|---|
| `addStop()` | `Elevator` | Modifies the elevator’s schedule |
| `moveOneFloor()` | `Elevator` or movement controller | Changes elevator state; hardware integration may be separate |
| `selectElevator()` | `ElevatorAssignmentStrategy` | Selection algorithm varies |
| `requestElevator()` | `ElevatorService` | Coordinates request and selected elevator |

---

# Part VII — Design Services and the Façade

## 11. Use a Façade as the Use-Case Entry Point

A façade exposes a small set of complete business operations while hiding internal collaboration.

Example:

```java
class BookingService {
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final TicketRepository ticketRepository;
    private final PricingStrategy pricingStrategy;
    private final PaymentProcessor paymentProcessor;
    private final EventPublisher eventPublisher;

    Ticket selectSeats(String userId, String showId, List<String> seatIds) {
        // Complete use-case orchestration
    }

    Ticket pay(String ticketId, PaymentRequest request) {
        // Complete use-case orchestration
    }
}
```

The façade may depend on:

- repositories;
- smaller services;
- strategies;
- factories;
- external gateways;
- command handlers;
- event publishers.

---

## 11.1 One Large Façade or Multiple Services?

For a small interview problem, a single façade is acceptable if it remains readable.

For a production-like design, split responsibilities:

```text
CatalogService
ShowService
BookingService
PaymentService
AdminService
```

A useful interview statement is:

> For the current scope, I will keep the public workflows in one façade. In a production design, I would split it into smaller application services and keep the façade as a thin entry point.

When services are split, inject their dependencies directly. Do not pass the datastore through the façade on every call.

```java
BookingService bookingService = new BookingService(
    ticketRepository,
    showSeatRepository,
    pricingStrategy,
    paymentProcessor
);
```

---

## 11.2 Avoid the God Service

A service becomes a god class when it contains:

- every use case;
- every validation rule;
- every algorithm;
- object creation;
- persistence details;
- notification logic;
- hardware or network calls.

Move stable state transitions to entities, variable algorithms to strategies, object construction to factories when needed, and persistence to repositories.

---

# Part VIII — Datastore and Repository Design

## 12. Hide Storage Behind Interfaces

A minimal repository abstraction makes the design testable and allows storage to change.

```java
interface TicketRepository {
    Optional<Ticket> findById(String id);
    void save(Ticket ticket);
}
```

```java
class InMemoryTicketRepository implements TicketRepository {
    private final Map<String, Ticket> tickets = new ConcurrentHashMap<>();

    public Optional<Ticket> findById(String id) {
        return Optional.ofNullable(tickets.get(id));
    }

    public void save(Ticket ticket) {
        tickets.put(ticket.getId(), ticket);
    }
}
```

A persistent implementation can later use SQL, NoSQL, or another store.

Do not force inheritance merely to support different databases. An interface with separate implementations is usually enough:

```text
TicketRepository
├── InMemoryTicketRepository
└── SqlTicketRepository
```

---

## 12.1 Offline Storage

For a single active game, storing the object directly may be simpler than maintaining maps of IDs:

```text
GameStore
- activeGame
- moveHistory
```

When multiple games are supported, use a map:

```text
Map<GameId, Game>
```

Choose the smallest storage design that matches the requirements.

---

## 12.2 Domain Model Is Not the Database Schema

The class diagram describes behavior and ownership in code. The database schema describes persistence and query patterns.

They may differ.

For example:

- the domain `Game` may contain a `Board` object;
- the database may store games and moves in separate tables;
- a repository mapper may reconstruct the domain object;
- database-specific denormalization should not leak throughout the domain model.

Mention this distinction when an interviewer challenges a relationship based only on database query performance.

---

# Part IX — Create and Wire Objects

## 13. The Role of the Client or `main`

The client is responsible for composing the application and simulating user actions.

Typical startup flow:

```text
1. Create repositories.
2. Create external gateway implementations.
3. Create strategies.
4. Create services.
5. Create initial domain objects.
6. Register or save those objects.
7. Call public use cases.
```

Example:

```java
public static void main(String[] args) {
    TicketRepository ticketRepository = new InMemoryTicketRepository();
    ShowSeatRepository seatRepository = new InMemoryShowSeatRepository();

    PricingStrategy pricingStrategy = new DefaultPricingStrategy();
    PaymentProcessor paymentProcessor = new FakePaymentProcessor();

    BookingService bookingService = new BookingService(
        ticketRepository,
        seatRepository,
        pricingStrategy,
        paymentProcessor
    );

    Ticket ticket = bookingService.selectSeats(
        "user-1",
        "show-1",
        List.of("A1", "A2")
    );

    bookingService.pay(ticket.getId(), new PaymentRequest(...));
}
```

In a real web application, dependency injection and controllers would replace manual wiring.

Create simple objects directly. Do not use a factory for every constructor call.

```java
User user = new User("user-1", "Vishnu");
```

Use a factory only when creation is complex or must choose among polymorphic types.

---

# Part X — Apply Design Patterns Deliberately

## 14. Design Patterns Are Tools, Not Goals

The correct question is not:

> Which patterns can I add?

It is:

> Which part of the design is likely to vary, become complex, or violate a principle without a pattern?

A simple design with two well-justified patterns is better than a design containing ten unnecessary abstractions.

---

## 14.1 Strategy Pattern

Use Strategy when an algorithm can vary independently from the object using it.

Examples:

- win detection;
- elevator assignment;
- elevator scheduling;
- ticket pricing;
- change calculation;
- parking-fee calculation.

```java
interface ChangeCalculationStrategy {
    Map<Coin, Integer> calculate(int amount, Map<Coin, Integer> availableCoins);
}
```

The caller depends on the interface, not a specific algorithm.

---

## 14.2 Factory Pattern

Use a factory when:

- the concrete type is selected at runtime;
- creation logic is repeated;
- construction requires several steps;
- clients should not know concrete classes.

Example:

```java
class PaymentProcessorFactory {
    PaymentProcessor getProcessor(PaymentType type) {
        return switch (type) {
            case CARD -> new CardPaymentProcessor();
            case UPI -> new UpiPaymentProcessor();
            case CASH -> new CashPaymentProcessor();
        };
    }
}
```

A factory centralizes the selection. However, a switch inside one factory still needs modification when a new type is added. For stronger open-closed behavior, processors can be registered in a map:

```text
Map<PaymentType, PaymentProcessor>
```

Do not use a factory for a simple class with one obvious constructor.

---

## 14.3 Builder Pattern

Use Builder when an object has:

- many optional fields;
- readable named construction requirements;
- validation before creation;
- an immutable final representation.

Good candidates include:

- search requests;
- booking requests;
- notification requests;
- complex configuration objects.

It is not needed for every entity with three fields.

---

## 14.4 Singleton Pattern

Use Singleton sparingly for a genuinely process-wide shared component.

Examples may include:

- immutable application configuration;
- a registry;
- a process-wide logger abstraction.

In dependency-injection-based applications, the container often controls object lifetime, so manually implementing Singleton is unnecessary.

Do not use Singleton merely to provide global access to mutable state. It makes testing and concurrency harder.

---

## 14.5 Command Pattern

Use Command when actions must be represented as objects.

```text
MoveCommand
- playerId
- from
- to
- execute()
- undo()
```

Useful for:

- move history;
- undo and redo;
- queuing operations;
- auditing;
- replay.

For an online system, commands may be stored by the ID of the aggregate they affect, such as `gameId`.

---

## 14.6 Memento Pattern

Use Memento to capture and restore a snapshot.

```text
GameMemento
- boardSnapshot
- currentPlayerId
- gameStatus
- winnerId
```

Use it when restoring complete state is easier than applying inverse commands.

Trade-off:

- commands are usually compact but require correct undo logic;
- mementos are simple to restore but may consume more memory.

---

## 14.7 Observer Pattern

Use Observer for one-to-many event delivery.

```java
interface GameObserver {
    void onGameUpdated(GameEvent event);
}
```

Possible observers:

- `WebSocketGameObserver`;
- `PushNotificationObserver`;
- `AuditObserver`;
- `MetricsObserver`.

Observers may be attached at different levels:

- system-level events can be published by the façade;
- entity-specific hardware displays may observe an elevator controller.

In production, an event bus may replace direct in-process observer calls.

---

## 14.8 Chain of Responsibility

Use Chain of Responsibility when several validations or handlers should run independently in a sequence.

Chess move validation may contain:

```text
SourcePieceValidator
TurnValidator
PieceMovementValidator
PathClearValidator
DestinationValidator
KingSafetyValidator
```

Each rule either:

- passes control to the next rule; or
- stops the chain with an exception or failure result.

Use this when rules are independently extensible. For two simple checks, normal methods are clearer.

---

## 14.9 State Pattern

Use State when:

- valid actions depend heavily on current state;
- the same operation behaves differently in different states;
- a large number of `if (state == ...)` checks is growing;
- invalid action ordering must be handled explicitly.

A vending machine may have:

```text
IdleState
ProductSelectedState
PaymentPendingState
DispensingState
OutOfStockState
```

Calling `pay()` in `IdleState` can be rejected by that state object, while `cancel()` behaves differently after money has been inserted.

State is especially useful for machines such as:

- vending machine;
- ATM;
- traffic signal;
- order lifecycle;
- media player.

Do not automatically use State for Tic-Tac-Toe merely because the game has a status enum. A few clear checks may be simpler. Introduce State when behavior genuinely varies across states or invalid transition logic becomes difficult to manage.

---

## 14.10 Pattern Selection Summary

| Requirement | Candidate pattern |
|---|---|
| Interchangeable algorithm | Strategy |
| Runtime object selection | Factory |
| Complex optional construction | Builder |
| Represent action, queue, audit, undo | Command |
| Restore snapshot | Memento |
| One event, many subscribers | Observer |
| Ordered extensible rules | Chain of Responsibility |
| Behavior depends on current state | State |
| Simple entry point over several components | Façade |

---

# Part XI — Handle Errors and Invalid Operations

## 15. Design Exception Handling After the Happy Path

A productive interview sequence is:

1. complete the happy-path design;
2. identify invalid inputs;
3. identify missing data;
4. identify invalid object states;
5. identify business-rule failures;
6. add exceptions or result types.

Throw errors near the code that has enough information to identify the violation. Catch them at an application boundary such as the controller or `main`, unless a lower layer can recover meaningfully.

---

## 15.1 `IllegalArgumentException`

Use for invalid method arguments that violate basic input constraints.

Examples:

- negative price;
- invalid floor number;
- malformed rack code;
- empty seat list;
- board position outside valid bounds.

Input validation is often performed at the boundary using request validators. Entities should still protect invariants so that they cannot be created in an invalid state from another caller.

A reusable validator can prevent duplicated boundary checks:

```text
BookingRequestValidator
ElevatorRequestValidator
ProductValidator
```

---

## 15.2 `NoSuchElementException` or Not-Found Exception

Use when a requested entity does not exist.

Examples:

- show not found;
- ticket not found;
- elevator not found;
- rack not found.

A custom exception communicates intent better in larger designs:

```text
ShowNotFoundException
TicketNotFoundException
```

The repository returns `Optional`; the service converts absence into a domain-specific error.

---

## 15.3 `IllegalStateException`

Use when an operation is invalid because of the current state of the object.

Examples:

- making a move after the game is complete;
- confirming an expired ticket;
- dispensing before payment;
- opening elevator doors while moving.

Prefer throwing the exception inside the object that owns the state:

```java
class Ticket {
    void confirm() {
        if (status != TicketStatus.HELD) {
            throw new IllegalStateException("Only a held ticket can be confirmed");
        }
        status = TicketStatus.CONFIRMED;
    }
}
```

The service may also reject invalid workflow state when the rule spans several objects. Do not expose mutable fields merely so that the façade can reproduce every entity invariant.

---

## 15.4 Custom Business Exceptions

Use custom exceptions for domain failures that callers may handle differently.

Examples:

- `SeatUnavailableException`;
- `TicketExpiredException`;
- `InsufficientPaymentException`;
- `InsufficientChangeException`;
- `CapacityExceededException`;
- `IllegalMoveException`;
- `AlreadyExistsException`.

Custom exceptions make the service contract clearer than a generic `RuntimeException`.

---

## 15.5 A Practical Validation Order

Inside a service method, a readable order is:

1. validate basic input;
2. load required entities;
3. verify uniqueness or absence constraints;
4. verify current state and authorization;
5. verify business rules involving multiple objects;
6. mutate state;
7. persist changes;
8. publish events or return the result.

Example:

```text
selectSeats(userId, showId, seatIds)
1. Reject empty seatIds.
2. Load the show and requested seats.
3. Verify every seat belongs to the show.
4. Verify every seat is available.
5. Calculate the price.
6. Hold all seats and create the ticket.
7. Save the changes.
8. Return the ticket.
```

This order is not a rigid Java exception hierarchy. It is a workflow guideline that minimizes unnecessary work and partial updates.

---

# Part XII — Prevent Partial Updates

## 16. Understand Orchestration Atomicity

A service operation may update several entities. Even if every individual entity method is correct, the overall workflow may fail halfway through.

Consider:

```java
seat1.hold(ticketId);
seat2.hold(ticketId);   // throws
save(ticket);
```

After the exception, `seat1` remains held while `seat2` is not. The operation is not atomic.

There are two broad failure categories.

### Application or process failure

The application crashes, the machine stops, or the database connection fails.

Production solutions include:

- database transactions;
- durable workflows;
- transactional outbox;
- sagas or compensating actions.

### Expected validation failure

A method throws because the requested operation is invalid.

Interview-friendly solutions include:

- validate all objects before changing any;
- reorder operations;
- apply and roll back;
- lock the complete critical section.

---

## 16.1 Technique 1: Reorder Operations

Perform safe or reversible operations before risky irreversible operations.

Example:

- validate payment amount before dispensing a product;
- validate all seats before creating a ticket;
- update internal state before sending a noncritical notification.

Reordering alone cannot solve every problem, but it reduces failure windows.

---

## 16.2 Technique 2: Validate All, Then Mutate All

Separate validation from mutation.

```java
for (ShowSeat seat : seats) {
    seat.validateCanHold();
}

for (ShowSeat seat : seats) {
    seat.hold(ticketId, expiresAt);
}
```

This avoids an expected validation exception after some seats have already changed.

However, validation and mutation must occur under the same lock or transaction. Otherwise, another thread can change a seat between the two loops.

```text
lock
  validate all
  mutate all
unlock
```

The entity should still validate inside `hold()` as a final safety check. A separate `validateCanHold()` method is an orchestration aid, not a replacement for invariant protection.

---

## 16.3 Technique 3: Apply and Roll Back

When advance validation is impossible, record completed actions and reverse them if a later step fails.

```text
try:
    hold seat A
    hold seat B
    hold seat C
catch:
    release every seat successfully held by this operation
    rethrow
```

Rollback code adds complexity and can also fail. In an interview, prefer validate-all-then-mutate when the problem permits it.

---

## 16.4 BookMyShow Example: Selecting Seats

A risky ordering is:

```text
1. Save pending ticket.
2. Hold requested seats.
3. Calculate ticket price.
```

If holding a seat fails, an invalid ticket remains stored.

A safer flow is:

```text
1. Load all requested ShowSeat objects.
2. Lock the seats or the show-level booking aggregate.
3. Verify every seat is available.
4. Calculate the final price.
5. Create the ticket in memory.
6. Hold every seat using the ticket ID.
7. Save the ticket and seat changes atomically.
8. Release the lock.
```

In a database-backed implementation, steps 3–7 should be inside a transaction or use a conditional update that prevents two users from holding the same seat.

---

## 16.5 BookMyShow Example: Paying for a Ticket

A possible flow is:

```text
1. Release unrelated expired holds.
2. Verify the ticket is still active.
3. Process payment.
4. Book all held seats.
5. Confirm the ticket.
```

Important questions:

- What happens if payment succeeds but seat booking fails?
- Can the payment be refunded?
- Can the booking be retried idempotently?
- Is the payment provider call inside or outside the database transaction?

For a coding interview, state a simplified assumption such as:

> The payment processor is mocked and returns synchronously. I will validate the ticket and seats first, then process payment, then atomically confirm the seats and ticket. In production, I would use idempotency, payment reconciliation, and a saga or durable workflow for failures across external systems.

This demonstrates awareness without expanding the implementation beyond the interview scope.

---

# Part XIII — Make the Design Thread-Safe

## 17. Concurrency Is About Broken Invariants

Do not ask only, “Which methods are writes?” Ask:

> Which invariant can be broken if two operations interleave?

Common unsafe operation shapes are:

### Check then act

```text
if seat is AVAILABLE:
    mark seat HELD
```

Two threads can both observe `AVAILABLE` and both succeed.

### Read, modify, write

```text
quantity = rack.quantity
quantity = quantity - 1
rack.quantity = quantity
```

Two threads can lose an update.

### Multi-object update

```text
hold seats
create ticket
update inventory
```

Another thread can observe or modify an intermediate state.

### Iteration while modifying a collection

One thread iterates through stops while another inserts or removes stops.

### Two methods modifying the same invariant

```text
acceptRide()
cancelRide()
```

They may be safe independently but unsafe when executed against the same ride concurrently.

---

## 17.1 First Identify Shared Mutable State

For every core entity, list:

- mutable fields;
- methods that read them for decisions;
- methods that modify them;
- invariants involving multiple fields;
- collections that can be accessed concurrently.

Example: `ShowSeat`

```text
Mutable fields:
- status
- heldByTicketId
- holdExpiresAt

Invariant:
- AVAILABLE implies no holder and no expiry.
- HELD implies a holder and expiry exist.
- BOOKED implies a confirmed ticket owns the seat.

Mutating methods:
- hold()
- releaseHold()
- book()
```

All transitions affecting this invariant must use the same synchronization policy.

---

## 17.2 Same Method, Multiple Threads

Example: two users call `hold()` for the same seat.

```java
public synchronized void hold(String ticketId, Instant expiresAt) {
    if (status != ShowSeatStatus.AVAILABLE) {
        throw new SeatUnavailableException(id);
    }
    status = ShowSeatStatus.HELD;
    heldByTicketId = ticketId;
    holdExpiresAt = expiresAt;
}
```

Synchronizing on the seat instance makes the check-and-update operation atomic within one process.

For a distributed system, process-local `synchronized` is insufficient. A database conditional update, row lock, distributed lock, or another storage-level concurrency mechanism is needed.

---

## 17.3 Different Methods, Same Object

Example:

```text
Ticket.confirm()
Ticket.expire()
Ticket.cancel()
```

All modify the ticket lifecycle. Synchronizing only `confirm()` does not protect the state if `expire()` can run concurrently without the same lock.

Use one lock for all transitions that protect the same invariant.

```java
class Ticket {
    private final Lock lock = new ReentrantLock();

    void confirm() {
        lock.lock();
        try {
            // validate and transition
        } finally {
            lock.unlock();
        }
    }

    void expire() {
        lock.lock();
        try {
            // validate and transition
        } finally {
            lock.unlock();
        }
    }
}
```

---

## 17.4 Different Fields Can Still Form One Invariant

It is unsafe to assume that two threads are harmless merely because they update different fields.

Example:

```text
status = HELD
heldByTicketId = ticket-1
holdExpiresAt = 10:05
```

These fields collectively represent one logical state. Another thread must not observe `status = HELD` before the holder and expiry are visible.

Similarly, `currentFloor`, `direction`, `doorState`, and `movementState` may form a safety invariant in an elevator.

Lock based on invariants and operations, not only individual fields.

---

## 17.5 Concurrent Collections

Use concurrent collections when the collection itself is accessed by multiple threads.

Examples:

- `ConcurrentHashMap` for repositories;
- `ConcurrentSkipListSet` for a concurrently accessed sorted stop set;
- `BlockingQueue` for producer-consumer processing.

A concurrent collection protects its own operations. It does not make a larger workflow atomic.

This is still unsafe:

```java
if (!tickets.containsKey(id)) {
    tickets.put(id, ticket);
}
```

Use an atomic operation:

```java
Ticket previous = tickets.putIfAbsent(id, ticket);
if (previous != null) {
    throw new AlreadyExistsException(id);
}
```

Likewise, `ConcurrentHashMap` cannot make “hold five seats and create one ticket” atomic. That workflow needs a higher-level lock or transaction.

Concurrent collections have overhead, so use them only for shared collections.

---

## 17.6 `synchronized` Versus Explicit Locks

Use `synchronized` when:

- one object is the lock;
- the critical section is simple;
- no timeout or interruptible lock acquisition is needed.

Use `ReentrantLock` when you need:

- `tryLock()`;
- timed lock acquisition;
- interruptible acquisition;
- several condition variables;
- explicit control over lock scope.

The important decision is the lock boundary, not the keyword.

---

## 17.7 Lock Granularity

Possible lock scopes include:

- entire service;
- one aggregate, such as a game or ticket;
- one seat;
- one show;
- one rack;
- one elevator.

A coarse lock is simpler but reduces concurrency. A fine-grained lock allows more parallelism but introduces complexity and deadlock risk.

Example for seat booking:

- locking the entire booking service is too coarse;
- locking each seat permits parallel booking of unrelated seats;
- booking several seats requires acquiring all seat locks in a consistent order;
- a show-level lock is simpler and may be acceptable for an interview.

State the trade-off explicitly.

---

## 17.8 Avoid Deadlocks

If an operation locks multiple objects, always acquire locks in a stable order.

For seat IDs:

```text
1. Sort seat IDs.
2. Acquire locks in sorted order.
3. Validate and mutate.
4. Release locks in reverse order.
```

Never let one operation lock seat A then B while another locks B then A.

Keep critical sections small and avoid slow network calls while holding locks.

---

## 17.9 `volatile` and Atomic Variables

### `volatile`

`volatile` provides visibility of the latest value between threads and restricts certain reorderings.

It does not make compound operations atomic.

This is not made safe by `volatile`:

```java
volatile int count;
count++;
```

`count++` is a read-modify-write operation.

### Atomic variables

Use `AtomicInteger`, `AtomicLong`, or `AtomicReference` for simple atomic updates to one independent value.

Examples:

- incrementing a metric;
- generating an in-process sequence;
- atomically swapping a reference.

They are not a replacement for a lock when several fields or objects must change together.

---

## 17.10 Double-Checked Locking

Double-checked locking is a specialized optimization, most commonly discussed for lazy initialization.

```java
if (instance == null) {
    synchronized (lock) {
        if (instance == null) {
            instance = createInstance();
        }
    }
}
```

It is not a general rule for locking in the middle of every business method. For normal state transitions, acquire the correct lock before the validation whose result must remain true until mutation completes.

---

## 17.11 A Concurrency Review Procedure

For each public use case:

1. list every object and collection it mutates;
2. identify every check followed by a write;
3. identify other methods that mutate the same invariant;
4. decide the lock or transaction boundary;
5. verify that validation and mutation occur inside that boundary;
6. verify atomic collection operations are used;
7. verify locks are acquired in a consistent order;
8. verify no external network call occurs while holding a lock unless unavoidable;
9. verify retries are idempotent where duplicate requests are possible.

Duplicate clicks caused by retries or network lag are not solved only by thread-safe collections. Use an idempotency key or operation identifier when the same logical request may arrive more than once.

---

# Part XIV — Final Correctness Review

## 18. Check for Dual Writes

For each use case, ask:

- Which entities should change?
- Is the same fact stored in more than one place?
- If so, are all copies updated together?
- Is one copy authoritative?
- Can one side be derived instead of stored?

Example:

When a seat is booked, you might update:

- `ShowSeat.status`;
- `ShowSeat.ticketId`;
- `Ticket.status`;
- `Ticket.showSeatIds`.

Make sure the operation cannot leave the ticket confirmed while a seat remains held or available.

---

## 19. Check Atomicity

For every façade method containing multiple mutations:

- Can a validation fail after an earlier mutation?
- Can the process fail between updates?
- Can another thread observe partial state?
- Can the operation be reordered?
- Can all validations happen first?
- Is rollback required?
- Would a database transaction be used in production?

---

## 20. Check Encapsulation

Look for weak APIs such as:

```text
setStatus()
setQuantity()
setCurrentPlayer()
```

Replace them with meaningful operations:

```text
confirm()
decrementStock()
switchTurn()
```

The meaningful method can enforce the invariant and make the class easier to understand.

---

## 21. Check Extensibility Without Overengineering

For every interface or abstract class, ask:

- Is there a real variation in the requirements?
- Are at least two implementations plausible?
- Does polymorphism simplify clients?
- Could an enum or simple composition solve it more clearly?

For every large switch, ask:

- Does this switch select a changing algorithm or type?
- Is it duplicated in multiple clients?
- Would a strategy registry or factory reduce duplication?

Do not introduce patterns for hypothetical changes that the problem does not suggest.

---

## 22. Check the SOLID Principles Practically

### Single Responsibility Principle

A class should have one primary reason to change.

- `Ticket` changes when ticket lifecycle rules change.
- `PricingStrategy` changes when pricing rules change.
- `PaymentProcessor` changes when provider integration changes.

### Open-Closed Principle

Prefer adding a new strategy implementation instead of rewriting every caller.

### Liskov Substitution Principle

A subtype must be usable wherever the parent type is expected without breaking assumptions.

Avoid inheritance when subclasses need to disable or contradict parent behavior.

### Interface Segregation Principle

Prefer focused interfaces:

```text
PaymentProcessor
NotificationSender
TicketRepository
```

rather than one enormous `SystemManager` interface.

### Dependency Inversion Principle

High-level use cases should depend on abstractions:

```text
BookingService → PaymentProcessor
BookingService → TicketRepository
```

not directly on a specific payment SDK or SQL implementation.

---

# Part XV — Worked Mini-Examples

## 23. Tic-Tac-Toe Through the Framework

### Requirements

- Two players use `X` and `O`.
- The board is `3 × 3`.
- Players alternate turns.
- A player wins by completing a row, column, or diagonal.
- The game ends in a draw when the board is full without a winner.

### Core entities

```text
Game
Board
Player
Move
Position
```

### Important statuses

```text
GameStatus = NOT_STARTED, IN_PROGRESS, WON, DRAW
```

### Public use cases

```text
startGame()
makeMove(playerId, position)
getGameState()
```

### Method placement

- `Board.isEmpty(position)` — `Board`;
- `Board.place(symbol, position)` — `Board`;
- `WinStrategy.hasWon(board, symbol)` — strategy;
- `Game.switchTurn()` — `Game`;
- `GameService.makeMove()` — orchestration.

### Extensibility

Use `WinStrategy` if board sizes or winning rules may vary.

### Concurrency

Lock on the `Game` aggregate during `makeMove()` so two players cannot both pass the turn validation.

### Undo

Use move commands or store move history when undo is required.

---

## 24. BookMyShow Through the Framework

### Requirements

- Search shows by city and movie.
- View seats for a show.
- Hold selected seats temporarily.
- Pay before the hold expires.
- Confirm the booking after payment.

### Core entities

```text
City
Theater
Screen
Seat
Movie
Show
ShowSeat
Ticket
Payment
User
```

### Key modeling insight

`Seat` is physical and mostly static. `ShowSeat` stores show-specific availability, price, hold, and booking information.

### Public use cases

```text
searchShows()
getSeats()
selectSeats()
pay()
cancelTicket()     // only when in scope
```

### Strategies and gateways

```text
PricingStrategy
PaymentProcessor
NotificationService
Clock
```

### Atomicity

Hold all selected seats and create the ticket as one atomic workflow.

### Concurrency

Prevent two users from holding the same `ShowSeat`. In-memory code can lock by show or seat; a production database can use conditional updates or row locks.

---

## 25. Vending Machine Through the Framework

### Requirements

- Select a product.
- Accept payment.
- Validate sufficient stock and money.
- Dispense the product.
- Return change.
- Allow cancellation before completion.

### Core entities

```text
VendingMachine
Rack
Product
Transaction
Coin
```

### State

```text
IDLE
PRODUCT_SELECTED
PAYMENT_IN_PROGRESS
DISPENSING
OUT_OF_SERVICE
```

### Useful patterns

- State for valid action ordering;
- Strategy for change calculation;
- external gateway or adapter for payment;
- dispenser interface for hardware.

### Atomicity

Do not permanently decrement inventory unless the payment and dispensing workflow can complete or compensate.

### Concurrency

Lock the active transaction for a physical machine. If remote purchases are supported, also protect rack inventory.

---

## 26. Elevator System Through the Framework

### Requirements

- Request an elevator from any supported floor.
- Select a destination floor.
- Assign an elevator.
- Move it safely.
- Update displays.

### Core entities

```text
Building
Elevator
ElevatorRequest
Floor
Display
```

### Strategies

```text
ElevatorAssignmentStrategy
MovementSchedulingStrategy
```

### Important state

```text
currentFloor
direction
movementState
doorState
pendingStops
capacity
```

### Events

Publish elevator position and direction changes to displays.

### Concurrency

Requests can be added while the elevator is moving. Protect the stop plan and movement state under a consistent synchronization policy.

---

# Part XVI — A Reusable Interview Template

## 27. Requirement Checklist

```markdown
## Requirements

### Structural requirements
- What does the system contain?
- What are the containment relationships?
- What types and limits exist?

### User actions
- What can the user do?

### Admin actions
- What can the administrator configure?

### System actions
- What happens automatically?

### Scope
- What is in scope?
- What is explicitly out of scope?

### Common clarifications
- Offline or online?
- Single-threaded or concurrent?
- What should be extensible?
- Is history required?
- Is undo required?
- Is event broadcasting required?
- Which workflows must be atomic?
```

---

## 28. Use-Case Template

```markdown
## Use Cases

### <useCaseName>(<inputs>)
Actor: <User/Admin/System>

Flow:
1. Validate input.
2. Load required entities.
3. Validate current state and business rules.
4. Perform domain changes.
5. Persist the changes.
6. Publish events or return the response.

Failures:
- <not found>
- <invalid state>
- <business rule failure>
- <concurrent modification>
```

---

## 29. Class-Diagram Template

```markdown
## Core Entities

### <Entity>
Fields:
- id
- ...

Methods:
- ...

Invariants:
- ...

Relationships:
- one-to-one / one-to-many / many-to-many

## Value Objects
- ...

## Enums and Statuses
- ...

## Services
- <Facade/ApplicationService>
- <DomainService>

## Strategies
- <StrategyInterface>
  - <ImplementationA>
  - <ImplementationB>

## Repositories
- <EntityRepository>
  - InMemory<Entity>Repository
  - Sql<Entity>Repository

## External Interfaces
- PaymentGateway
- NotificationService
- HardwareController
```

---

## 30. Method-Placement Checklist

For every candidate method, ask:

```text
Does it change only one entity's state?
  → Put the state transition in that entity.

Does it coordinate several entities?
  → Put the workflow in an application service or façade.

Does its algorithm vary?
  → Put it behind a strategy interface.

Does it call a network, database, or hardware dependency?
  → Put it behind a gateway or repository interface.

Does it only construct a complex polymorphic object?
  → Consider a factory.
```

---

## 31. Correctness Checklist

Before finishing, review every public use case.

### Validation

- Are arguments validated?
- Are missing entities handled?
- Are invalid states rejected?
- Are business-rule failures represented clearly?

### Atomicity

- Does the use case update multiple objects?
- Can validation fail after a mutation?
- Can updates be reordered?
- Can all validations happen first?
- Is a transaction or rollback needed?

### Concurrency

- What shared mutable state is touched?
- Is there a check-then-act sequence?
- Do different methods change the same invariant?
- Are collections shared between threads?
- Is the critical section protected by one consistent lock or transaction?
- Is lock ordering consistent?
- Are retries idempotent?

### Consistency

- Is the same relationship stored in multiple places?
- Can a dual write leave the two sides inconsistent?
- Is one copy authoritative?

### Extensibility

- Which entity types may grow?
- Which algorithms may change?
- Which validations may be added?
- Are patterns used only where they provide a real benefit?

---

# Part XVII — How to Present the Design in an Interview

## 32. A Strong Explanation Sequence

A clear interview narration may sound like this:

> I will first confirm the core workflows and scope. Then I will identify the main domain entities and their relationships. I will derive public service methods from the use cases, keep entity-owned state transitions inside the entities, and use services for orchestration across multiple objects. After the happy path is complete, I will add extension points, exception handling, atomicity, and concurrency protection.

When adding an abstraction, explain the reason:

> Elevator selection can change independently from the rest of the system, so I will represent it as an `ElevatorAssignmentStrategy`.

When intentionally simplifying, say so:

> For this interview implementation, I will use an in-memory repository. The service depends on a repository interface, so persistent storage can be introduced without changing the domain workflow.

When choosing not to use a pattern, say why:

> Seat types currently differ only by a finite category and have no specialized behavior, so subclasses would be overengineering. I will use a `SeatType` enum and let the pricing strategy interpret it.

When postponing production complexity, describe the production direction:

> In this single-process implementation, I will lock the show while seats are held. In production, the same invariant would be enforced by a database transaction or conditional update because a JVM lock cannot coordinate multiple servers.

---

## 33. Common Mistakes to Avoid

### Starting with design patterns

Do not begin with “I will use Factory, Strategy, Observer, and State.” Begin with requirements and variability.

### Turning every noun into a class

Some nouns are fields, enums, values, or external systems.

### Creating empty inheritance hierarchies

`NormalSeat`, `PremiumSeat`, and `ReclinerSeat` are unnecessary when they contain no different state or behavior.

### Putting all behavior in the façade

This creates a god service and exposes entity state through setters.

### Putting external calls inside entities

Entities should not directly call payment providers, databases, notification APIs, or hardware drivers.

### Using setters for lifecycle transitions

Prefer `confirm()`, `hold()`, `cancel()`, and `expire()` over `setStatus()`.

### Confusing class relationships with database design

The object model and storage schema solve related but different problems.

### Validating while already mutating

When multiple objects are updated, one late validation failure can leave partial state.

### Assuming a concurrent map makes the workflow thread-safe

It protects map operations, not multi-object business invariants.

### Synchronizing only one of several mutating methods

All operations modifying the same invariant must follow the same locking policy.

### Locking too broadly or too narrowly

A global lock removes useful concurrency; inconsistent fine-grained locks create races and deadlocks.

### Ignoring duplicate requests

The same logical request may be retried. Use an operation ID or idempotency key when repeated execution would be harmful.

### Overengineering before finishing the happy path

A complete, correct basic design is better than an unfinished pattern-heavy design.

---

# Final Summary

A reusable LLD framework can be reduced to five major questions:

1. **What must the system do?**  
   Clarify structure, actors, workflows, scope, and constraints.

2. **Which objects own the important state?**  
   Identify entities, value objects, relationships, statuses, and invariants.

3. **Where should each behavior live?**  
   Keep entity state transitions in entities, orchestration in services, variable algorithms in strategies, and external interactions behind interfaces.

4. **How can the design evolve?**  
   Introduce enums, composition, interfaces, inheritance, and design patterns only where a real variation exists.

5. **How does the design remain correct?**  
   Handle invalid input, illegal state, multi-object atomicity, concurrency, dual writes, and idempotency.

The best LLD solution is not the one with the most classes. It is the one in which responsibilities are easy to explain, state transitions are safe, extension points are deliberate, and every important use case can be followed from entry point to final state.
