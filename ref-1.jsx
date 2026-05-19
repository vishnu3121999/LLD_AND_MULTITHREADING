import { useState } from "react";

const sections = [
  {
    id: "how-to-use",
    label: "Overview",
    icon: "◎",
    title: "How to use this playbook",
    color: "#7F77DD",
    bg: "#EEEDFE",
    content: null,
    steps: [
      { num: "01", title: "Clarify requirements", desc: "Nail scope before touching a class." },
      { num: "02", title: "Identify actors & use cases", desc: "Who does what in the system." },
      { num: "03", title: "Identify core entities", desc: "Infrastructure, users, transactions." },
      { num: "04", title: "Decide system boundary", desc: "Offline / local vs. server-side API." },
      { num: "05", title: "Draw the class diagram", desc: "Relationships, fields, hierarchies." },
      { num: "06", title: "Define service / facade APIs", desc: "Use-case-level methods." },
      { num: "07", title: "Walk through key flows", desc: "Happy path + edge cases." },
      { num: "08", title: "Add extensibility points", desc: "Strategy, Factory, Observer." },
      { num: "09", title: "Handle exceptions & concurrency", desc: "Races, partial updates, locks." },
      { num: "10", title: "Write the critical code", desc: "Service method + core entity." },
    ],
    quote: "I will first clarify functional requirements and assumptions, then model the core entities, then expose the main operations through a service/facade layer, and finally discuss extensibility, concurrency, and edge cases.",
  },
  {
    id: "requirements",
    label: "Requirements",
    icon: "≡",
    title: "Requirements",
    color: "#1D9E75",
    bg: "#E1F5EE",
    subsections: [
      {
        title: "A. Physical / Structural",
        desc: "The real-world shape of the system — what contains what.",
        examples: [
          { name: "Parking Lot", items: ["Lot → Floors → Spots", "Spot types: bike, compact, large, EV, handicapped", "Vehicle has type + registration number", "Ticket on entry; Payment on exit"] },
          { name: "Chess", items: ["Game → Board (64 cells)", "Cell → optional Piece", "Two players, current turn, game status, move history"] },
          { name: "Vending Machine", items: ["Machine → Inventory slots (item type + quantity)", "Accept money → select item → dispense + change"] },
        ],
        questions: ["What are the main real-world objects?", "What contains what?", "Is the relationship 1-1, 1-N, or N-N?", "Can a child exist independently of the parent?", "Will the child be queried independently?"],
      },
      {
        title: "B. Action-Based",
        desc: "What each actor can do — find actions first, then group into flows.",
        examples: [
          {
            name: "Parking Lot",
            actors: [
              { name: "User", actions: ["Enter lot", "Get ticket", "Park vehicle", "Pay fee", "Exit"] },
              { name: "Admin", actions: ["Add floor", "Add spot", "Configure pricing", "Mark spot unavailable"] },
              { name: "System", actions: ["Assign nearest spot", "Calculate fee", "Update spot status", "Generate ticket"] },
            ],
          },
          {
            name: "BookMyShow",
            actors: [
              { name: "User", actions: ["Search movies", "View shows", "Select & book seats", "Pay", "Cancel booking"] },
              { name: "Admin", actions: ["Add movie / theatre / screen / show", "Configure seat pricing"] },
              { name: "System", actions: ["Lock seats temporarily", "Confirm after payment", "Release on timeout / failure"] },
            ],
          },
        ],
        questions: ["Who performs this action?", "What input is required?", "What output is returned?", "Which entities are read / modified?", "What can go wrong?"],
      },
    ],
  },
  {
    id: "system-mode",
    label: "System Mode",
    icon: "⟳",
    title: "Offline vs. Online",
    color: "#D85A30",
    bg: "#FAECE7",
    modes: [
      {
        name: "Offline",
        examples: ["TicTacToe CLI", "Chess local game", "Snake & Ladder", "Splitwise machine coding"],
        characteristics: ["No API controller needed", "No external database", "Parallelism is 1 unless stated", "main() acts as UI/client", "Objects held directly in memory"],
        code: `public class Main {
  public static void main(String[] args) {
    Game game = new Game(player1, player2,
                         new Board(3));
    GameService svc = new GameService(game);
    while (!game.isOver()) {
      // read input → call service → print board
    }
  }
}`,
      },
      {
        name: "Online",
        examples: ["Parking lot API", "BookMyShow", "Uber", "Food delivery"],
        characteristics: ["Controllers expose APIs", "Services contain business logic", "Repositories store state", "Thread-safety & consistency matter", "IDs required for core entities"],
        layers: ["Client / UI", "Controller / API Layer", "Service / Facade Layer", "Repository / Datastore Layer", "Database / In-memory Store"],
      },
    ],
    matrix: [
      ["Offline + In-memory", "TicTacToe CLI"],
      ["Offline + Persistent", "Desktop expense tracker"],
      ["Online + In-memory", "Parking lot service (interview)"],
      ["Online + Persistent", "BookMyShow with DB"],
    ],
    tip: "In LLD interviews, start with online + in-memory — clean APIs without DB complexity.",
  },
  {
    id: "entities",
    label: "Entities",
    icon: "◻",
    title: "Designing Core Entities",
    color: "#378ADD",
    bg: "#E6F1FB",
    categories: [
      { name: "Infrastructure / Physical", icon: "🏗", desc: "Compose the system.", examples: ["ParkingLot, Floor, Spot", "Theatre, Screen, Seat", "Board, Cell", "VendingMachine, Slot"] },
      { name: "User Entities", icon: "👤", desc: "People or system users.", examples: ["User, Admin, Player", "Driver, Rider", "(Optional in simple offline problems)"] },
      { name: "Transaction / Connector", icon: "🔗", desc: "Connect users ↔ infrastructure. Often the most important.", examples: ["Ticket, Booking, Move", "RideRequest, Payment, Order"] },
    ],
    rules: [
      { rule: "Object ref vs ID", detail: "Object ref for strong composition / offline. ID for independently queried / stored entities." },
      { rule: "Avoid raw setters", detail: "Prefer spot.occupy(vehicleId) over spot.setAvailable(false). State transitions stay validated inside the entity." },
      { rule: "Methods belong to entity when…", detail: "They act on the entity's own fields and protect its invariants — not high-level business logic across many entities." },
      { rule: "Fields belong to entity when…", detail: "They represent the entity's own state. Strategies and gateways belong in the Service." },
    ],
    checklist: ["Does it have identity?", "Does it have state?", "Does it have behavior?", "Is it queried independently?", "Is it stored separately?", "Does it have a lifecycle / status?", "Does it need history?"],
  },
  {
    id: "layering",
    label: "Layering",
    icon: "≡≡",
    title: "Layer Responsibilities",
    color: "#639922",
    bg: "#EAF3DE",
    layers: [
      {
        name: "Controller / API Layer",
        icon: "→",
        color: "#97C459",
        does: ["Receive API request", "Validate basic request format", "Convert DTO → domain input", "Call service", "Map exceptions → HTTP responses"],
        notDoes: ["Business logic", "Complex state transitions", "Pricing / assignment algorithms"],
      },
      {
        name: "Service / Facade Layer",
        icon: "⚙",
        color: "#639922",
        does: ["Expose use-case-level methods", "Orchestrate multiple entities", "Fetch / update from datastore", "Apply business rules", "Call strategies / factories", "Publish events"],
        notDoes: ["HTTP concerns", "Raw SQL queries"],
      },
      {
        name: "Core Entities / Models",
        icon: "◻",
        color: "#3B6D11",
        does: ["Hold domain state", "Encapsulate simple operations on own fields", "Maintain entity invariants"],
        notDoes: ["Depend on controllers or databases", "Implement business orchestration"],
      },
      {
        name: "Strategies / Policies",
        icon: "⇌",
        color: "#27500A",
        does: ["Encapsulate algorithms that vary", "Avoid large if-else / switch blocks", "Make behavior extensible"],
        examples: ["FeeCalculationStrategy", "SpotAssignmentStrategy", "WinningStrategy", "DriverMatchingStrategy"],
      },
      {
        name: "Datastore / Repository",
        icon: "▤",
        color: "#173404",
        does: ["Store and retrieve entities", "Hide in-memory vs DB details", "Provide lookup methods"],
        note: "For interviews: one InMemoryDataStore with maps is usually enough.",
      },
    ],
    serviceTemplate: [
      "Fetch all required entities",
      "Validate inputs and entity existence",
      "Validate current state",
      "Execute business logic",
      "Update all affected entities",
      "Persist changes",
      "Publish events (if required)",
      "Return response",
    ],
  },
  {
    id: "extensibility",
    label: "Extensibility",
    icon: "⊕",
    title: "Extensibility Design",
    color: "#BA7517",
    bg: "#FAEEDA",
    rules: [
      { label: "Core entity with common state", pattern: "abstract class", example: "Vehicle → Car, Bike, Truck" },
      { label: "Pure behavior variation", pattern: "interface", example: "FeeStrategy, PaymentStrategy" },
      { label: "Fixed values with no behavior", pattern: "enum", example: "VehicleType, BookingStatus" },
    ],
    strategies: [
      { context: "Fee calculation", examples: ["HourlyFeeStrategy", "DailyFeeStrategy", "WeekendFeeStrategy"] },
      { context: "Spot assignment", examples: ["NearestSpotStrategy", "CheapestSpotStrategy", "RandomSpotStrategy"] },
      { context: "Driver matching", examples: ["NearestDriverStrategy", "HighestRatedStrategy"] },
      { context: "Winner checking", examples: ["RowColDiagWinStrategy", "ConnectKStrategy"] },
    ],
    patterns: [
      { need: "Create subtype based on type", pattern: "Factory" },
      { need: "Many optional constructor params", pattern: "Builder" },
      { need: "One shared config-like instance", pattern: "Singleton" },
      { need: "Vary algorithm independently", pattern: "Strategy" },
      { need: "Notify multiple subscribers", pattern: "Observer" },
      { need: "State-specific behavior", pattern: "State" },
      { need: "Undo / replay operations", pattern: "Command / Memento" },
    ],
  },
  {
    id: "concurrency",
    label: "Concurrency",
    icon: "⇉",
    title: "Concurrency & Thread Safety",
    color: "#A32D2D",
    bg: "#FCEBEB",
    examples: [
      { system: "BookMyShow", risk: "Two users book the same seat simultaneously" },
      { system: "Uber", risk: "Two drivers accept the same ride request" },
      { system: "Parking Lot", risk: "Two vehicles assigned the same spot" },
      { system: "Vending Machine", risk: "Two users buy the last item" },
    ],
    approaches: [
      { title: "Synchronized method (simplest)", code: "public synchronized Ticket parkVehicle(Vehicle v) { ... }", pros: "Simple, good for interviews", cons: "Low throughput, blocks unrelated operations" },
      { title: "Lock at entity level", code: `synchronized (rideRequest) {
  if (rideRequest.getStatus() != REQUESTED)
    throw new IllegalStateException("Already accepted");
  rideRequest.accept(driverId);
}`, pros: "Fine-grained, better throughput", cons: "Must acquire locks in consistent order to avoid deadlocks" },
      { title: "Atomic map operations", code: `tickets.putIfAbsent(ticketId, ticket);
// NOT: if (!tickets.containsKey(id)) { tickets.put(id, t); }`, pros: "Lock-free for simple cases", cons: "Only makes individual map ops safe — not multi-step business logic" },
    ],
    doubleCheck: {
      bad: `if (seat.isAvailable()) {
  synchronized (seat) {
    seat.book(userId); // stale read!
  }
}`,
      good: `if (seat.isAvailable()) {
  synchronized (seat) {
    if (!seat.isAvailable()) // re-check!
      throw new SeatAlreadyBookedException();
    seat.book(userId);
  }
}`,
    },
  },
  {
    id: "exceptions",
    label: "Exceptions",
    icon: "⚠",
    title: "Exception Handling",
    color: "#993556",
    bg: "#FBEAF0",
    types: [
      { type: "IllegalStateException", when: "Operation invalid due to current state", examples: ["Dispense before payment (vending machine)", "Move after game is over", "Exit parking without payment"] },
      { type: "IllegalArgumentException", when: "Method arguments are invalid", examples: ["Negative amount", "Invalid board position", "Seat count < 1"] },
      { type: "NotFoundException", when: "Expected entity is missing", examples: ["User not found", "Ticket not found", "Booking not found"] },
      { type: "Custom Domain Exceptions", when: "Business errors meaningful to the caller", examples: ["ParkingFullException", "SeatAlreadyBookedException", "InsufficientBalanceException", "InvalidMoveException"] },
    ],
    rule: "Throw inside domain/service. Catch at boundary (Controller in server-side; main() in CLI; test case in unit testing).",
    antipattern: {
      bad: ["Mark spot occupied", "Try to create ticket", "Ticket creation fails →", "Spot remains occupied without ticket ❌"],
      good: ["Fetch all required entities", "Validate ALL preconditions", "Perform updates together", "Persist changes together ✓"],
    },
  },
  {
    id: "checklist",
    label: "Checklist",
    icon: "✓",
    title: "Final LLD Checklist",
    color: "#534AB7",
    bg: "#EEEDFE",
    groups: [
      {
        name: "Requirements",
        items: ["Clarified offline vs. online?", "Identified actors?", "Listed core use cases?", "Asked about concurrency?", "Asked about history / undo?", "Asked about notifications?"],
      },
      {
        name: "Entities",
        items: ["Identified infrastructure entities?", "Identified user entities?", "Identified transaction entities?", "Defined fields and relationships?", "Decided object ref vs. ID ref?", "Avoided unnecessary getters/setters?"],
      },
      {
        name: "Services",
        items: ["Exposed use-case-level methods?", "Kept controller / main thin?", "Avoided too much logic in entities?", "Avoided anemic entities with only setters?"],
      },
      {
        name: "Extensibility",
        items: ["Used abstract class for entities with shared state?", "Used interface for strategies?", "Used enum for fixed simple types?", "Avoided unnecessary patterns?"],
      },
      {
        name: "Exceptions",
        items: ["Validated inputs?", "Validated state transitions?", "Handled not-found cases?", "Avoided partial updates?"],
      },
      {
        name: "Concurrency",
        items: ["Identified check-and-update operations?", "Protected shared mutable state?", "Avoided assuming ConcurrentHashMap solves all races?", "Used simple synchronization where sufficient?"],
      },
    ],
  },
];

