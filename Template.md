# LLD Notes

## Requirements

### System-specific requirements
- Physical structure-based points (for example: parking lot → multiple floors → slots with different sizes).
- Action-based points: what actions users/admins can do (not system actions), such as entering and exiting by doing specific steps.

### Common topics (optional)
- Concurrency and thread safety.
- Store full history and support undo — Memento / Command.
- Extensibility:
  - Add a new slot type in parking lot.
  - Make an in-memory app persistent using `IState` / `InMemoryState`.
  - Identify sibling core entities early — use Factory.
  - Identify business logic that may vary — use Strategy + Factory.
- Exception handling:
  - Capacity issues.
  - Existence issues.
  - Example: lot is full, lot does not exist.
- Edge cases:
  - Incorrect order of actions, such as exit before entry — use State.
  - Check with the interviewer whether the UI hides certain methods based on current state, or whether the UI does not handle it and the code must explicitly handle it.
  - If the UI cannot handle it, first handle corner cases and then replace with the State design pattern.
- Notifications / broadcasts needed? Use Observer.
- Offline or online?
  - Online → API-based.
  - Offline → parallelism is 1.
    - Design it like an API-based system.
    - If an interactive version is needed, run a `while` loop inside `main`.
    - No need to store the machine/game in datastore; store it directly in `serviceFacade`.

---

## Use Case Diagram

- Actors: User, Admin, System
- Use cases: to be defined based on the problem statement.

---

## Class Diagram

### Layering
- `controller`, `service` → server code
- `factories`, `strategies`, `core entities` → library code
- `main` → client code / UI
- `datastore` → database
- Library code is imported by both servers and clients.

### Design approach
Design each layer one by one.

#### Core entities (models) and enums

##### Design steps for extensible classes
- This is mostly a prediction problem.
- If you cannot predict future variation, downcasting may be the only option.
- Assume variation can be predicted when applying the following.

**Fields**
- Same across siblings:
  - Move common fields, along with getters/setters, to the parent.
- Extra or different fields:
  - If they are not exposed outside through getters/setters:
    - Treat them as internal implementation detail.
    - Initialize through constructor.
  - If they must be exposed, design accordingly.

**Methods**
- Same across siblings:
  - Move common methods upward.
- Extra methods:
  - Consider multi-level inheritance if needed.

##### Multiple siblings possible?
- No → model as a simple object.
- Yes → possible choices:
  1. Multiple simple classes
     - Not ideal, because polymorphism is not enabled.
  2. Single class with composition / strategy for method behavior
     - Usually not preferred here.
  3. Inheritance
     - Useful to avoid code duplication.

##### Parent type: interface or abstract class?
- Abstract class:
  - Less code duplication.
  - Prevents multiple inheritance.
  - For core entities, at least `id` is usually common, so abstract class is often better.
  - Easy to use in IDEs: subclass constructor can accept parent fields and add `super(...)`.
- Abstract class usage:
  - protected fields
  - protected constructor
  - public getters/setters
  - public methods shared only by subclasses
  - public abstract methods for behavior every child must implement
- Child classes:
  - Use `super(...)` for parent constructor only.
  - Access fields directly.
  - Use non-abstract parent methods as if they were part of the child.

##### Keep the design simple
- Extensible + state present → abstract class
- Extensible + only behavior changes, no state → interface
- Single field state and no behavior → enums

---

## Where should methods live?

### Simple classes
- If a method performs a simple operation on the class’s own fields and is not business logic:
  - Keep it inside the class.
  - This improves encapsulation.
  - Example: distance calculation in `Location`.
- Otherwise:
  - Move it to a service class.
  - Example: price calculation in `Ticket`.

Why:
- To follow SRP, entities should stay light and mostly contain data.
- Behavior that depends on external objects should be delegated.
- Core entities should mainly manage their own state.

### Inheritance-based classes
- If behavior varies across siblings:
  - Keep the behavior inside the entity itself.
  - Putting it in a service class would lead to `if-else` logic everywhere or too many strategy classes.
  - `if-else` violates Open/Closed.
  - Too many strategy classes may violate KISS.
- Example: `canMove()` in a chess piece.

---

## Creation patterns

- Bring in Singleton / Factory / Builder only when needed.
- Do not create simple objects with factories.
  - If the object has no complexity or inheritance, a factory is overkill and breaks KISS.
- Inheritance-based creation:
  - Use factory.
- Configuration classes:
  - Use Singleton.
  - Example: logger.
- Requests:
  - Use Builder.

### Using Factory
- Inside classes:
  - Use factory for runtime selection based on type.
  - Avoid switch blocks in multiple client classes.
  - This prevents duplication and follows Open/Closed.
  - Example: payment type.
- Inside the driver / startup code:
  - Use factory only if creation logic is complex.
  - For most LLD problems, startup creation logic is not complex.
  - Example: parsing config and creating a temporary stub.
  - In this case, factory mainly removes duplication, not Open/Closed concerns.

---

## Observer
- Use Observer when events must be broadcast.
- Not for one-to-one communication, because responses can handle that.
- Example listeners:
  - Push notification service
  - Websocket service
  - Monitoring service

