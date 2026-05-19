"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Factory,
  FlaskConical,
  LockKeyhole,
  Network,
  Route,
  ScanLine,
  Split,
  XCircle
} from "lucide-react";

const signals = [
  { id: "variation", label: "behavior varies", short: "VAR", icon: Split },
  { id: "creation", label: "creation branches", short: "NEW", icon: Factory },
  { id: "lifecycle", label: "lifecycle states", short: "FSM", icon: Route },
  { id: "broadcast", label: "side effects fan out", short: "PUB", icon: BellRing },
  { id: "history", label: "actions need history", short: "CMD", icon: ClipboardList },
  { id: "race", label: "shared state race", short: "LOCK", icon: LockKeyhole }
];

const patterns = [
  {
    id: "strategy",
    name: "Strategy",
    family: "behavioral",
    signal: "variation",
    color: "text-emerald-300",
    glow: "shadow-[0_0_34px_rgba(16,185,129,0.22)]",
    move: "Extract a changing algorithm behind a stable interface.",
    smell: "The same service changes when pricing, matching, ranking, or win rules change.",
    useWhen: ["Pricing, routing, ranking, assignment, validation, or win logic varies.", "The caller can choose or configure the behavior."],
    avoidWhen: ["There is only one simple rule.", "The variation is lifecycle state, not an interchangeable algorithm."],
    interview: "I will isolate the algorithm that varies so the service remains stable while rules change.",
    examples: ["Parking fee calculation", "TicTacToe win rule", "Coupon discount policy", "Ride assignment scoring"],
    sketch: `interface FeeStrategy {
    Money calculate(Ticket ticket);
}

class ParkingService {
    private final FeeStrategy feeStrategy;

    Money exit(Ticket ticket) {
        return feeStrategy.calculate(ticket);
    }
}`
  },
  {
    id: "factory",
    name: "Factory",
    family: "creational",
    signal: "creation",
    color: "text-sky-300",
    glow: "shadow-[0_0_34px_rgba(14,165,233,0.2)]",
    move: "Move type-based object creation into a dedicated creator.",
    smell: "Callers repeatedly ask if type is CAR, BIKE, TRUCK, CARD, UPI, CASH, ADMIN, or CUSTOMER.",
    useWhen: ["Subtype creation depends on a type, config, request, or external input.", "Construction decisions are repeated across callers."],
    avoidWhen: ["Constructors are simple and called from one place.", "There are no meaningful subtypes."],
    interview: "I will keep construction decisions out of the business flow and centralize subtype creation.",
    examples: ["VehicleFactory", "ChessPieceFactory", "PaymentMethodFactory", "NotificationFactory"],
    sketch: `class VehicleFactory {
    Vehicle create(VehicleRequest request) {
        return switch (request.type()) {
            case CAR -> new Car(request.plate());
            case BIKE -> new Bike(request.plate());
            case TRUCK -> new Truck(request.plate());
        };
    }
}`
  },
  {
    id: "state",
    name: "State",
    family: "behavioral",
    signal: "lifecycle",
    color: "text-amber-300",
    glow: "shadow-[0_0_34px_rgba(245,158,11,0.2)]",
    move: "Move lifecycle-specific behavior into state objects.",
    smell: "Every method starts by asking what state the object is currently in.",
    useWhen: ["Many operations behave differently across states.", "Invalid method order must be explicit."],
    avoidWhen: ["Two statuses can be handled with simple guards.", "A transition table is clearer for regulated workflows."],
    interview: "I will model each lifecycle phase as behavior, not as repeated switch statements.",
    examples: ["Vending machine", "Order lifecycle", "Document approval", "Media player"],
    sketch: `interface BookingState {
    void pay(Booking booking);
    void cancel(Booking booking);
}

class PendingState implements BookingState {
    public void pay(Booking booking) {
        booking.markConfirmed();
    }
}`
  },
  {
    id: "observer",
    name: "Observer",
    family: "behavioral",
    signal: "broadcast",
    color: "text-cyan-300",
    glow: "shadow-[0_0_34px_rgba(6,182,212,0.2)]",
    move: "Publish events so independent subscribers can react.",
    smell: "A core flow sends email, audit logs, analytics, cache updates, and notifications in one method.",
    useWhen: ["Several independent systems react to one domain event.", "New listeners should not change the core flow."],
    avoidWhen: ["The caller only needs a direct return value.", "All side effects must roll back in one transaction."],
    interview: "I will emit a domain event and let independent observers handle notifications, audit, and analytics.",
    examples: ["Booking confirmed notification", "Game move observers", "Order shipped event", "Inventory low alert"],
    sketch: `booking.confirm();
eventBus.publish(new BookingConfirmed(booking.id()));

class EmailObserver {
    void on(BookingConfirmed event) {
        email.send(event.bookingId());
    }
}`
  },
  {
    id: "command",
    name: "Command",
    family: "behavioral",
    signal: "history",
    color: "text-indigo-300",
    glow: "shadow-[0_0_34px_rgba(129,140,248,0.22)]",
    move: "Turn an action into an object that can execute, undo, queue, retry, or audit.",
    smell: "User intent disappears after a method call, but the problem needs replay, undo, retries, or audit.",
    useWhen: ["Actions need undo, replay, retry, queueing, or audit trails.", "User intent must be stored as data."],
    avoidWhen: ["The action is a direct one-off method call.", "No history, queue, retry, or rollback is needed."],
    interview: "I will represent the operation itself as an object so it can be stored, replayed, or undone.",
    examples: ["TicTacToe move", "Text editor undo", "Payment retry job", "Elevator request"],
    sketch: `interface Command {
    void execute();
    void undo();
}

class MoveCommand implements Command {
    public void execute() { board.place(move); }
    public void undo() { board.remove(move); }
}`
  },
  {
    id: "locking",
    name: "Locking",
    family: "correctness",
    signal: "race",
    color: "text-rose-300",
    glow: "shadow-[0_0_34px_rgba(244,63,94,0.22)]",
    move: "Protect the check-then-update section with a clear consistency boundary.",
    smell: "Two users can both read available=true before either writes booked=true.",
    useWhen: ["Seats, inventory, balances, turns, or spots can be modified concurrently.", "A write API reads state and then mutates it."],
    avoidWhen: ["The system is single-threaded/offline.", "The database transaction already gives the exact required isolation."],
    interview: "I will make the check-and-update atomic so two requests cannot claim the same resource.",
    examples: ["BookMyShow seat lock", "Parking spot assignment", "Splitwise balance update", "Inventory decrement"],
    sketch: `return lockManager.withLock(showSeatId, () -> {
    ShowSeat seat = repository.get(showSeatId);
    if (!seat.isAvailable()) throw new SeatTaken();
    seat.holdFor(userId);
    repository.save(seat);
});`
  }
];