const quotes = {
  "how-to-use": "I will first clarify functional requirements and assumptions, then model the core entities, then expose the main operations through a service/facade layer, and finally discuss extensibility, concurrency, and edge cases.",
  "system-mode": "I will design the core logic independent of the UI. For an offline version, the main method can simulate user input through a loop. If later converted to an online API, the same service layer can be reused behind controllers.",
  "entities": "For a pure in-memory version I can keep object references, but for DB-friendly design I will store IDs between aggregate roots.",
  "extensibility": "Wherever the entity itself has different state and behavior, I will model it using inheritance. Wherever only an algorithm varies, I will use Strategy.",
  "concurrency": "For simplicity, I can synchronize the write methods at the service level. For better scalability, I would lock only the affected entity or use atomic datastore operations.",
  "exceptions": "The service will throw domain exceptions, and the controller/main layer will catch them and convert them into user-friendly responses.",
  "checklist": "I will keep the initial design simple and introduce patterns only where they solve a clear extensibility or maintainability problem.",
};

function CodeBlock({ code }) {
  return (
    <pre style={{
      background: "rgba(0,0,0,0.04)",
      border: "0.5px solid rgba(0,0,0,0.1)",
      borderRadius: 8,
      padding: "12px 16px",
      fontSize: 12,
      lineHeight: 1.6,
      fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
      overflowX: "auto",
      margin: 0,
      color: "inherit",
    }}>
      <code>{code}</code>
    </pre>
  );
}

