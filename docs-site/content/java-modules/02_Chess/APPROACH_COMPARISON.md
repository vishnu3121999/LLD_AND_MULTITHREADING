# 02_Chess Approach Progression

These packages intentionally implement a basic chess engine surface:

- Initial board setup
- Current-player tracking
- Basic piece movement
- Captures
- Blocked-path checks for rook, bishop, and queen
- Post-move game result evaluation
- Win when a king is missing
- Draw when only kings remain
- Online-style game lookup through `IDatastore`
- Extensible `ChessBoard -> ClassicBoard` and `ChessGame -> ClassicGame` inheritance
- `ChessGame` owns its `gameId`
- Explicit `Move` object carrying player, from, and to
- Board-size-aware `Position.isValid(boardSize)`

Added only in later packages:

- `G_exceptionhandling`: game-state, turn validation, and `IlligalMoveException`
- `H_concurrency`: minimal per-game synchronization for online moves and undo
- `I_AdditionalFeatures`: check, checkmate, stalemate, castling, en passant, and auto queen promotion
- `J_flyweight`: shared immutable piece flyweights by type and color
- `K_persistence`: durable Postgres-backed game and undo-history snapshots

Still not included:

- Timers
- Player matchmaking/session handling
- Algebraic notation

## A_basicV1: Polymorphic Piece Children

Main idea:

```text
Piece = abstract parent
King/Rook/Bishop/etc = child classes
ChessBoard = abstract chess board parent
ClassicBoard = concrete 8x8 classic chess board
ChessGame = abstract chess game parent
ClassicGame = concrete classic chess game
ChessGame stores gameId
Player owns identity only
ClassicGame tracks currentPlayer and winner as Player
Each piece owns canMove(board, move)
ChessBoard asks piece.canMove(...)
GameResultEvaluator checks winner/draw after every applied move
ClassicGame owns classic chess move flow without enforcing turn/player-color rules
ChessGameServiceFacade loads games from IDatastore by gameId
```

Best for:

- Simple OOP explanation
- Natural class hierarchy
- Easy first version for interviews

Tradeoff:

- `Piece` depends on `ChessBoard`.
- Movement logic is tied to entity classes.
- Shared movement patterns can be duplicated or pushed into helpers.

## A_basicV2: MoveValidator Service

Main idea:

```text
Piece = pure data object
ChessBoard = abstract chess board parent
ClassicBoard = concrete 8x8 classic chess board
ChessGame = abstract chess game parent
ClassicGame = concrete classic chess game
ChessGame stores gameId
Player owns identity only
ClassicGame tracks currentPlayer and winner as Player
MoveValidator = checks board bounds, same square, source piece, ownership, own-piece capture, and movement using switch(pieceType)
GameResultEvaluator checks winner/draw after every applied move
ClassicGame owns classic chess move flow without enforcing turn or game-state move validation
ChessGameServiceFacade loads games from IDatastore by gameId
```

Best for:

- Keeping core entities lightweight
- Moving board-dependent logic out of entities
- Showing a clean domain-service boundary

Tradeoff:

- `MoveValidator` has a central switch.
- Adding a new piece means editing validator logic.
- Strategy pattern is not introduced yet.

## B_Strategy: Introduce Strategy Pattern

Main idea:

```text
Piece = pure data object
MoveValidator = validates common move rules
MovementStrategy = piece-specific movement behavior
MoveValidator selects the right strategy
ChessBoard = abstract chess board parent
ClassicBoard = concrete 8x8 classic chess board
ChessGame = abstract chess game parent
ClassicGame = concrete classic chess game
ChessGame stores gameId
Player owns identity only
ClassicGame tracks currentPlayer and winner as Player
MoveValidator checks board bounds, same square, source piece, ownership, own-piece capture, and delegates movement
GameResultEvaluator checks winner/draw after every applied move
ChessGameServiceFacade loads games from IDatastore by gameId
```

Best for:

- Separating movement algorithms
- Reusing movement behavior
- Preparing for chess variants and custom pieces

Tradeoff:

- Strategy selection still lives inside `MoveValidator`.
- Piece creation is still manual inside `ChessBoard`.
- More files than `A_basicV2`.

## C_Factory: Introduce Factory Pattern

Main idea:

```text
MovementStrategyFactory = maps PieceType to MovementStrategy
MoveValidator uses MovementStrategyFactory
ChessBoard = abstract chess board parent
ClassicBoard = concrete 8x8 classic chess board
ChessGame = abstract chess game parent
ClassicGame = concrete classic chess game
ChessGame stores gameId
Player owns identity only
ClassicGame tracks currentPlayer and winner as Player
MoveValidator checks board bounds, same square, source piece, ownership, own-piece capture, and delegates movement
GameResultEvaluator checks winner/draw after every applied move
ChessGameServiceFacade loads games from IDatastore by gameId
```

Best for:

- Centralizing object creation
- Removing construction details from board and validator
- Making variants/configurable creation easier later

Tradeoff:

- Most indirection among current versions.
- Slightly heavier than needed for a small offline game.

## D_Memento: Introduce Memento Pattern

Main idea:

```text
Builds on C_Factory
GameMemento = immutable snapshot of board, gameState, currentPlayer, and winner
GameCaretaker = stores memento history per gameId
ChessGame = originator that creates and restores mementos
ChessGameServiceFacade saves a memento before each successful move
undoLastMove(gameId) restores the latest snapshot
```

Best for:

- Undo without mixing reversal logic into every move type
- Restoring captured pieces, game state, current player, and winner together
- Explaining Memento separately from Command

Tradeoff:

- Snapshots copy board state, so memory grows with move history.
- Full chess would need richer piece state if pieces later become mutable.

## E_Observer: Introduce Observer Pattern

Main idea:

```text
Builds on D_Memento
GameObserver = listener contract for game events
BoardPrintObserver = reacts to game start, successful moves, and undo by printing the board
ChessGameServiceFacade owns observer registration and notification
Main wires observers but does not directly print the board
```

Best for:

- Separating game actions from display/update reactions
- Preparing for UI refreshes, logs, analytics, or notifications
- Avoiding direct board rendering calls from `Main`

Tradeoff:

- Adds event plumbing.
- Observers must stay side-effect focused and avoid changing core game rules.

## F_COR: Introduce Chain Of Responsibility

Main idea:

```text
Builds on E_Observer
MoveValidator becomes a small entry point
MoveValidationHandler = common contract for one validation step
BoardBoundsValidationHandler checks source and destination positions
SameSquareValidationHandler rejects no-op moves
SourcePieceValidationHandler checks that the move starts from a piece
PieceOwnershipValidationHandler checks that the player owns the source piece
OwnPieceCaptureValidationHandler rejects capturing the player's own piece
PieceMovementValidationHandler delegates to the movement strategy
```

Best for:

- Splitting move validation into independent rule classes
- Adding future rules like turn validation, game-state validation, check, or checkmate
- Keeping the service/game flow unchanged while validation grows

Tradeoff:

- More classes for simple validation.
- The chain order matters and must be easy to read from `MoveValidator`.

## G_exceptionhandling: Add Validation Exceptions

Main idea:

```text
Builds on F_COR
Validation handlers throw IlligalMoveException
GameActiveValidationHandler checks that moves happen only while the game is running
PlayerTurnValidationHandler checks the current player
SourcePieceValidationHandler owns the missing-source-piece check
PieceMovementValidationHandler assumes a source piece already exists
MoveValidator keeps the chain shape while rules become explicit failures
```

Best for:

- Making invalid moves fail loudly with clear reasons
- Giving callers one exception type for COR validation failures
- Moving from boolean validation to interview-ready error handling

Tradeoff:

- Callers must handle runtime failures instead of only checking `false`.
- Validation behavior is now part of the public contract.