const scenarios = [
  {
    id: "parking",
    title: "Parking Lot Gate",
    subtitle: "Assign spot, create vehicle, calculate fee, avoid double assignment.",
    signals: ["variation", "creation", "race"],
    sketch: `Vehicle vehicle = vehicleFactory.create(request);
return lock.withSpotAssignment(() -> {
    Spot spot = assignmentStrategy.find(vehicle);
    spot.occupy(vehicle.id());
    return ticketRepository.open(vehicle, spot);
});`
  },
  {
    id: "bookmyshow",
    title: "BookMyShow Seat Hold",
    subtitle: "Seat lifecycle, pricing, payment, notifications, high concurrency.",
    signals: ["lifecycle", "variation", "broadcast", "race"],
    sketch: `return seatLock.withLocks(seatIds, () -> {
    Money amount = pricingStrategy.price(show, seats);
    Booking booking = Booking.pending(user, seats, amount);
    eventBus.publish(new SeatsHeld(booking.id()));
    return booking;
});`
  },
  {
    id: "tictactoe",
    title: "TicTacToe Engine",
    subtitle: "Winning rules, move history, observers, clean game loop.",
    signals: ["variation", "history", "broadcast"],
    sketch: `MoveCommand command = new MoveCommand(game, position);
commandInvoker.execute(command);
observers.notify(new MovePlayed(position));
return winStrategy.evaluate(game.board());`
  },
  {
    id: "vending",
    title: "Vending Machine",
    subtitle: "Button behavior changes across no coin, has coin, dispensing, empty.",
    signals: ["lifecycle", "creation"],
    sketch: `class HasCoinState implements MachineState {
    void selectItem(Machine machine, Slot slot) {
        machine.setState(machine.dispensingState());
        machine.dispense(slot);
    }
}`
  }
];

const misconceptions = [
  ["Do not start with a pattern name.", "Start with a design pressure. The pattern is the intervention after the pressure is proven."],
  ["Polymorphism is not the point.", "The point is moving a reason for change out of a class that should stay stable."],
  ["Observer is not a transaction tool.", "Use it for independent reactions. Keep transactional invariants in the core flow."],
  ["Factory is not for every constructor.", "Use it when creation decisions vary or repeat."],
  ["Locking is not decorative.", "It is a correctness boundary around check-then-update."]
];

const drills = [
  ["Payment retries", "Command for retry jobs; Observer for success events; State for booking/payment lifecycle."],
  ["AI TicTacToe", "Strategy for move selection; Factory if player creation depends on human/easy/hard AI type."],
  ["Surge parking fees", "Strategy for fee calculation; avoid pushing pricing into Ticket."],
  ["Double-booked seats", "Locking or transaction around availability check and update."],
  ["Document approval", "State for Draft, Review, Approved, Published, Archived; Observer for notifications."]
];