function Pill({ children, color, bg }) {
  return (
    <span style={{
      display: "inline-block",
      background: bg,
      color: color,
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 10px",
      borderRadius: 20,
      letterSpacing: "0.04em",
    }}>
      {children}
    </span>
  );
}

function QuoteBar({ text }) {
  return (
    <div style={{
      background: "rgba(127,119,221,0.07)",
      border: "0.5px solid rgba(127,119,221,0.25)",
      borderLeft: "3px solid #7F77DD",
      borderRadius: "0 8px 8px 0",
      padding: "12px 16px",
      fontSize: 13,
      fontStyle: "italic",
      color: "#534AB7",
      lineHeight: 1.6,
      marginTop: 20,
    }}>
      "{text}"
    </div>
  );
}

function ChecklistItem({ label, checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 0",
        cursor: "pointer",
        borderBottom: "0.5px solid rgba(0,0,0,0.05)",
        opacity: checked ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div style={{
        width: 18,
        height: 18,
        border: checked ? "none" : "1.5px solid rgba(0,0,0,0.2)",
        borderRadius: 5,
        background: checked ? "#534AB7" : "transparent",
        flexShrink: 0,
        marginTop: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, lineHeight: 1.5, textDecoration: checked ? "line-through" : "none", color: checked ? "rgba(0,0,0,0.4)" : "inherit" }}>
        {label}
      </span>
    </div>
  );
}