---

## State
- Corner cases appear when methods are exposed together.
- You do not need to validate all call-order corner cases if the UI hides certain methods.
  - Example: in ride booking, cancel ride may not appear before booking on screen.
- For machines like vending machines or ATMs:
  - The user can click any button anytime.
  - Explicit corner-case and ordering validation is needed.
  - State pattern can later optimize this.
- Consider whether Tic Tac Toe should use State pattern.

---

## Services
- Exception handling
- Edge-case handling
- Synchronization?
  - Only for write APIs?
- Bring in State / Observer / Strategy where needed.
- Admin methods:
  - Example: `boolean registerUser(User user)`
- User methods
- System methods

---

## Database
- Concurrent collections?
- If offline game:
  - No need to store core entities as maps.
  - Store only objects that track history.

---

## Client (`main`)
- Instantiate datastore.
- Instantiate services.
- Instantiate factories and strategies if needed.
- Create objects directly in `main` and pass them to the service layer for registration.
  - If time is limited, store them directly in the datastore.
- `main` acts like the UI:
  - User inputs are captured via forms and converted to objects.
- Simple objects:
  - `User user = new User(id, "vishnu");`
- Inheritance-based objects:
  - Create via factory.
  - Create ids in `main` and pass them to the factory.
- This helps logging:
  - Use readable ids instead of huge random ids when possible.

### If offline
- Do not keep datastore.
- Do not register entities in datastore.
- Create objects directly in `main`; ids may not be needed.

### If online
- Simulate API calls.

---

## Concurrency checks
- Use concurrent data structures.
- Synchronize façade methods.
- If locking at the beginning of the method, that is fine.
- If locking in the middle after checks, use double-checked locking.
- Volatile variables?

---

## Design patterns checklist
- Thread-safety check
- Offline games
- Creation of objects and registering

### Creation of objects and registering
- Always create objects in `main`.
- `main` acts like UI, where user inputs are converted to objects.
- Simple objects:
  - `User user = new User(id, "vishnu");`
- Inheritance-based objects:
  - Use factory.
  - Create ids in `main` and pass them to the factory.
- Register created objects in façade API.
  - Example: `boolean registerUser(User user)`

---

## Notes for specific domains

### Parking lot
- Should spots have ids and be registered in datastore?
  - Yes, because it is one-to-many.
  - A lot can have many spots, and a spot may be queried independently.
  - In SQL, the list is normalized into a separate table, so a spot id is required.
  - In class design, `Lot` stores a list of spot ids.

### Chess
- Game has a single board, so it is one-to-one.
- The board is not queried independently.
- In SQL, store the board inside the game table as a serialized string.
- In class design, store the `Board` object directly inside `Game`, not as an id.
- Do not design AI as a player; model it as a type of game.
- Why no factory for board and only for game?
  - Because board does not exist without game.
  - Nobody creates it explicitly in the client.
  - This is true composition.

---

## Interfaces and inheritance
- When using interfaces:
  - Create all getters and setters in the concrete class.
  - Add them to the interface too.
- If an interface has an extra method:
  - Introduce another interface between parent and concrete class.
  - Downcast only if needed to access that method.
- If a method does not exist:
  - That is a design issue.
  - Make sure methods in the interface are valid for every concrete class to follow LSP.

---

## Piece design
### Option 1: direct inheritance
- `Piece`
  - `Bishop`
  - `Pawn`
  - `King`

### Option 2: single piece class + strategy
- `Piece`
  - `MovementStrategy ms`
  - `canMove() { ms.canMove(); }`
- Strategies:
  - `KingMovementStrategy`
  - `BishopMovementStrategy`

### Recommendation
- Option 1 is simpler.
- Use strategies only where necessary.

### How to create a piece?
- Factory is overkill, because pieces are not created directly by the client.

### Interface or abstract class?
- Abstract class:
  - There is common state across siblings.
  - There are common helper methods.
- Interfaces are often used to promote multiple inheritance.
- For machine coding, chess-like problems are uncommon, so interfaces may be simpler.
- For LLD:
  - If there is state, use abstract class.
  - If there is no state, use interface.

---

## Game design
### Classic game
- `id`
- `board`
- `whitePlayerId`
- `blackPlayerId`
- `currentPlayerId`

### AI game
- `id`
- `board`
- `whitePlayerId`
- `blackPlayerId`
- `currentPlayerId`
- `difficulty`

Notes:
- `whitePlayerId`, `blackPlayerId`, `currentPlayerId`, and `difficulty` are set in constructors.
- They do not need to be accessed outside.

### Getter/setter rule
- Getters/setters are not needed for every field.
- Only fields accessed by the façade should expose them.
- This reduces duplication in interfaces.
- Adding a field that is only set and never read is easy, for example `difficulty`.

---

## Final notes
- For LLD, use abstract classes when there is shared state such as `id`.
- For strategies, use interfaces.
- For machine coding, interfaces are usually easier because you will code at most two subclasses.
- Abstract class is still fine and not too difficult.

