import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Boxes,
  Braces,
  CheckCircle2,
  ClipboardList,
  Factory,
  GitBranch,
  KeyRound,
  LockKeyhole,
  Network,
  Route,
  Split,
  Workflow,
  XCircle
} from "lucide-react";

export const metadata = {
  title: "LLD Patterns | LLD Playbook"
};

const pageTheme = {
  "--cor-bg": "#f5f7fb",
  "--cor-surface": "#ffffff",
  "--cor-surface-2": "#f8fafc",
  "--cor-text": "#0f172a",
  "--cor-muted": "#5b677b",
  "--cor-border": "#dbe3ef",
  "--cor-brand": "#4f46e5",
  "--cor-brand-soft": "rgba(79, 70, 229, 0.12)",
  "--cor-good": "#0f766e",
  "--cor-danger": "#dc2626",
  "--cor-code-bg": "#050911",
  "--cor-code-top": "#171d29",
  "--cor-code-border": "#293140"
};

const decisionSignals = [
  {
    signal: "Algorithm varies",
    choose: "Strategy",
    example: "Parking fee, ride matching, discount, winning rule",
    icon: Split
  },
  {
    signal: "Creation branches by type",
    choose: "Factory",
    example: "Vehicle, payment method, chess piece, notification",
    icon: Factory
  },
  {
    signal: "Object behavior changes by lifecycle",
    choose: "State",
    example: "Vending machine, booking, order, document",
    icon: Route
  },
  {
    signal: "Request may pass through handlers",
    choose: "Chain of Responsibility",
    example: "Support routing, approval chain, auth filters",
    icon: GitBranch
  },
  {
    signal: "Side effects fan out",
    choose: "Observer",
    example: "Booking confirmed, move played, inventory low",
    icon: BellRing
  },
  {
    signal: "Action needs history",
    choose: "Command",
    example: "Undo move, retry payment, queue request",
    icon: ClipboardList
  }
];

const patternCatalog = [
  {
    id: "strategy",
    title: "Strategy",
    family: "Behavioral",
    signal: "A rule varies independently.",
    useWhen: ["Pricing, ranking, assignment, validation, or winning rules may change.", "The caller can select or configure the behavior."],
    avoidWhen: ["There is only one simple rule.", "The variation is object state, not an interchangeable algorithm."],
    example: "FeeCalculationStrategy in Parking Lot",
    icon: Split
  },
  {
    id: "factory",
    title: "Factory",
    family: "Creational",
    signal: "Object creation depends on type or input.",
    useWhen: ["Subtype construction is repeated in many places.", "Creation depends on request, config, or external type."],
    avoidWhen: ["Constructors are simple and used from one place.", "There are no meaningful subtypes."],
    example: "VehicleFactory or PaymentMethodFactory",
    icon: Factory
  },
  {
    id: "state",
    title: "State",
    family: "Behavioral",
    signal: "Valid operations depend on lifecycle.",
    useWhen: ["Many methods branch on status.", "Invalid method order must be explicit."],
    avoidWhen: ["There are only two statuses with small guards.", "A transition table is clearer."],
    example: "VendingMachineState",
    icon: Route
  },
  {
    id: "chain-of-responsibility",
    title: "Chain of Responsibility",
    family: "Behavioral",
    signal: "Multiple handlers may process one request.",
    useWhen: ["Handlers should be ordered and independently extensible.", "The client should not know which handler will process the request."],
    avoidWhen: ["A lookup map is clearer.", "Every handler must run every time; that is a pipeline."],
    example: "Support ticket routing",
    href: "/patterns/chain-of-responsibility",
    icon: GitBranch
  },
  {
    id: "observer",
    title: "Observer",
    family: "Behavioral",
    signal: "Independent reactions follow one event.",
    useWhen: ["Notifications, audit, analytics, or cache updates react to a domain event.", "New listeners should not change the core flow."],
    avoidWhen: ["The caller needs one direct return value.", "All side effects must be part of one transaction."],
    example: "BookingConfirmed observers",
    icon: BellRing
  },
  {
    id: "command",
    title: "Command",
    family: "Behavioral",
    signal: "The action itself must be stored.",
    useWhen: ["Undo, replay, retry, queueing, or audit is required.", "User intent must survive beyond one method call."],
    avoidWhen: ["The action is a direct one-off call.", "No history or rollback is needed."],
    example: "MoveCommand in TicTacToe",
    icon: ClipboardList
  },
  {
    id: "builder",
    title: "Builder",
    family: "Creational",
    signal: "Construction has many optional parts.",
    useWhen: ["An object has many optional fields.", "Stepwise construction improves readability."],
    avoidWhen: ["The constructor has two or three obvious fields.", "The builder only mirrors a simple DTO."],
    example: "BookingSummaryBuilder",
    icon: Boxes
  },
  {
    id: "adapter",
    title: "Adapter",
    family: "Structural",
    signal: "External interface does not match your domain.",
    useWhen: ["A third-party API shape should not leak into core code.", "The domain needs a stable interface over changing providers."],
    avoidWhen: ["You own both sides and can change the interface.", "It only renames one method with no isolation benefit."],
    example: "PaymentGatewayAdapter",
    icon: Braces
  },
  {
    id: "template-method",
    title: "Template Method",
    family: "Behavioral",
    signal: "The flow is fixed, but steps vary.",
    useWhen: ["A process has a stable skeleton.", "Subclasses customize specific steps."],
    avoidWhen: ["Composition with Strategy is clearer.", "The inheritance hierarchy will become rigid."],
    example: "ReportGenerationFlow",
    icon: Workflow
  },
  {
    id: "locking",
    title: "Locking",
    family: "Correctness",
    signal: "Shared state has check-then-update races.",
    useWhen: ["Seats, inventory, spots, balances, or turns can be modified concurrently.", "A write API reads state and then mutates it."],
    avoidWhen: ["The system is offline and single-threaded.", "The database transaction already gives the exact required isolation."],
    example: "SeatLock or SpotAssignmentLock",
    icon: LockKeyhole
  }
];