function SectionOverview() {
  const s = sections[0];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.7, marginBottom: 16 }}>
          Don't start with classes. Understand the problem first — clarify requirements, identify entities, design APIs, then write code.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {s.steps.map((step) => (
            <div key={step.num} style={{
              display: "flex",
              gap: 12,
              padding: "12px 14px",
              background: "rgba(127,119,221,0.05)",
              border: "0.5px solid rgba(127,119,221,0.15)",
              borderRadius: 10,
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7F77DD", minWidth: 22, paddingTop: 1 }}>{step.num}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <QuoteBar text={s.quote} />
    </div>
  );
}

function SectionRequirements() {
  const s = sections[1];
  const [open, setOpen] = useState(0);
  return (
    <div>
      <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", marginBottom: 20, lineHeight: 1.7 }}>
        Most bad designs happen because the candidate starts coding before fixing scope. Split requirements into two buckets:
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {s.subsections.map((sub, i) => (
          <button
            key={i}
            onClick={() => setOpen(i)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "0.5px solid",
              borderColor: open === i ? "#1D9E75" : "rgba(0,0,0,0.15)",
              background: open === i ? "#E1F5EE" : "transparent",
              color: open === i ? "#0F6E56" : "rgba(0,0,0,0.6)",
              fontSize: 13,
              fontWeight: open === i ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {sub.title}
          </button>
        ))}
      </div>
      {s.subsections[open] && (() => {
        const sub = s.subsections[open];
        return (
          <div>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", marginBottom: 16 }}>{sub.desc}</p>
            {sub.examples && !sub.examples[0]?.actors && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {sub.examples.map((ex) => (
                  <div key={ex.name} style={{ padding: "14px 16px", border: "0.5px solid rgba(29,158,117,0.2)", borderRadius: 10, background: "rgba(29,158,117,0.04)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ex.name}</div>
                    {ex.items.map((item, i) => (
                      <div key={i} style={{ fontSize: 12, color: "rgba(0,0,0,0.65)", lineHeight: 1.5, marginBottom: 4, paddingLeft: 10, borderLeft: "2px solid rgba(29,158,117,0.3)" }}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {sub.examples && sub.examples[0]?.actors && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
                {sub.examples.map((ex) => (
                  <div key={ex.name}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ex.name}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {ex.actors.map((actor) => (
                        <div key={actor.name} style={{ padding: "12px 14px", border: "0.5px solid rgba(29,158,117,0.2)", borderRadius: 10, background: "rgba(29,158,117,0.04)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#0F6E56", marginBottom: 8 }}>{actor.name}</div>
                          {actor.actions.map((a, i) => (
                            <div key={i} style={{ fontSize: 12, color: "rgba(0,0,0,0.65)", marginBottom: 3 }}>· {a}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Key clarifying questions</div>
              {sub.questions.map((q, i) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(0,0,0,0.65)", marginBottom: 5 }}>→ {q}</div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function SectionSystemMode() {
  const s = sections[2];
  const [mode, setMode] = useState(0);
  return (
    <div>
      <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", marginBottom: 20, lineHeight: 1.7 }}>
        One of the most important early clarifications — it changes the entire structure of your design.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {s.modes.map((m, i) => (
          <button key={i} onClick={() => setMode(i)} style={{
            padding: "8px 20px", borderRadius: 20, border: "0.5px solid",
            borderColor: mode === i ? "#D85A30" : "rgba(0,0,0,0.15)",
            background: mode === i ? "#FAECE7" : "transparent",
            color: mode === i ? "#993C1D" : "rgba(0,0,0,0.6)",
            fontSize: 13, fontWeight: mode === i ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
          }}>
            {m.name}
          </button>
        ))}
      </div>
      {(() => {
        const m = s.modes[mode];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Examples</div>
              {m.examples.map((e, i) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(0,0,0,0.7)", marginBottom: 6 }}>· {e}</div>
              ))}
              <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Characteristics</div>
              {m.characteristics.map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(0,0,0,0.7)", marginBottom: 6 }}>· {c}</div>
              ))}
              {m.layers && (
                <>
                  <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Typical layers</div>
                  {m.layers.map((l, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#993C1D", padding: "6px 12px", background: `rgba(216,90,48,${0.08 + i * 0.03})`, borderRadius: 6, marginBottom: 4 }}>{l}</div>
                  ))}
                </>
              )}
            </div>
            {m.code && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Example structure</div>
                <CodeBlock code={m.code} />
              </div>
            )}
          </div>
        );
      })()}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Offline vs. Online × In-memory vs. Persistent</div>
        <div style={{ border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(0,0,0,0.04)", padding: "8px 16px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>COMBINATION</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>EXAMPLE</span>
          </div>
          {s.matrix.map(([combo, ex], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "10px 16px", borderTop: "0.5px solid rgba(0,0,0,0.06)", background: i === 2 ? "rgba(216,90,48,0.06)" : "transparent" }}>
              <span style={{ fontSize: 13, fontWeight: i === 2 ? 600 : 400 }}>{combo}</span>
              <span style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>{ex}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#993C1D", fontStyle: "italic" }}>↑ {s.tip}</div>
      </div>
      <QuoteBar text={quotes["system-mode"]} />
    </div>
  );
}

function SectionEntities() {
  const s = sections[3];
  const [tab, setTab] = useState("categories");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {[["categories", "Entity Types"], ["rules", "Design Rules"], ["checklist", "Is It an Entity?"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "7px 16px", borderRadius: 20, border: "0.5px solid",
            borderColor: tab === k ? "#378ADD" : "rgba(0,0,0,0.15)",
            background: tab === k ? "#E6F1FB" : "transparent",
            color: tab === k ? "#185FA5" : "rgba(0,0,0,0.6)",
            fontSize: 13, fontWeight: tab === k ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
          }}>
            {label}
          </button>
        ))}
      </div>
      {tab === "categories" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {s.categories.map((cat) => (
            <div key={cat.name} style={{ padding: "16px", border: "0.5px solid rgba(55,138,221,0.2)", borderRadius: 12, background: "rgba(55,138,221,0.04)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#185FA5" }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginBottom: 12, lineHeight: 1.5 }}>{cat.desc}</div>
              {cat.examples.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: "rgba(0,0,0,0.65)", marginBottom: 4, paddingLeft: 10, borderLeft: "2px solid rgba(55,138,221,0.3)" }}>{e}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {tab === "rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {s.rules.map((r) => (
            <div key={r.rule} style={{ padding: "14px 16px", border: "0.5px solid rgba(55,138,221,0.15)", borderRadius: 10, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ minWidth: 170, fontSize: 13, fontWeight: 600, color: "#185FA5" }}>{r.rule}</div>
              <div style={{ fontSize: 13, color: "rgba(0,0,0,0.65)", lineHeight: 1.6 }}>{r.detail}</div>
            </div>
          ))}
          <QuoteBar text={quotes["entities"]} />
        </div>
      )}
      {tab === "checklist" && (
        <div>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", marginBottom: 16, lineHeight: 1.7 }}>
            For every candidate entity, ask these questions. If yes to most → it's a core entity.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {s.checklist.map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", border: "0.5px solid rgba(55,138,221,0.15)", borderRadius: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#378ADD", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(0,0,0,0.75)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLayering() {
  const s = sections[4];
  const [active, setActive] = useState(0);
  const layer = s.layers[active];
  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 10, overflow: "hidden" }}>
        {s.layers.map((l, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            flex: 1, padding: "10px 6px", border: "none",
            borderRight: i < s.layers.length - 1 ? "0.5px solid rgba(0,0,0,0.12)" : "none",
            background: active === i ? "#EAF3DE" : "transparent",
            color: active === i ? "#3B6D11" : "rgba(0,0,0,0.5)",
            fontSize: 11, fontWeight: active === i ? 700 : 400, cursor: "pointer",
            textAlign: "center", transition: "all 0.15s", lineHeight: 1.4,
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{l.icon}</div>
            {l.name.split(" / ")[0]}
          </button>
        ))}
      </div>
      <div style={{ padding: "16px 20px", border: "0.5px solid rgba(99,153,34,0.2)", borderRadius: 12, background: "rgba(99,153,34,0.04)", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#3B6D11", marginBottom: 12 }}>{layer.name}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Responsibilities</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: layer.notDoes ? 16 : 0 }}>
          {layer.does.map((d, i) => (
            <div key={i} style={{ fontSize: 13, color: "rgba(0,0,0,0.7)", display: "flex", gap: 6 }}><span style={{ color: "#639922" }}>✓</span>{d}</div>
          ))}
        </div>
        {layer.notDoes && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Should NOT contain</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {layer.notDoes.map((d, i) => (
                <span key={i} style={{ fontSize: 12, color: "#A32D2D", background: "rgba(163,45,45,0.07)", padding: "3px 10px", borderRadius: 20 }}>✗ {d}</span>
              ))}
            </div>
          </>
        )}
        {layer.examples && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 16 }}>Examples</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {layer.examples.map((e, i) => (
                <Pill key={i} color="#3B6D11" bg="#EAF3DE">{e}</Pill>
              ))}
            </div>
          </>
        )}
        {layer.note && (
          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(0,0,0,0.5)", fontStyle: "italic" }}>{layer.note}</div>
        )}
      </div>
      <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Service method template (apply to every use-case method)</div>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          {s.serviceTemplate.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.7)", background: "white", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 6, padding: "5px 10px", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#639922", marginRight: 5 }}>{i + 1}</span>{step}
              </div>
              {i < s.serviceTemplate.length - 1 && <span style={{ color: "rgba(0,0,0,0.3)", fontSize: 12, margin: "0 4px" }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionExtensibility() {
  const s = sections[5];
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Simple rule</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {s.rules.map((r) => (
            <div key={r.label} style={{ padding: "14px 16px", border: "0.5px solid rgba(186,117,23,0.2)", borderRadius: 10, background: "rgba(186,117,23,0.04)", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginBottom: 8 }}>{r.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#854F0B", marginBottom: 8 }}>{r.pattern}</div>
              <div style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", fontStyle: "italic" }}>{r.example}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Common strategy examples</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {s.strategies.map((strat) => (
            <div key={strat.context} style={{ padding: "12px 14px", border: "0.5px solid rgba(186,117,23,0.15)", borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#854F0B", marginBottom: 8 }}>{strat.context}</div>
              {strat.examples.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", fontFamily: "ui-monospace, monospace", marginBottom: 3 }}>· {e}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pattern quick-reference</div>
        <div style={{ border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", background: "rgba(0,0,0,0.04)", padding: "8px 16px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>WHEN YOU NEED TO…</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>USE</span>
          </div>
          {s.patterns.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px", padding: "10px 16px", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 13, color: "rgba(0,0,0,0.7)" }}>{p.need}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#854F0B" }}>{p.pattern}</span>
            </div>
          ))}
        </div>
      </div>
      <QuoteBar text={quotes["extensibility"]} />
    </div>
  );
}

function SectionConcurrency() {
  const s = sections[6];
  const [tab, setTab] = useState("risks");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["risks", "Race Conditions"], ["approaches", "Protection Approaches"], ["double-check", "Double-Check Pattern"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "7px 16px", borderRadius: 20, border: "0.5px solid",
            borderColor: tab === k ? "#A32D2D" : "rgba(0,0,0,0.15)",
            background: tab === k ? "#FCEBEB" : "transparent",
            color: tab === k ? "#791F1F" : "rgba(0,0,0,0.6)",
            fontSize: 13, fontWeight: tab === k ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
          }}>
            {label}
          </button>
        ))}
      </div>
      {tab === "risks" && (
        <div>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", marginBottom: 16, lineHeight: 1.7 }}>
            Race conditions happen in <strong>check-then-update</strong> operations — two threads both pass the check using stale state.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {s.examples.map((ex) => (
              <div key={ex.system} style={{ padding: "14px 16px", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: 10, background: "rgba(163,45,45,0.04)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#791F1F", marginBottom: 6 }}>{ex.system}</div>
                <div style={{ fontSize: 13, color: "rgba(0,0,0,0.65)" }}>{ex.risk}</div>
              </div>
            ))}
          </div>
          <QuoteBar text={quotes["concurrency"]} />
        </div>
      )}
      {tab === "approaches" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {s.approaches.map((a) => (
            <div key={a.title} style={{ border: "0.5px solid rgba(163,45,45,0.15)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", background: "rgba(163,45,45,0.05)", borderBottom: "0.5px solid rgba(163,45,45,0.1)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#791F1F" }}>{a.title}</span>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <CodeBlock code={a.code} />
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <div><span style={{ fontSize: 11, fontWeight: 700, color: "#639922" }}>✓ </span><span style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>{a.pros}</span></div>
                  <div><span style={{ fontSize: 11, fontWeight: 700, color: "#A32D2D" }}>✗ </span><span style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>{a.cons}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "double-check" && (
        <div>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", marginBottom: 16, lineHeight: 1.7 }}>
            If you check before acquiring the lock, always re-check after acquiring it.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#A32D2D", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>❌ Unsafe</div>
              <CodeBlock code={s.doubleCheck.bad} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#639922", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>✓ Safe</div>
              <CodeBlock code={s.doubleCheck.good} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionExceptions() {
  const s = sections[7];
  const [tab, setTab] = useState("types");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["types", "Exception Types"], ["antipattern", "Avoid Partial Updates"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "7px 16px", borderRadius: 20, border: "0.5px solid",
            borderColor: tab === k ? "#993556" : "rgba(0,0,0,0.15)",
            background: tab === k ? "#FBEAF0" : "transparent",
            color: tab === k ? "#72243E" : "rgba(0,0,0,0.6)",
            fontSize: 13, fontWeight: tab === k ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
          }}>
            {label}
          </button>
        ))}
      </div>
      {tab === "types" && (
        <div>
          <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(99,153,34,0.08)", borderRadius: 8, fontSize: 13, color: "#3B6D11" }}>
            <strong>Rule:</strong> {s.rule}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {s.types.map((t) => (
              <div key={t.type} style={{ padding: "14px 16px", border: "0.5px solid rgba(153,53,86,0.15)", borderRadius: 10, background: "rgba(153,53,86,0.03)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#72243E", fontFamily: "ui-monospace, monospace", marginBottom: 6 }}>{t.type}</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginBottom: 10, fontStyle: "italic" }}>{t.when}</div>
                {t.examples.map((e, i) => (
                  <div key={i} style={{ fontSize: 12, color: "rgba(0,0,0,0.65)", marginBottom: 3 }}>· {e}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "antipattern" && (
        <div>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", marginBottom: 16, lineHeight: 1.7 }}>
            Updating one entity and then throwing before updating the rest leaves the system in an inconsistent state.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#A32D2D", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>❌ Bad flow</div>
              {s.antipattern.bad.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#A32D2D", minWidth: 18, paddingTop: 1 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: step.includes("❌") ? "#A32D2D" : "rgba(0,0,0,0.7)", fontWeight: step.includes("❌") ? 600 : 400 }}>{step}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#639922", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>✓ Better flow</div>
              {s.antipattern.good.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#639922", minWidth: 18, paddingTop: 1 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: step.includes("✓") ? "#3B6D11" : "rgba(0,0,0,0.7)", fontWeight: step.includes("✓") ? 600 : 400 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <QuoteBar text={quotes["exceptions"]} />
        </div>
      )}
    </div>
  );
}

function SectionChecklist() {
  const s = sections[8];
  const [checked, setChecked] = useState({});
  const total = s.groups.reduce((acc, g) => acc + g.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "14px 20px", background: "rgba(83,74,183,0.06)", borderRadius: 12, border: "0.5px solid rgba(83,74,183,0.15)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginBottom: 6 }}>Progress</div>
          <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: 100, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: "#534AB7", borderRadius: 100, transition: "width 0.3s" }} />
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#534AB7" }}>{done}<span style={{ fontSize: 14, color: "rgba(0,0,0,0.4)", fontWeight: 400 }}>/{total}</span></div>
        {done > 0 && (
          <button onClick={() => setChecked({})} style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", background: "transparent", border: "none", cursor: "pointer" }}>reset</button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {s.groups.map((group) => (
          <div key={group.name} style={{ border: "0.5px solid rgba(83,74,183,0.15)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", background: "rgba(83,74,183,0.06)", borderBottom: "0.5px solid rgba(83,74,183,0.1)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#534AB7" }}>{group.name}</span>
            </div>
            <div style={{ padding: "4px 16px 12px" }}>
              {group.items.map((item) => {
                const key = `${group.name}__${item}`;
                return (
                  <ChecklistItem
                    key={key}
                    label={item}
                    checked={!!checked[key]}
                    onToggle={() => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <QuoteBar text={quotes["checklist"]} />
    </div>
  );
}

const sectionComponents = {
  "how-to-use": SectionOverview,
  requirements: SectionRequirements,
  "system-mode": SectionSystemMode,
  entities: SectionEntities,
  layering: SectionLayering,
  extensibility: SectionExtensibility,
  concurrency: SectionConcurrency,
  exceptions: SectionExceptions,
  checklist: SectionChecklist,
};

export default function LLDPlaybook() {
  const [active, setActive] = useState("how-to-use");
  const current = sections.find((s) => s.id === active);
  const Component = sectionComponents[active];

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#FAFAF8",
      minHeight: "100vh",
      display: "flex",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 220,
        flexShrink: 0,
        borderRight: "0.5px solid rgba(0,0,0,0.08)",
        background: "white",
        padding: "32px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>
            LLD Interview
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>Playbook</div>
        </div>
        <div style={{ padding: "16px 12px 0" }}>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActive(sec.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                background: active === sec.id ? sec.bg || "#F0EFFD" : "transparent",
                color: active === sec.id ? sec.color : "rgba(0,0,0,0.6)",
                fontSize: 13,
                fontWeight: active === sec.id ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
                marginBottom: 2,
                transition: "all 0.15s",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <span style={{ fontSize: 14, opacity: 0.8 }}>{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>
        {/* Mental model card */}
        <div style={{ margin: "24px 12px 0", padding: "14px", background: "#F5F4FF", borderRadius: 10, border: "0.5px solid rgba(127,119,221,0.2)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#7F77DD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: "system-ui, sans-serif" }}>Mental model</div>
          {[["What exists?", "→ Entities"], ["Who uses it?", "→ Actors"], ["What can they do?", "→ APIs"], ["What changes?", "→ Service txns"], ["What varies?", "→ Strategy / Factory"], ["What can go wrong?", "→ Exceptions"], ["What's concurrent?", "→ Locks"]].map(([q, a]) => (
            <div key={q} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "system-ui, sans-serif", marginBottom: 5, color: "rgba(0,0,0,0.7)" }}>
              <span>{q}</span>
              <span style={{ color: "#7F77DD", fontWeight: 600 }}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "40px 48px", maxWidth: 860, overflowY: "auto" }}>
        {/* Section header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: current.bg || "#F0EFFD",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: current.color,
            }}>
              {current.icon}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
              {current.title}
            </h1>
          </div>
          <div style={{ height: 2, background: `linear-gradient(to right, ${current.color}30, transparent)`, borderRadius: 2 }} />
        </div>

        {/* Section content */}
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
          {Component && <Component />}
        </div>
      </div>
    </div>
  );
}
