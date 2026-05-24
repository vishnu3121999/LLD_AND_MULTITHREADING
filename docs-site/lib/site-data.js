export const navItems = [
  { href: "/", label: "Home" },
  { href: "/lld-template", label: "Template" },
  { href: "/template-minimal", label: "Minimal" },
  { href: "/problems", label: "Problems" },
  { href: "/patterns", label: "Patterns" },
  { href: "/solve", label: "Practice" },
  { href: "/workspace", label: "Workspace" }
];

export const stackItems = [
  { layer: "Frontend", tool: "Next.js", note: "SEO and modern React routes" },
  { layer: "Styling", tool: "Tailwind CSS", note: "Fast, consistent UI construction" },
  { layer: "Components", tool: "shadcn/ui style primitives", note: "Composable buttons, cards, tabs, inputs" },
  { layer: "Content", tool: "MDX + structured data", note: "Publish essays and render problem templates" },
  { layer: "Database", tool: "Supabase", note: "Auth-ready PostgreSQL integration" },
  { layer: "Hosting", tool: "Vercel", note: "Next deployment path" },
  { layer: "Search", tool: "Algolia-ready API", note: "Local fallback for development" },
  { layer: "Analytics", tool: "PostHog", note: "Client analytics when key is present" },
  { layer: "Email", tool: "Resend", note: "Newsletter endpoint with safe local fallback" }
];

export const templateSteps = [
  "Problem statement",
  "Requirement clarification",
  "Actors and use cases",
  "Core entities",
  "Class diagram",
  "Service APIs",
  "Datastore design",
  "Object creation strategy",
  "Extensibility points",
  "Design patterns",
  "Exception handling",
  "Concurrency handling",
  "Important flows",
  "Code skeleton",
  "Interview talking points",
  "Common mistakes"
];

export const patternCards = [
  {
    title: "Strategy",
    useWhen: ["An algorithm varies independently", "Pricing, matching, assignment, or winning rules may change"],
    avoidWhen: ["There is only one simple rule", "The variation is entity state, not behavior"]
  },
  {
    title: "Factory",
    useWhen: ["Object creation depends on a type", "Subtype construction is repeated in multiple callers"],
    avoidWhen: ["Constructors are simple", "There are no meaningful subtypes"]
  },
  {
    title: "State",
    useWhen: ["A domain object has many valid transitions", "Invalid method order must be blocked explicitly"],
    avoidWhen: ["Two statuses can be handled by small guards"]
  },
  {
    title: "Observer",
    useWhen: ["Several independent systems react to one event", "Booking, payment, or game completion triggers side effects"],
    avoidWhen: ["The caller only needs a direct return value"]
  },
  {
    title: "Command",
    useWhen: ["Actions need undo, replay, or audit", "Moves or edits can be represented as objects"],
    avoidWhen: ["No history or rollback is required"]
  },
  {
    title: "Locking",
    useWhen: ["A write API performs check-then-update", "Seats, spots, inventory, or balances can be modified concurrently"],
    avoidWhen: ["The problem is offline and single-threaded"]
  }
];