const fitRows = [
  {
    problem: "Parking Lot",
    pressure: "Spot assignment, vehicle creation, fee variation, concurrent entry.",
    patterns: ["Strategy", "Factory", "Locking"]
  },
  {
    problem: "BookMyShow",
    pressure: "Seat hold lifecycle, pricing, payment, notifications, double booking.",
    patterns: ["State", "Strategy", "Observer", "Locking"]
  },
  {
    problem: "TicTacToe",
    pressure: "Move history, winning rule variation, board updates, observers.",
    patterns: ["Command", "Strategy", "Observer"]
  },
  {
    problem: "Vending Machine",
    pressure: "Behavior changes across idle, paid, dispensing, and out-of-stock states.",
    patterns: ["State", "Factory", "Strategy"]
  },
  {
    problem: "Splitwise",
    pressure: "Split policies, ledger consistency, settlement calculation.",
    patterns: ["Strategy", "Command", "Locking"]
  }
];

const boundaries = [
  {
    title: "Name the pressure first",
    text: "Do not introduce a pattern before proving the design pressure it solves.",
    icon: KeyRound
  },
  {
    title: "Keep the domain readable",
    text: "A pattern that hides the main flow is worse than a simple conditional.",
    icon: CheckCircle2
  },
  {
    title: "Separate correctness from polish",
    text: "Locking, transactions, and idempotency protect invariants. They are not decorative patterns.",
    icon: LockKeyhole
  }
];