export function PatternLearningLab() {
  const [scenarioId, setScenarioId] = useState("bookmyshow");
  const [manualSignals, setManualSignals] = useState([]);
  const [selectedPatternId, setSelectedPatternId] = useState("locking");

  const scenario = scenarios.find((item) => item.id === scenarioId) || scenarios[0];
  const activeSignals = manualSignals.length > 0 ? manualSignals : scenario.signals;

  const rankedPatterns = useMemo(() => {
    return patterns
      .map((pattern) => ({
        ...pattern,
        score: activeSignals.includes(pattern.signal) ? 1 : 0
      }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  }, [activeSignals]);

  const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId) || rankedPatterns[0];

  function selectScenario(id) {
    const nextScenario = scenarios.find((item) => item.id === id) || scenarios[0];
    setScenarioId(nextScenario.id);
    setManualSignals([]);
    const firstPattern = patterns.find((pattern) => nextScenario.signals.includes(pattern.signal));
    if (firstPattern) setSelectedPatternId(firstPattern.id);
  }

  function toggleSignal(id) {
    setManualSignals((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <section className="border-b border-white/10">
        <div className="site-container">
          <div className="flex min-h-14 items-center justify-between gap-4 border-x border-white/10 px-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 bg-[#00ff66]" />
              <span className="font-mono text-sm font-bold tracking-wide">PATTERN.OS</span>
              <span className="hidden font-mono text-xs uppercase tracking-[0.28em] text-slate-500 sm:inline">LLD / design pressure lab</span>
            </div>
            <div className="hidden items-center gap-2 font-mono text-xs text-slate-500 md:flex">
              {["00 / scan", "01 / map", "02 / diagnose", "03 / drill"].map((item) => (
                <a key={item} href={`#${item.slice(5)}`} className="rounded border border-white/10 px-3 py-1.5 hover:border-[#00ff66] hover:text-[#00ff66]">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-container grid gap-8 py-12 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.34em] text-slate-500">
            pattern dossier / 006 / <span className="text-[#00ff66]">decision engine</span>
          </div>
          <h1 className="mt-6 max-w-5xl font-mono text-5xl font-black leading-[0.98] tracking-normal text-white md:text-7xl">
            Design patterns are not recipes.
            <span className="block text-[#00ff66]">They are pressure valves.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Select a system, scan its failure signals, and watch the right pattern light up. Learners see why a pattern exists before they memorize what it is called.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="input" value="problem smell" />
            <Metric label="engine" value="pressure map" />
            <Metric label="output" value="pattern move" />
          </div>
        </div>
        <PatternRadar activeSignals={activeSignals} selectedPattern={selectedPattern} />
      </section>

      <section id="scan" className="border-y border-white/10 bg-[#080b10]">
        <div className="site-container py-10">
          <SectionHeader kicker="00 / scan" title="Pick a system. The page becomes its diagnostic board." />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectScenario(item.id)}
                className={`min-h-[168px] border p-4 text-left transition ${scenarioId === item.id ? "border-[#00ff66] bg-[#00ff66] text-black" : "border-white/10 bg-white/[0.03] text-white hover:border-white/30"}`}
              >
                <div className="font-mono text-sm font-bold">{item.title}</div>
                <p className={`mt-3 text-sm leading-6 ${scenarioId === item.id ? "text-black/75" : "text-slate-400"}`}>{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="map" className="site-container py-10">
        <SectionHeader kicker="01 / map" title="Toggle the symptoms. Patterns respond like instruments." />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {signals.map((signal) => {
                const Icon = signal.icon;
                const active = activeSignals.includes(signal.id);
                return (
                  <button
                    key={signal.id}
                    type="button"
                    onClick={() => toggleSignal(signal.id)}
                    className={`min-h-[118px] border p-4 text-left transition ${active ? "border-[#00ff66] bg-[#00ff66] text-black" : "border-white/10 bg-white/[0.03] text-white hover:border-white/30"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Icon size={20} aria-hidden="true" />
                      <span className="font-mono text-xs">{signal.short}</span>
                    </div>
                    <div className="mt-5 font-mono text-sm font-bold">{signal.label}</div>
                    <div className={`mt-1 text-xs ${active ? "text-black/70" : "text-slate-500"}`}>{active ? "signal detected" : "click to activate"}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 overflow-hidden border border-white/10 bg-[#0b0f16]">
              <div className="border-b border-white/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-slate-500">scenario sketch</div>
              <pre className="overflow-auto p-4 text-sm leading-6 text-slate-200">
                <code>{scenario.sketch}</code>
              </pre>
            </div>
          </div>

          <div className="border border-white/10 bg-[#0b0f16]">
            <div className="border-b border-white/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-slate-500">ranked interventions</div>
            <div>
              {rankedPatterns.map((pattern, index) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => setSelectedPatternId(pattern.id)}
                  className={`flex w-full items-center justify-between gap-3 border-b border-white/10 px-4 py-4 text-left last:border-b-0 ${selectedPatternId === pattern.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`h-3 w-3 ${pattern.score ? "bg-[#00ff66]" : "bg-slate-700"}`} />
                    <div>
                      <div className="font-mono text-sm font-bold text-white">{pattern.name}</div>
                      <div className="text-xs text-slate-500">{pattern.score ? "matches active pressure" : "secondary option"}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="diagnose" className="border-y border-white/10 bg-[#080b10]">
        <div className="site-container py-10">
          <SectionHeader kicker="02 / diagnose" title="Open the selected pattern like a field dossier." />
          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <PatternDossier pattern={selectedPattern} />
            <div className="grid gap-6">
              <div className="border border-white/10 bg-[#0b0f16]">
                <div className="border-b border-white/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-slate-500">implementation sketch</div>
                <pre className="overflow-auto p-4 text-sm leading-6 text-slate-200">
                  <code>{selectedPattern.sketch}</code>
                </pre>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Checklist title="Use when" icon={CheckCircle2} items={selectedPattern.useWhen} good />
                <Checklist title="Avoid when" icon={XCircle} items={selectedPattern.avoidWhen} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="drill" className="site-container py-10">
        <SectionHeader kicker="03 / drill" title="Break the misconceptions. Then solve drills." />
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="grid gap-3">
            {misconceptions.map(([title, body]) => (
              <div key={title} className="border border-white/10 bg-white/[0.03] p-4">
                <div className="font-mono text-sm font-bold text-red-300">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            {drills.map(([problem, expected], index) => (
              <div key={problem} className="border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center border border-[#00ff66] font-mono text-xs text-[#00ff66]">{index + 1}</span>
                  <div>
                    <div className="font-mono text-sm font-bold text-white">{problem}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{expected}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PatternRadar({ activeSignals, selectedPattern }) {
  return (
    <div className={`border border-white/10 bg-[#0b0f16] p-4 ${selectedPattern.glow}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">pattern_map.svg</div>
        <div className="font-mono text-xs text-[#00ff66]">rendering @ 60fps</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {patterns.map((pattern) => {
          const active = activeSignals.includes(pattern.signal);
          return (
            <div key={pattern.id} className={`min-h-[100px] border p-3 ${active ? "border-[#00ff66] bg-[#00ff66] text-black" : "border-white/10 bg-white/[0.03] text-white"}`}>
              <div className="font-mono text-sm font-bold">{pattern.name}</div>
              <div className={`mt-2 text-xs ${active ? "text-black/70" : "text-slate-500"}`}>{pattern.signal}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 border border-white/10 bg-white/[0.03] p-4">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">active intervention</div>
        <div className={`mt-2 font-mono text-2xl font-black ${selectedPattern.color}`}>{selectedPattern.name}</div>
      </div>
    </div>
  );
}

function PatternDossier({ pattern }) {
  return (
    <div className="border border-white/10 bg-[#0b0f16] p-5">
      <div className="flex items-center gap-3">
        <span className={`h-4 w-4 ${pattern.accent}`} />
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">{pattern.family}</div>
          <h2 className={`font-mono text-4xl font-black ${pattern.color}`}>{pattern.name}</h2>
        </div>
      </div>
      <div className="mt-5 border-y border-white/10 py-4">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">smell</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{pattern.smell}</p>
      </div>
      <div className="border-b border-white/10 py-4">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">move</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{pattern.move}</p>
      </div>
      <div className="py-4">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">interview line</div>
        <p className="mt-2 border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-white">{pattern.interview}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {pattern.examples.map((example) => (
          <span key={example} className="border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-xs text-slate-300">{example}</span>
        ))}
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items, good = false }) {
  return (
    <div className="border border-white/10 bg-[#0b0f16] p-4">
      <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
        <Icon size={16} className={good ? "text-[#00ff66]" : "text-red-300"} aria-hidden="true" />
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-slate-300">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-4">
      <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 font-mono text-lg font-black text-white">{value}</div>
    </div>
  );
}

function SectionHeader({ kicker, title }) {
  return (
    <div className="mb-5">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">{kicker}</div>
      <h2 className="mt-3 font-mono text-3xl font-black tracking-normal text-white md:text-4xl">{title}</h2>
    </div>
  );
}