export const problems = [
  {
    slug: "parking-lot",
    title: "Design Parking Lot",
    difficulty: "Medium",
    category: "Booking Systems",
    systemType: "Online",
    tags: ["Strategy", "Factory", "Concurrency", "Payment"],
    hasConcurrency: true,
    bestFor: "Entity modeling, spot assignment, fee calculation, and shared-state updates.",
    overview: "Model a multi-floor parking lot where vehicles enter through gates, receive tickets, occupy compatible spots, pay fees, and exit safely.",
    actors: ["Driver", "Admin", "Payment Gateway", "System"],
    entities: ["ParkingLot", "ParkingFloor", "ParkingSpot", "Vehicle", "Ticket", "Payment", "Gate"],
    services: ["enterParkingLot(gateId, vehicle)", "exitParkingLot(ticketId, paymentMode)", "addFloor(lotId, floor)", "addSpot(floorId, spot)"],
    patterns: ["SpotAssignmentStrategy", "FeeCalculationStrategy", "VehicleFactory", "PaymentStrategy"],
    concurrency: ["Two vehicles may be assigned the same spot.", "Spot assignment and occupation must be one critical section."],
    mistakes: ["Forgetting to update spot status after issuing ticket.", "Putting fee logic inside Ticket instead of a pricing strategy.", "Assuming ConcurrentHashMap alone protects spot assignment."],
    code: `interface SpotAssignmentStrategy {
    Optional<ParkingSpot> findSpot(ParkingLot lot, Vehicle vehicle);
}

class ParkingLotService {
    public synchronized Ticket enterParkingLot(String gateId, Vehicle vehicle) {
        ParkingSpot spot = spotAssignmentStrategy.findSpot(lot, vehicle)
            .orElseThrow(ParkingFullException::new);
        spot.occupy(vehicle.getId());
        Ticket ticket = Ticket.open(vehicle.getId(), spot.getId(), gateId);
        ticketRepository.save(ticket);
        return ticket;
    }
}`
  },
  {
    slug: "tic-tac-toe",
    title: "Design TicTacToe",
    difficulty: "Easy",
    category: "Games",
    systemType: "Offline",
    tags: ["Game Loop", "Winning Strategy", "Clean Entities"],
    hasConcurrency: false,
    bestFor: "Separating board state from game rules and keeping the driver thin.",
    overview: "Model a turn-based local game with players, symbols, board placement, win detection, draw detection, and move history.",
    actors: ["Player", "Game System"],
    entities: ["Game", "Board", "Cell", "Player", "Move", "Symbol"],
    services: ["startGame(players)", "makeMove(gameId, playerId, row, col)", "getGameState(gameId)"],
    patterns: ["WinningStrategy", "PlayerSelectionStrategy"],
    concurrency: ["Usually none for local play.", "If exposed online, protect makeMove so two moves cannot be applied to the same turn."],
    mistakes: ["Keeping winning strategy inside Board.", "Letting players mutate cells directly.", "Skipping invalid move validation."],
    code: `class GameService {
    public MoveResult makeMove(String gameId, String playerId, Position position) {
        Game game = gameStore.get(gameId);
        game.validateTurn(playerId);
        game.getBoard().place(position, game.currentSymbol());
        boolean won = winningStrategy.hasWon(game.getBoard(), position);
        game.advance(won);
        return MoveResult.from(game);
    }
}`
  },
  {
    slug: "vending-machine",
    title: "Design Vending Machine",
    difficulty: "Medium",
    category: "Machines",
    systemType: "Offline",
    tags: ["State", "Inventory", "Payment"],
    hasConcurrency: true,
    bestFor: "State transitions, invalid method order, inventory decrement, and change return.",
    overview: "Model a vending machine that accepts money, allows item selection, validates inventory, dispenses the item, and returns change.",
    actors: ["Customer", "Operator", "Machine"],
    entities: ["VendingMachine", "Slot", "Item", "Inventory", "PaymentSession", "Transaction"],
    services: ["insertMoney(amount)", "selectItem(slotCode)", "dispense()", "refill(slotCode, item, quantity)"],
    patterns: ["State Pattern", "PaymentStrategy"],
    concurrency: ["Two customers may race for the last item if the machine is networked or multi-terminal.", "Protect select-and-decrement inventory."],
    mistakes: ["Allowing dispense before payment.", "Storing quantity on Item instead of Slot/Inventory.", "Ignoring refund on cancellation or failure."],
    code: `interface MachineState {
    void insertMoney(VendingMachine machine, Money money);
    void selectItem(VendingMachine machine, String slotCode);
    void dispense(VendingMachine machine);
}

class ReadyState implements MachineState {
    public void selectItem(VendingMachine machine, String slotCode) {
        throw new IllegalStateException("Insert money before selecting item");
    }
}`
  },
  {
    slug: "bookmyshow",
    title: "Design BookMyShow",
    difficulty: "Hard",
    category: "Booking Systems",
    systemType: "Online",
    tags: ["ShowSeat", "Seat Locking", "Payment", "Concurrency"],
    hasConcurrency: true,
    bestFor: "Correct seat modeling, temporary locks, booking lifecycle, and payment failure handling.",
    overview: "Model movie discovery, theatres, screens, physical seats, show-specific seats, booking, payment, and lock expiry.",
    actors: ["Customer", "Theatre Admin", "Payment Gateway", "Notification Service", "System"],
    entities: ["Movie", "Theatre", "Screen", "Seat", "Show", "ShowSeat", "Booking", "Payment", "User"],
    services: ["searchShows(movieId, city)", "lockSeats(showId, seatIds, userId)", "confirmBooking(bookingId, paymentId)", "releaseExpiredLocks()"],
    patterns: ["SeatLockingStrategy", "PricingStrategy", "Observer"],
    concurrency: ["Two users may lock or book the same ShowSeat.", "Payment success may arrive after lock expiry."],
    mistakes: ["Putting booking status on physical Seat.", "Confirming booking without re-checking seat locks.", "Not releasing locks after payment failure or timeout."],
    code: `class BookingService {
    public Booking lockSeats(String showId, List<String> showSeatIds, String userId) {
        return lockManager.withLocks(showSeatIds, () -> {
            List<ShowSeat> seats = showSeatRepository.findAll(showSeatIds);
            seats.forEach(seat -> seat.lockFor(userId));
            Booking booking = Booking.pending(userId, showId, showSeatIds);
            bookingRepository.save(booking);
            return booking;
        });
    }
}`
  },
  {
    slug: "splitwise",
    title: "Design Splitwise",
    difficulty: "Medium",
    category: "Marketplace / Apps",
    systemType: "Online",
    tags: ["Balances", "Transactions", "Simplification"],
    hasConcurrency: true,
    bestFor: "Expense modeling, ledger updates, settlement simplification, and transaction history.",
    overview: "Model groups, users, expenses, splits, balances, settlements, and simplified debt calculation.",
    actors: ["User", "Group Admin", "System"],
    entities: ["User", "Group", "Expense", "Split", "LedgerEntry", "BalanceSheet", "Settlement"],
    services: ["addExpense(groupId, paidBy, splits)", "getBalances(userId)", "simplifyGroupDebts(groupId)", "settle(fromUserId, toUserId, amount)"],
    patterns: ["SplitStrategy", "Ledger Repository"],
    concurrency: ["Two expenses may update the same pair balance.", "Settlement and new expense can race."],
    mistakes: ["Only storing net balances and losing expense history.", "Not validating split totals.", "Updating multiple balances without a transaction boundary."],
    code: `class ExpenseService {
    public Expense addExpense(String groupId, String paidBy, List<Split> splits) {
        splitStrategy.validate(splits);
        Expense expense = Expense.create(groupId, paidBy, splits);
        ledger.record(expense);
        balanceSheet.apply(expense);
        return expense;
    }
}`
  }
];

export const categories = Array.from(new Set(problems.map((problem) => problem.category)));

export function getProblem(slug) {
  return problems.find((problem) => problem.slug === slug);
}

export function searchContent(query) {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  return problems
    .filter((problem) => {
      const haystack = [
        problem.title,
        problem.category,
        problem.systemType,
        problem.difficulty,
        problem.bestFor,
        problem.overview,
        ...problem.tags,
        ...problem.patterns,
        ...problem.entities
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    })
    .map((problem) => ({
      title: problem.title,
      href: `/problems/${problem.slug}`,
      type: "Problem",
      excerpt: problem.bestFor
    }));
}