export default function PatternsPage() {
  return (
    <main style={pageTheme} className="min-h-[calc(100vh-4rem)] bg-[var(--cor-bg)] text-[var(--cor-text)]">
      <section className="border-b border-[var(--cor-border)] bg-[var(--cor-surface)]">
        <div className="site-container py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
                LLD Academy
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                Design patterns for LLD interviews.
              </h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">
                Use patterns as targeted design moves: identify the pressure, choose the smallest fitting pattern, and keep the domain model clear.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <HeroPill icon={Boxes} value={patternCatalog.length} label="Patterns" />
              <HeroPill icon={Network} value={fitRows.length} label="LLD fits" />
            </div>
          </div>
        </div>
      </section>

      <div className="site-container grid gap-5 py-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4 xl:sticky xl:top-20 xl:block">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-muted)]">
            Patterns
          </div>
          <nav className="mt-3 grid gap-1" aria-label="Pattern catalog">
            {patternCatalog.map((pattern) => (
              <a
                key={pattern.id}
                href={`#${pattern.id}`}
                className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--cor-muted)] transition hover:bg-[var(--cor-surface-2)] hover:text-[var(--cor-text)]"
              >
                {pattern.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--cor-border)] pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-normal">Decision Map</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">
                  Start from the symptom, then pick the design move.
                </p>
              </div>
              <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-muted)]">
                Interview signal first
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {decisionSignals.map((item) => (
                <DecisionCard key={item.signal} item={item} />
              ))}
            </div>
          </section>

          <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-lg border border-[var(--cor-border)] bg-[linear-gradient(135deg,var(--cor-brand-soft),var(--cor-surface)_42%,var(--cor-surface-2))] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
                Full lesson available
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-normal">Chain of Responsibility</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--cor-muted)]">
                Study the complete lesson with the naive version, refactor path, UML, final code, simulator, mistakes, and interview phrasing.
              </p>
              <Link
                href="/patterns/chain-of-responsibility"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[var(--cor-brand)] px-4 text-sm font-black text-white transition hover:brightness-95"
              >
                Open full lesson
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--cor-brand-soft)] text-[var(--cor-brand)]">
                  <Network size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-black">LLD rule</h3>
                  <p className="text-sm text-[var(--cor-muted)]">Pattern choice must make the model easier to explain.</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <CheckLine text="Use a pattern when it removes a real reason for change." />
                <CheckLine text="Skip it when it only adds ceremony." />
                <CheckLine text="Call out trade-offs in the interview." />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--cor-border)] pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-normal">Pattern Catalog</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">
                  Each card tells you when the pattern earns its place and when to avoid it.
                </p>
              </div>
              <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-muted)]">
                LLD
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {patternCatalog.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="mb-4 border-b border-[var(--cor-border)] pb-4">
              <h2 className="text-2xl font-black tracking-normal">LLD Fit Matrix</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">
                Common interview problems rarely use one pattern. The useful answer is a small combination.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--cor-border)]">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[var(--cor-surface-2)]">
                    <th className="border-b border-[var(--cor-border)] px-4 py-3 font-black">Problem</th>
                    <th className="border-b border-[var(--cor-border)] px-4 py-3 font-black">Design pressure</th>
                    <th className="border-b border-[var(--cor-border)] px-4 py-3 font-black">Useful patterns</th>
                  </tr>
                </thead>
                <tbody>
                  {fitRows.map((row) => (
                    <tr key={row.problem} className="border-b border-[var(--cor-border)] last:border-b-0">
                      <td className="px-4 py-3 font-black">{row.problem}</td>
                      <td className="px-4 py-3 leading-6 text-[var(--cor-muted)]">{row.pressure}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {row.patterns.map((pattern) => (
                            <span key={pattern} className="rounded-full bg-[var(--cor-brand-soft)] px-2.5 py-1 text-xs font-black text-[var(--cor-brand)]">
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            {boundaries.map((item) => (
              <BoundaryCard key={item.title} item={item} />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

function HeroPill({ icon: Icon, value, label }) {
  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 text-sm font-black text-[var(--cor-text)]">
      <Icon size={16} className="text-[var(--cor-brand)]" aria-hidden="true" />
      <span>{value}</span>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--cor-muted)]">{label}</span>
    </div>
  );
}

function DecisionCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-md bg-[var(--cor-brand-soft)] text-[var(--cor-brand)]">
          <Icon size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cor-muted)]">
            {item.signal}
          </div>
          <h3 className="mt-1 text-base font-black">{item.choose}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">{item.example}</p>
        </div>
      </div>
    </div>
  );
}

function PatternCard({ pattern }) {
  const Icon = pattern.icon;
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--cor-brand-soft)] text-[var(--cor-brand)]">
          <Icon size={19} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cor-muted)]">
          {pattern.family}
        </span>
      </div>

      <div className="mt-4">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cor-brand)]">
          {pattern.signal}
        </div>
        <h3 className="mt-1 text-xl font-black tracking-normal">{pattern.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--cor-muted)]">{pattern.example}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PatternList icon="check" title="Use when" items={pattern.useWhen} />
        <PatternList icon="x" title="Avoid when" items={pattern.avoidWhen} />
      </div>

      {pattern.href ? (
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[var(--cor-text)]">
          Open lesson
          <ArrowRight size={15} aria-hidden="true" />
        </span>
      ) : (
        <span className="mt-4 inline-flex text-sm font-black text-[var(--cor-muted)]">
          Catalog entry
        </span>
      )}
    </>
  );

  const className = "group flex min-h-80 flex-col rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--cor-brand)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]";

  if (pattern.href) {
    return (
      <Link id={pattern.id} href={pattern.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <article id={pattern.id} className={className}>
      {content}
    </article>
  );
}

function PatternList({ icon, title, items }) {
  const Icon = icon === "check" ? CheckCircle2 : XCircle;
  const color = icon === "check" ? "text-[var(--cor-good)]" : "text-[var(--cor-danger)]";

  return (
    <div className="rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-3">
      <h4 className="text-sm font-black">{title}</h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-5 text-[var(--cor-muted)]">
            <Icon size={15} className={`mt-0.5 flex-none ${color}`} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckLine({ text }) {
  return (
    <div className="flex items-start gap-2 text-sm leading-6 text-[var(--cor-muted)]">
      <CheckCircle2 size={16} className="mt-1 flex-none text-[var(--cor-good)]" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

function BoundaryCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--cor-brand-soft)] text-[var(--cor-brand)]">
        <Icon size={19} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-black">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--cor-muted)]">{item.text}</p>
    </div>
  );
}