## H_concurrency: Add Minimal Concurrency Control

Main idea:

```text
Builds on G_exceptionhandling
ConcurrentHashMap stores games and caretakers in separate maps
synchronized(datastore) protects game creation because no per-game object exists yet
synchronized(game) protects start, move, undo, memento save, and restore
CopyOnWriteArrayList protects observer iteration
GameCaretaker remains simple because it is accessed under the game lock
```

Best for:

- Preventing two moves from mutating the same game at the same time
- Keeping locks per game instead of blocking all games globally
- Avoiding unnecessary concurrency machinery

Tradeoff:

- Observer callbacks run after the game lock is released, so callbacks cannot block the critical section.
- Observers receive the live game object, so a production service may prefer immutable event snapshots.

## I_AdditionalFeatures: Add Fuller Chess Rules

Main idea:

```text
Builds on H_concurrency
CheckDetector detects attacked kings and attacked squares
KingSafetyValidationHandler rejects moves that expose own king
GameResultEvaluator detects checkmate and stalemate
SpecialMoveService handles castling, en passant, and auto queen promotion
Memento stores last move and moved-position state for undo
```

Best for:

- Showing how real chess rules layer on top of validation
- Separating special move execution from basic piece movement
- Replacing the earlier simplified "king missing means win" logic

Tradeoff:

- More rule objects and more simulation.
- Special moves require extra state beyond the board.

## J_flyweight: Share Immutable Piece Objects

Main idea:

```text
Builds on I_AdditionalFeatures
Piece stays immutable: type + color only
PieceFlyweightFactory pre-creates one Piece for each PieceType + Color
ClassicBoard and SpecialMoveService use PieceFlyweightFactory directly instead of allocating every time
```

Best for:

- Showing Flyweight without changing board, move, or rule logic
- Reducing duplicate immutable piece objects across boards/games
- Keeping extrinsic state outside Piece; position still lives in the board

Tradeoff:

- Memory savings are small for one chess game.
- This is mainly useful when many games, simulations, or analysis boards exist.

## K_persistence: Persist Games In Postgres

Main idea:

```text
Builds on J_flyweight
PostgresDataStore implements IDatastore using Spring Data JPA repositories
ChessGameEntity stores game metadata + board snapshot
GameCaretakerEntity stores undo-history memento snapshots
Service saves the game and caretaker after start, move, and undo mutations
Service locks by gameId instead of relying on loaded game-object identity
```

Best for:

- Showing how an online chess game can survive process restarts
- Keeping the service API unchanged while swapping datastore implementations
- Keeping SQL and connection handling out of the datastore class
- Persisting board state and memento history without changing move validation
- Avoiding datastore-side object caches; Postgres is the source of truth

Tradeoff:

- Requires Spring Data JPA, a JPA provider, and a Postgres driver at runtime.
- Snapshot columns are simple for LLD, but less queryable than fully normalized board-cell tables.

## Recommendation

Use this progression when explaining:

```text
A_basicV1: Start with natural OOP.
A_basicV2: Move board-dependent behavior out of entities.
B_Strategy: Separate movement algorithms.
C_Factory: Centralize movement strategy creation.
D_Memento: Add undo by storing and restoring game snapshots.
E_Observer: React to game events without direct UI calls from Main.
F_COR: Split move validation into a chain of small rule handlers.
G_exceptionhandling: Add game-state/current-turn checks and convert COR failures into IlligalMoveException.
H_concurrency: Add only the synchronization required for online moves.
I_AdditionalFeatures: Add check, checkmate, stalemate, and special moves.
J_flyweight: Share immutable piece objects across boards/games.
K_persistence: Store game state and undo history in Postgres.
```

For your preferred principle, the best baseline is:

```text
A_basicV2
```

The best extensible version is:

```text
C_Factory
```

For the next evolution step, add:

```text
MoveHistory
Command pattern for undo
Timers
Algebraic notation
Matchmaking/session management
```
