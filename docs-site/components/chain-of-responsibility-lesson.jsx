"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Moon,
  Palette,
  Play,
  Sun,
  XCircle
} from "lucide-react";

const accentOptions = [
  { name: "Indigo", color: "#4f46e5" },
  { name: "Blue", color: "#2563eb" },
  { name: "Cyan", color: "#0891b2" },
  { name: "Teal", color: "#0f766e" },
  { name: "Violet", color: "#7c3aed" },
  { name: "Red", color: "#dc2626" }
];

const lessonSections = [
  ["problem", "Real Problem"],
  ["naive", "Naive Design"],
  ["principles", "Principle Violations"],
  ["shift", "Mental Shift"],
  ["uml-generic", "Generic UML"],
  ["uml-example", "Example UML"],
  ["code", "Final Design"],
  ["simulator", "Interactive Lab"],
  ["variants", "Variants"],
  ["logic", "Logic Boundaries"],
  ["compare", "Similar Patterns"],
  ["avoid", "Avoid"],
  ["mistakes", "Mistakes"],
  ["production", "Production"],
  ["testing", "Testing"],
  ["interview", "Interview"],
  ["practice", "Practice"]
];

const codeGroups = {
  naive: {
    java: {
      file: "SupportDesk.java - naive version",
      role: "Naive centralized routing. Every new rule changes the same method.",
      code: String.raw`enum TicketType { GENERAL, BILLING, TECHNICAL, SECURITY }
enum Severity { LOW, MEDIUM, HIGH, CRITICAL }

class Ticket {
    private final TicketType type;
    private final Severity severity;
    private final String message;

    Ticket(TicketType type, Severity severity, String message) {
        this.type = type;
        this.severity = severity;
        this.message = message;
    }

    TicketType getType() { return type; }
    Severity getSeverity() { return severity; }
    String getMessage() { return message; }
}

class SupportDesk {
    String route(Ticket ticket) {
        if (ticket.getSeverity() == Severity.CRITICAL) {
            return "Security team handles immediately";
        } else if (ticket.getType() == TicketType.BILLING) {
            return "Billing team handles ticket";
        } else if (ticket.getType() == TicketType.TECHNICAL) {
            return "Technical team handles ticket";
        } else if (ticket.getType() == TicketType.SECURITY) {
            return "Security team handles ticket";
        } else {
            return "L1 support handles ticket";
        }
    }
}`
    },
    python: {
      file: "support_desk.py - naive version",
      role: "Same routing problem in Python: one router owns all routing rules.",
      code: String.raw`from dataclasses import dataclass
from enum import Enum

class TicketType(Enum):
    GENERAL = "GENERAL"
    BILLING = "BILLING"
    TECHNICAL = "TECHNICAL"
    SECURITY = "SECURITY"

class Severity(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass(frozen=True)
class Ticket:
    type: TicketType
    severity: Severity
    message: str

class SupportDesk:
    def route(self, ticket: Ticket) -> str:
        if ticket.severity == Severity.CRITICAL:
            return "Security team handles immediately"
        if ticket.type == TicketType.BILLING:
            return "Billing team handles ticket"
        if ticket.type == TicketType.TECHNICAL:
            return "Technical team handles ticket"
        if ticket.type == TicketType.SECURITY:
            return "Security team handles ticket"
        return "L1 support handles ticket"`
    }
  },
  minimal: {
    java: {
      file: "MinimalChain.java",
      role: "Minimal shape of Chain of Responsibility: handle or forward.",
      code: String.raw`interface Handler {
    void setNext(Handler next);
    String handle(Request request);
}

abstract class BaseHandler implements Handler {
    private Handler next;

    public void setNext(Handler next) {
        this.next = next;
    }

    protected String forward(Request request) {
        if (next == null) {
            return "No handler available";
        }
        return next.handle(request);
    }
}

class BillingHandler extends BaseHandler {
    public String handle(Request request) {
        if (request.isBilling()) {
            return "Billing handled";
        }
        return forward(request);
    }
}`
    },
    python: {
      file: "minimal_chain.py",
      role: "Same pattern shape in Python: each handler gets one chance.",
      code: String.raw`from abc import ABC, abstractmethod

class Handler(ABC):
    def __init__(self):
        self._next = None

    def set_next(self, nxt):
        self._next = nxt
        return nxt

    def forward(self, request):
        if self._next is None:
            return "No handler available"
        return self._next.handle(request)

    @abstractmethod
    def handle(self, request):
        pass

class BillingHandler(Handler):
    def handle(self, request):
        if request.is_billing():
            return "Billing handled"
        return self.forward(request)`
    }
  }
};

const finalCode = {
  java: [
    {
      name: "Ticket.java",
      role: "Request object carrying routing data.",
      code: String.raw`enum TicketType {
    GENERAL,
    BILLING,
    TECHNICAL,
    SECURITY
}

enum Severity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

final class Ticket {
    private final TicketType type;
    private final Severity severity;
    private final String message;

    Ticket(TicketType type, Severity severity, String message) {
        this.type = type;
        this.severity = severity;
        this.message = message;
    }

    TicketType getType() {
        return type;
    }

    Severity getSeverity() {
        return severity;
    }

    String getMessage() {
        return message;
    }
}`
    },
    {
      name: "SupportHandler.java",
      role: "Stable contract plus reusable forwarding logic.",
      code: String.raw`interface SupportHandler {
    void setNext(SupportHandler next);
    String handle(Ticket ticket);
}

abstract class AbstractSupportHandler implements SupportHandler {
    private SupportHandler next;

    public void setNext(SupportHandler next) {
        this.next = next;
    }

    protected String forward(Ticket ticket) {
        if (next == null) {
            return "No handler available for: " + ticket.getMessage();
        }
        return next.handle(ticket);
    }
}`
    },
    {
      name: "Handlers.java",
      role: "Concrete handlers own one routing rule each.",
      code: String.raw`class CriticalIncidentHandler extends AbstractSupportHandler {
    public String handle(Ticket ticket) {
        if (ticket.getSeverity() == Severity.CRITICAL) {
            return "Security team handles critical incident";
        }
        return forward(ticket);
    }
}

class BillingSupportHandler extends AbstractSupportHandler {
    public String handle(Ticket ticket) {
        if (ticket.getType() == TicketType.BILLING) {
            return "Billing team handles ticket";
        }
        return forward(ticket);
    }
}

class TechnicalSupportHandler extends AbstractSupportHandler {
    public String handle(Ticket ticket) {
        if (ticket.getType() == TicketType.TECHNICAL) {
            return "Technical team handles ticket";
        }
        return forward(ticket);
    }
}

class GeneralSupportHandler extends AbstractSupportHandler {
    public String handle(Ticket ticket) {
        return "L1 support handles ticket";
    }
}`
    },
    {
      name: "Demo.java",
      role: "Builds the chain and sends a ticket to the first handler.",
      code: String.raw`public class Demo {
    public static void main(String[] args) {
        SupportHandler critical = new CriticalIncidentHandler();
        SupportHandler billing = new BillingSupportHandler();
        SupportHandler technical = new TechnicalSupportHandler();
        SupportHandler general = new GeneralSupportHandler();

        critical.setNext(billing);
        billing.setNext(technical);
        technical.setNext(general);

        Ticket ticket = new Ticket(
            TicketType.BILLING,
            Severity.MEDIUM,
            "Refund issue"
        );

        System.out.println(critical.handle(ticket));
    }
}`
    }
  ],
  python: [
    {
      name: "ticket.py",
      role: "Request object carrying routing data.",
      code: String.raw`from dataclasses import dataclass
from enum import Enum

class TicketType(Enum):
    GENERAL = "GENERAL"
    BILLING = "BILLING"
    TECHNICAL = "TECHNICAL"
    SECURITY = "SECURITY"

class Severity(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass(frozen=True)
class Ticket:
    type: TicketType
    severity: Severity
    message: str`
    },
    {
      name: "support_handler.py",
      role: "Common base contract and reusable forwarding logic.",
      code: String.raw`from abc import ABC, abstractmethod

class SupportHandler(ABC):
    def __init__(self):
        self._next = None

    def set_next(self, nxt):
        self._next = nxt
        return nxt

    def forward(self, ticket):
        if self._next is None:
            return f"No handler available for ticket: {ticket.message}"
        return self._next.handle(ticket)

    @abstractmethod
    def handle(self, ticket):
        pass`
    },
    {
      name: "handlers.py",
      role: "Concrete handlers own one routing rule each.",
      code: String.raw`from ticket import TicketType, Severity
from support_handler import SupportHandler

class CriticalIncidentHandler(SupportHandler):
    def handle(self, ticket):
        if ticket.severity == Severity.CRITICAL:
            return "Security team handles critical incident"
        return self.forward(ticket)

class BillingSupportHandler(SupportHandler):
    def handle(self, ticket):
        if ticket.type == TicketType.BILLING:
            return "Billing team handles ticket"
        return self.forward(ticket)

class TechnicalSupportHandler(SupportHandler):
    def handle(self, ticket):
        if ticket.type == TicketType.TECHNICAL:
            return "Technical team handles ticket"
        return self.forward(ticket)

class GeneralSupportHandler(SupportHandler):
    def handle(self, ticket):
        return "L1 support handles ticket"`
    },
    {
      name: "demo.py",
      role: "Builds the chain and sends a ticket to the first handler.",
      code: String.raw`from ticket import Ticket, TicketType, Severity
from handlers import (
    CriticalIncidentHandler,
    BillingSupportHandler,
    TechnicalSupportHandler,
    GeneralSupportHandler,
)

critical = CriticalIncidentHandler()
billing = BillingSupportHandler()
technical = TechnicalSupportHandler()
general = GeneralSupportHandler()

critical.set_next(billing).set_next(technical).set_next(general)

ticket = Ticket(TicketType.BILLING, Severity.MEDIUM, "Refund issue")
print(critical.handle(ticket))`
    }
  ]
};

const principleRows = [
  ["SupportDesk receives requests and knows every rule.", "SRP", "Billing, security, and technical routing all change the same class.", "Each handler owns one focused responsibility."],
  ["Adding a new team edits route().", "OCP", "Growth repeatedly modifies existing routing logic.", "Add a handler and place it in the chain."],
  ["Client code knows every routing branch.", "Coupling", "The caller becomes tied to support-team details.", "The caller sends the request to the first handler."],
  ["Fallback behavior is mixed with specific rules.", "Cohesion", "Default handling is hidden inside a broad conditional.", "Fallback becomes an explicit final handler."]
];

const comparisonRows = [
  ["Chain of Responsibility vs Strategy", "Strategy chooses one algorithm upfront. COR lets multiple handlers try sequentially."],
  ["Chain of Responsibility vs Decorator", "Decorator adds behavior by wrapping. COR conditionally handles or forwards."],
  ["Chain of Responsibility vs Command", "Command turns a request into an object. COR routes a request across handlers."]
];

const genericUml = {
  id: "generic",
  title: "UML 1: Chain of Responsibility - Generic Structure",
  subtitle: "Generic Chain of Responsibility structure without domain-specific classes.",
  tag: "Generic UML",
  height: 520,
  lines: [
    [230, 120, 390, 120, false],
    [610, 120, 730, 120, false],
    [185, 310, 455, 190, true],
    [490, 310, 490, 190, true],
    [795, 310, 535, 190, true],
    [300, 385, 375, 385, false],
    [605, 385, 680, 385, false]
  ],
  nodes: [
    { title: "Client", body: "+ send(request)", x: 60, y: 65, w: 170 },
    { title: "Handler", stereo: "<<interface>>", body: "+ setNext(handler)\n+ handle(request)", x: 390, y: 45, w: 220, tone: "interface" },
    { title: "ConcreteHandlerA", body: "if canHandle -> handle\nelse -> next", x: 70, y: 310, w: 230 },
    { title: "ConcreteHandlerB", body: "if canHandle -> handle\nelse -> next", x: 375, y: 310, w: 230 },
    { title: "ConcreteHandlerC", body: "if canHandle -> handle\nelse -> next", x: 680, y: 310, w: 230 }
  ],
  labels: [
    { text: "first", x: 310, y: 96 },
    { text: "next", x: 300, y: 360 },
    { text: "next", x: 610, y: 360 }
  ],
  cards: [
    ["Client", "Knows only the first handler, not every concrete rule."],
    ["Handler", "Defines the stable API for forwarding or handling."],
    ["Concrete handlers", "Each handler owns one focused decision."]
  ]
};

const exampleUml = {
  id: "example",
  title: "UML 2: Support Ticket Chain",
  subtitle: "Support-ticket routing expressed using the same pattern structure.",
  tag: "Example UML",
  height: 560,
  lines: [
    [250, 115, 390, 115, false],
    [605, 115, 760, 115, false],
    [165, 340, 445, 190, true],
    [450, 340, 480, 190, true],
    [730, 340, 520, 190, true],
    [885, 340, 555, 190, true],
    [245, 410, 315, 410, false],
    [525, 410, 595, 410, false],
    [805, 410, 830, 410, false]
  ],
  nodes: [
    { title: "SupportDesk", body: "- firstHandler\n+ route(ticket)", x: 55, y: 55, w: 195 },
    { title: "SupportHandler", stereo: "<<interface>>", body: "+ setNext(handler)\n+ handle(ticket)", x: 390, y: 35, w: 215, tone: "interface" },
    { title: "Ticket", body: "type\nseverity\nmessage", x: 760, y: 55, w: 170, tone: "data" },
    { title: "CriticalIncidentHandler", body: "critical -> handle\nelse -> next", x: 35, y: 340, w: 210 },
    { title: "BillingSupportHandler", body: "billing -> handle\nelse -> next", x: 315, y: 340, w: 210 },
    { title: "TechnicalSupportHandler", body: "technical -> handle\nelse -> next", x: 595, y: 340, w: 210 },
    { title: "General", body: "fallback", x: 830, y: 340, w: 130 }
  ],
  labels: [
    { text: "first", x: 322, y: 88 },
    { text: "uses", x: 685, y: 88 },
    { text: "next", x: 280, y: 390 },
    { text: "next", x: 560, y: 390 },
    { text: "next", x: 815, y: 390 }
  ],
  cards: [
    ["SupportDesk", "Entry point. It delegates instead of manually checking every rule."],
    ["SupportHandler", "The stable abstraction that makes handlers swappable and chainable."],
    ["Handlers", "Focused processors ordered from most specific to most general."]
  ]
};

export function ChainOfResponsibilityLesson() {
  const [theme, setTheme] = useState("light");
  const [accent, setAccent] = useState("#4f46e5");

  useEffect(() => {
    const savedAccent = window.localStorage.getItem("cor-accent-color");
    setTheme(readSiteLessonTheme());
    if (savedAccent) setAccent(savedAccent);

    function syncTheme(event) {
      setTheme(event.detail?.theme === "midnight" ? "dark" : readSiteLessonTheme());
    }

    window.addEventListener("lld-site-theme-change", syncTheme);
    return () => window.removeEventListener("lld-site-theme-change", syncTheme);
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "studio" : "midnight";
      applySiteLessonTheme(next);
      return next === "midnight" ? "dark" : "light";
    });
  }

  function updateAccent(color) {
    setAccent(color);
    window.localStorage.setItem("cor-accent-color", color);
  }

  const vars = useMemo(() => {
    const soft = rgbaFromHex(accent, 0.12);

    return {
      "--cor-brand": accent,
      "--cor-brand-soft": soft,
      "--cor-bg": "var(--site-bg)",
      "--cor-surface": "var(--site-surface)",
      "--cor-surface-2": "var(--site-surface-2)",
      "--cor-text": "var(--site-heading)",
      "--cor-muted": "var(--site-muted)",
      "--cor-border": "var(--site-border)",
      "--cor-code-bg": "var(--site-code-bg)",
      "--cor-code-top": "var(--site-code-top)",
      "--cor-code-border": "var(--site-code-border)",
      "--cor-uml-panel": "var(--site-surface-2)",
      "--cor-uml-stage": "var(--site-surface)",
      "--cor-uml-card": "var(--site-surface)",
      "--cor-uml-title": "var(--site-surface-2)",
      "--cor-uml-border": "var(--site-muted)",
      "--cor-good": "var(--site-good)",
      "--cor-warn": "#f59e0b",
      "--cor-danger": "var(--site-danger)"
    };
  }, [accent]);

  return (
    <main style={vars} className="min-h-screen bg-[var(--cor-bg)] text-[var(--cor-text)]">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--cor-border)] bg-[var(--cor-surface)] lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:overflow-auto">
          <div className="border-b border-[var(--cor-border)] px-5 py-5">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">LLD Pattern Lesson</div>
            <h1 className="mt-2 text-xl font-black leading-tight">Chain of Responsibility</h1>
          </div>
          <div className="space-y-3 p-4">
            <Link href="/patterns" className="flex items-center gap-2 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-2 text-sm font-semibold text-[var(--cor-muted)] hover:text-[var(--cor-text)]">
              <ChevronRight size={15} className="rotate-180" aria-hidden="true" />
              Patterns lab
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-2 text-sm font-bold text-[var(--cor-text)]"
            >
              {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              Toggle theme
            </button>
          </div>
          <nav className="px-3 pb-6" aria-label="Lesson sections">
            {lessonSections.map(([id, label], index) => (
              <a key={id} href={`#${id}`} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--cor-muted)] hover:bg-[var(--cor-brand-soft)] hover:text-[var(--cor-text)]">
                <span className="w-5 font-mono text-[11px] text-[var(--cor-brand)]">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate">{label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="lg:hidden sticky top-16 z-30 border-b border-[var(--cor-border)] bg-[var(--cor-surface)] px-4 py-3">
            <details>
              <summary className="flex cursor-pointer items-center justify-between text-sm font-bold">
                Chain of Responsibility sections
                <ChevronRight size={16} aria-hidden="true" />
              </summary>
              <nav className="mt-3 grid gap-1" aria-label="Mobile lesson sections">
                {lessonSections.map(([id, label], index) => (
                  <a key={id} href={`#${id}`} className="rounded-md px-3 py-2 text-sm text-[var(--cor-muted)] hover:bg-[var(--cor-brand-soft)] hover:text-[var(--cor-text)]">
                    {String(index + 1).padStart(2, "0")} / {label}
                  </a>
                ))}
              </nav>
            </details>
          </div>

          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-lg border border-[var(--cor-border)] bg-[linear-gradient(135deg,var(--cor-surface),var(--cor-surface-2))] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <Pill>Behavioral Pattern</Pill>
                  <Pill>Support Ticket Routing</Pill>
                  <Pill>Java + Python</Pill>
                  <Pill>Difficulty: Medium</Pill>
                </div>
                <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
                  <div>
                    <h2 className="max-w-4xl text-4xl font-black leading-none tracking-normal sm:text-6xl">
                      Chain of Responsibility Pattern
                    </h2>
                    <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--cor-muted)]">
                      Learn Chain of Responsibility through a support-ticket routing system. The lesson moves from one central routing method to a clean chain of focused handlers.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4">
                    <div className="flex items-start gap-3">
                      <Palette size={19} className="mt-0.5 text-[var(--cor-brand)]" aria-hidden="true" />
                      <div>
                        <div className="text-sm font-black">Accent control</div>
                        <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">Applies to sections, cards, tables, code chrome, UML, and simulator.</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2" aria-label="Accent color options">
                      {accentOptions.map((item) => (
                        <button
                          key={item.color}
                          type="button"
                          title={item.name}
                          aria-label={item.name}
                          onClick={() => updateAccent(item.color)}
                          className={`h-8 w-8 rounded-full border-2 ${accent.toLowerCase() === item.color ? "border-[var(--cor-text)]" : "border-[var(--cor-border)]"}`}
                          style={{ background: item.color }}
                        />
                      ))}
                      <input
                        aria-label="Custom accent"
                        type="color"
                        value={accent}
                        onChange={(event) => updateAccent(event.target.value)}
                        className="h-8 w-10 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] p-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Frequency" value="Medium" />
              <Metric label="Signal" value="Sequential routing" />
              <Metric label="Interview use" value="Extensible handlers" />
            </div>

            <LessonSection id="problem" number="1" title="Real LLD Problem First" subtitle="Start from the real routing problem before introducing the pattern.">
              <p className="lead">
                Imagine a SaaS support system that receives billing issues, technical bugs, general questions, and critical security incidents.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="What the system must do">
                  <ul className="space-y-2 text-sm leading-6 text-[var(--cor-muted)]">
                    <li>Receive a support ticket.</li>
                    <li>Decide who should handle it.</li>
                    <li>Escalate urgent incidents before normal routing.</li>
                    <li>Stay easy to extend when new teams appear.</li>
                  </ul>
                </InfoCard>
                <InfoCard title="Why this becomes tricky">
                  <p>
                    At first, a few <code>if-else</code> checks feel enough. Then requirements grow: VIP rules, region-specific routing, audit rules, priority routing, and fallback behavior.
                  </p>
                </InfoCard>
              </div>
              <Note tone="good"><strong>Core problem:</strong> how do we let multiple handlers attempt a request one after another without one central class knowing every routing rule?</Note>
            </LessonSection>

            <LessonSection id="naive" number="2" title="Beginner / Naive Design" subtitle="The beginner-friendly implementation slowly turns into a maintenance problem.">
              <CodeWindow groupId="naive" group={codeGroups.naive} />
              <Note><strong>Why it looks acceptable:</strong> for two or three ticket types, this is easy to read. The pain appears when routing rules change independently.</Note>
            </LessonSection>

            <LessonSection id="principles" number="3" title="Design Principle Violations" subtitle="Connect the messy code to SRP, OCP, coupling, and cohesion issues.">
              <ResponsiveTable
                headers={["Observation", "Principle", "Problem", "COR fix"]}
                rows={principleRows}
              />
            </LessonSection>

            <LessonSection id="shift" number="4" title="Core Mental Shift" subtitle="Understand the thinking shift behind Chain of Responsibility.">
              <p>
                Before Chain of Responsibility, the client thinks: <em>I will decide who should handle this request.</em> After applying the pattern, the client thinks: <em>I will send the request into a chain. Each handler gets one chance to handle it.</em>
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="Before">
                  <p><code>SupportDesk.route(ticket)</code> checks billing, technical, security, and fallback rules itself.</p>
                </InfoCard>
                <InfoCard title="After">
                  <p><code>firstHandler.handle(ticket)</code> delegates the decision across a chain of specialized handlers.</p>
                </InfoCard>
              </div>
              <Note tone="good"><strong>Memorable line:</strong> Chain of Responsibility converts one method deciding every case into many handlers each deciding one case.</Note>
              <CodeWindow groupId="minimal" group={codeGroups.minimal} />
            </LessonSection>

            <LessonSection id="uml-generic" number="5" title="Generic UML" subtitle="Generic Chain of Responsibility structure without any domain-specific classes.">
              <UmlDiagram diagram={genericUml} />
            </LessonSection>

            <LessonSection id="uml-example" number="6" title="Example UML" subtitle="Support-ticket routing expressed using the same Chain of Responsibility structure.">
              <UmlDiagram diagram={exampleUml} />
            </LessonSection>

            <LessonSection id="code" number="7" title="Refactored Final Design" subtitle="Final interview-friendly implementation with language switching.">
              <p>The final code is shown as a compact mini IDE. The language dropdown changes the entire codebase.</p>
              <MiniIde />
            </LessonSection>

            <LessonSection id="simulator" number="8" title="Interactive Learning Lab" subtitle="Run tickets through the chain and observe which handler processes them.">
              <Simulator />
            </LessonSection>

            <LessonSection id="variants" number="9" title="Design Decision Variants" subtitle="Valid implementation choices and when to use them.">
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard title="Interface + base class"><p>Best interview version. Interface defines the contract; base class reuses forwarding.</p></InfoCard>
                <InfoCard title="Pure interface"><p>Good when forwarding rules differ across handlers.</p></InfoCard>
                <InfoCard title="Config-driven chain"><p>Useful when handler order changes by environment or product configuration.</p></InfoCard>
              </div>
            </LessonSection>

            <LessonSection id="logic" number="10" title="Where Should Validation / Business Logic Live?" subtitle="Where routing logic ends and business logic begins.">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="Inside handlers">
                  <ul className="space-y-2 text-sm leading-6 text-[var(--cor-muted)]">
                    <li>Can this handler process the request?</li>
                    <li>Should this request be forwarded?</li>
                    <li>What is this handler's focused rule?</li>
                  </ul>
                </InfoCard>
                <InfoCard title="Outside handlers">
                  <ul className="space-y-2 text-sm leading-6 text-[var(--cor-muted)]">
                    <li>Database transactions.</li>
                    <li>Complex SLA calculation services.</li>
                    <li>Notification and audit side effects.</li>
                  </ul>
                </InfoCard>
              </div>
            </LessonSection>

            <LessonSection id="compare" number="11" title="Pattern vs Similar Patterns" subtitle="Avoid confusing COR with Strategy, Decorator, or Command.">
              <ResponsiveTable headers={["Comparison", "Difference"]} rows={comparisonRows} />
            </LessonSection>

            <LessonSection id="avoid" number="12" title="When Not To Use Chain of Responsibility" subtitle="Know when this pattern is unnecessary overhead.">
              <Checklist items={["Only two simple routing cases exist.", "A lookup map is clearer.", "All handlers must run every time; that is more like a pipeline.", "The chain order is confusing and hard to debug."]} />
            </LessonSection>

            <LessonSection id="mistakes" number="13" title="Common Interview Mistakes" subtitle="Common LLD interview mistakes around handler chains.">
              <Checklist items={["Making every handler know the whole chain. Each handler should usually know only the next handler.", "Forgetting fallback. Decide what happens when nothing handles the request.", "Putting unrelated business logic inside handlers. Keep routing focused.", "Confusing COR with Strategy. Strategy picks one; COR tries multiple in order."]} />
            </LessonSection>

            <LessonSection id="production" number="14" title="Production Concerns" subtitle="Real-world concerns: observability, thread-safety, and configuration.">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="Observability"><p>Log which handler handled or rejected a request.</p></InfoCard>
                <InfoCard title="Thread-safety"><p>Prefer stateless handlers. Guard mutable shared state.</p></InfoCard>
                <InfoCard title="Idempotency"><p>If handlers trigger side effects, repeated requests should not duplicate work.</p></InfoCard>
                <InfoCard title="Configuration"><p>Production chains are often assembled by dependency injection or config.</p></InfoCard>
              </div>
            </LessonSection>

            <LessonSection id="testing" number="15" title="Testing Strategy" subtitle="What to test in handlers and full chain wiring.">
              <Checklist icon="check" items={["Unit test each handler in isolation.", "Test forwarding behavior.", "Test full chain order.", "Test fallback cases.", "Test critical incidents bypass normal routing."]} />
            </LessonSection>

            <LessonSection id="interview" number="16" title="How To Say It In Interview" subtitle="A polished explanation students can use in interviews.">
              <Note tone="good">
                <strong>Interview-ready answer:</strong> I would use Chain of Responsibility when a request can be handled by multiple possible handlers and I do not want one central class to know every rule. Each handler gets a chance to process the request. If it cannot, it forwards to the next handler. This keeps routing logic extensible and avoids one growing <code>if-else</code> method. If the routing is very small, I would keep a simple conditional solution instead.
              </Note>
            </LessonSection>

            <LessonSection id="practice" number="17" title="Practice Problems" subtitle="Problems where the same design thinking applies.">
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard title="Expense approval"><p>{"Manager -> Director -> Finance approval chain."}</p></InfoCard>
                <InfoCard title="API authentication"><p>{"API key -> JWT -> OAuth handler chain."}</p></InfoCard>
                <InfoCard title="Moderation"><p>{"Profanity filter -> policy checker -> human reviewer."}</p></InfoCard>
              </div>
            </LessonSection>
          </div>
        </div>
      </div>
    </main>
  );
}

function readSiteLessonTheme() {
  return document.documentElement.dataset.siteTheme === "midnight" ? "dark" : "light";
}

function applySiteLessonTheme(theme) {
  const normalizedTheme = theme === "midnight" ? "midnight" : "studio";
  document.documentElement.dataset.siteTheme = normalizedTheme;
  document.documentElement.classList.toggle("site-midnight", normalizedTheme === "midnight");
  document.documentElement.classList.toggle("site-studio", normalizedTheme === "studio");
  window.localStorage.setItem("lld-playbook.site-theme.local", normalizedTheme);
  window.dispatchEvent(new CustomEvent("lld-site-theme-change", { detail: { theme: normalizedTheme } }));
}

function Pill({ children }) {
  return <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface)] px-3 py-1 text-xs font-black text-[var(--cor-muted)]">{children}</span>;
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4">
      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cor-muted)]">{label}</div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  );
}

function LessonSection({ id, number, title, subtitle, children }) {
  return (
    <section id={id} className="mt-5 scroll-mt-28 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-4 flex items-start gap-4">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-md bg-[var(--cor-brand)] font-mono text-sm font-black text-white">{number}</div>
        <div className="min-w-0">
          <h3 className="text-2xl font-black tracking-normal">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-muted)]">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4 text-[15px] leading-7 text-[var(--cor-text)] [&_.lead]:text-base [&_.lead]:text-[var(--cor-muted)] [&_code]:rounded [&_code]:bg-[var(--cor-brand-soft)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm">
        {children}
      </div>
    </section>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-4">
      <h4 className="text-base font-black">{title}</h4>
      <div className="mt-2 text-sm leading-6 text-[var(--cor-muted)]">{children}</div>
    </div>
  );
}

function Note({ children, tone = "brand" }) {
  const toneClass = tone === "good" ? "border-l-[var(--cor-good)]" : tone === "danger" ? "border-l-[var(--cor-danger)]" : "border-l-[var(--cor-brand)]";
  return (
    <div className={`rounded-md border border-l-4 border-[var(--cor-border)] bg-[var(--cor-brand-soft)] p-4 text-sm leading-6 ${toneClass}`}>
      {children}
    </div>
  );
}

function CodeWindow({ groupId, group }) {
  const [language, setLanguage] = useState("java");
  const item = group[language];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--cor-code-border)] bg-[var(--cor-code-bg)] shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cor-code-border)] bg-[var(--cor-code-top)] px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff6b63]" />
          <span className="h-3 w-3 rounded-full bg-[#f6c453]" />
          <span className="h-3 w-3 rounded-full bg-[#67c85f]" />
          <span className="truncate font-mono text-sm font-bold text-[var(--cor-muted)]">{item.file}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label={`${groupId} language`}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="h-9 rounded-md border border-[var(--cor-code-border)] bg-[var(--cor-surface)] px-3 text-sm font-bold text-[var(--cor-text)]"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
          <CopyButton text={item.code} />
        </div>
      </div>
      <pre className="overflow-auto bg-[var(--cor-code-bg)] p-5 text-sm leading-7 text-[var(--cor-text)]"><code>{item.code}</code></pre>
      <div className="border-t border-[var(--cor-code-border)] bg-[var(--cor-code-top)] px-4 py-3 text-sm text-[var(--cor-muted)]">{item.role}</div>
    </div>
  );
}

function MiniIde() {
  const [language, setLanguage] = useState("java");
  const [activeTab, setActiveTab] = useState(0);
  const files = finalCode[language];
  const activeFile = files[activeTab] || files[0];

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setActiveTab(0);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--cor-code-border)] bg-[var(--cor-code-bg)] shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-stretch border-b border-[var(--cor-code-border)] bg-[var(--cor-code-top)]">
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          {files.map((file, index) => (
            <button
              key={file.name}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`border-r border-[var(--cor-code-border)] px-4 py-3 text-left font-mono text-sm ${index === activeTab ? "bg-[var(--cor-code-bg)] font-black text-[var(--cor-text)]" : "text-[var(--cor-muted)] hover:text-[var(--cor-text)]"}`}
            >
              {file.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-sm text-[var(--cor-muted)]">Language</span>
          <select
            aria-label="Final code language"
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
            className="h-9 rounded-md border border-[var(--cor-code-border)] bg-[var(--cor-surface)] px-3 text-sm font-bold text-[var(--cor-text)]"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--cor-code-border)] bg-[var(--cor-code-top)] px-4 py-3 text-sm text-[var(--cor-muted)]">
        <span>{activeFile.role}</span>
        <CopyButton text={activeFile.code} small />
      </div>
      <pre className="overflow-auto bg-[var(--cor-code-bg)] p-5 text-sm leading-7 text-[var(--cor-text)]"><code>{activeFile.code}</code></pre>
    </div>
  );
}

function CopyButton({ text, small = false }) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1100);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyText}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-[var(--cor-code-border)] bg-transparent font-bold text-[var(--cor-muted)] hover:border-[var(--cor-brand)] hover:text-[var(--cor-text)] ${small ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm"}`}
    >
      <Copy size={small ? 13 : 15} aria-hidden="true" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Simulator() {
  const [ticketType, setTicketType] = useState("GENERAL");
  const [severity, setSeverity] = useState("LOW");
  const [message, setMessage] = useState("Refund request");

  const trace = useMemo(() => {
    const chain = [
      { name: "CriticalIncidentHandler", handled: severity === "CRITICAL", msg: "critical incident" },
      { name: "BillingSupportHandler", handled: ticketType === "BILLING" && severity !== "CRITICAL", msg: "billing ticket" },
      { name: "TechnicalSupportHandler", handled: ticketType === "TECHNICAL" && severity !== "CRITICAL", msg: "technical ticket" },
      { name: "GeneralSupportHandler", handled: true, msg: "fallback" }
    ];

    const rows = [];
    for (const handler of chain) {
      rows.push(handler);
      if (handler.handled) break;
    }
    return rows;
  }, [severity, ticketType]);

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-4">
        <label className="block text-sm font-black" htmlFor="ticketType">Ticket type</label>
        <select id="ticketType" value={ticketType} onChange={(event) => setTicketType(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] px-3 text-[var(--cor-text)]">
          <option>GENERAL</option>
          <option>BILLING</option>
          <option>TECHNICAL</option>
          <option>SECURITY</option>
        </select>

        <label className="mt-4 block text-sm font-black" htmlFor="severity">Severity</label>
        <select id="severity" value={severity} onChange={(event) => setSeverity(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] px-3 text-[var(--cor-text)]">
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
          <option>CRITICAL</option>
        </select>

        <label className="mt-4 block text-sm font-black" htmlFor="message">Message</label>
        <input id="message" value={message} onChange={(event) => setMessage(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] px-3 text-[var(--cor-text)]" />

        <div className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--cor-brand)] px-4 py-2 text-sm font-black text-white">
          <Play size={16} aria-hidden="true" />
          Run through chain
        </div>
      </div>

      <div className="min-w-0">
        <div className="rounded-md border border-dashed border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-4 font-mono text-sm text-[var(--cor-muted)]">
          {"CriticalIncidentHandler -> BillingSupportHandler -> TechnicalSupportHandler -> GeneralSupportHandler"}
        </div>
        <div className="mt-3 grid gap-2">
          {trace.map((handler) => (
            <div key={`${handler.name}-${handler.msg}`} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-4 py-3">
              <span className="font-mono text-sm">{handler.name}</span>
              {handler.handled ? (
                <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--cor-good)]">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  handled: {handler.msg}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--cor-muted)]">
                  <XCircle size={16} aria-hidden="true" />
                  passed
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--cor-muted)]">
          Current request: <strong className="text-[var(--cor-text)]">{ticketType}</strong> / <strong className="text-[var(--cor-text)]">{severity}</strong> / {message || "No message"}
        </p>
      </div>
    </div>
  );
}

function UmlDiagram({ diagram }) {
  const arrowId = `arrow-${diagram.id}`;
  const triangleId = `tri-${diagram.id}`;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--cor-border)] bg-[var(--cor-uml-panel)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--cor-border)] px-5 py-4">
        <div>
          <h4 className="text-xl font-black">{diagram.title}</h4>
          <p className="mt-1 text-sm text-[var(--cor-muted)]">{diagram.subtitle}</p>
        </div>
        <span className="rounded-full bg-[var(--cor-brand-soft)] px-3 py-1.5 text-sm font-black text-[var(--cor-brand)]">{diagram.tag}</span>
      </div>
      <div className="overflow-x-auto p-5">
        <div className="relative min-w-[980px] rounded-lg border border-[var(--cor-border)] bg-[linear-gradient(180deg,var(--cor-uml-stage),var(--cor-uml-card))]" style={{ height: diagram.height }}>
          <svg className="absolute inset-0 h-full w-full text-[var(--cor-uml-border)]" preserveAspectRatio="none" viewBox={`0 0 980 ${diagram.height}`} aria-hidden="true">
            <defs>
              <marker id={arrowId} markerHeight="12" markerWidth="12" orient="auto" refX="10" refY="6">
                <path d="M1,1 L11,6 L1,11" fill="none" stroke="currentColor" strokeWidth="2" />
              </marker>
              <marker id={triangleId} markerHeight="14" markerWidth="14" orient="auto" refX="11" refY="7">
                <path d="M1,1 L12,7 L1,13 Z" fill="var(--cor-uml-stage)" stroke="currentColor" strokeWidth="2" />
              </marker>
            </defs>
            {diagram.lines.map(([x1, y1, x2, y2, dashed], index) => (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={dashed ? "7 7" : undefined}
                markerEnd={`url(#${dashed ? triangleId : arrowId})`}
              />
            ))}
          </svg>
          {diagram.nodes.map((node) => (
            <div
              key={node.title}
              className="absolute overflow-hidden rounded-lg border-2 border-[var(--cor-uml-border)] bg-[var(--cor-uml-card)] shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              style={{ left: node.x, top: node.y, width: node.w }}
            >
              <div className={`border-b border-[var(--cor-border)] px-3 py-3 text-center text-sm font-black ${node.tone === "interface" ? "bg-[var(--cor-brand-soft)]" : node.tone === "data" ? "bg-[var(--cor-brand-soft)] text-[var(--cor-text)]" : "bg-[var(--cor-uml-title)]"}`}>
                {node.title}
                {node.stereo && <small className="mt-1 block text-[10px] uppercase tracking-[0.08em] text-[var(--cor-muted)]">{node.stereo}</small>}
              </div>
              <div className="whitespace-pre-line px-4 py-3 font-mono text-xs leading-6 text-[var(--cor-muted)]">{node.body}</div>
            </div>
          ))}
          {diagram.labels.map((label) => (
            <div key={`${label.text}-${label.x}`} className="absolute -translate-x-1/2 -translate-y-1/2 bg-[var(--cor-uml-stage)] px-1 font-mono text-[11px] font-bold text-[var(--cor-brand)]" style={{ left: label.x, top: label.y }}>
              {label.text}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 px-5 pb-5 md:grid-cols-3">
        {diagram.cards.map(([title, body]) => (
          <InfoCard key={title} title={title}>
            <p>{body}</p>
          </InfoCard>
        ))}
      </div>
    </div>
  );
}

function ResponsiveTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--cor-border)]">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-4 py-3 font-black text-[var(--cor-muted)]">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-[var(--cor-border)] px-4 py-3 align-top text-[var(--cor-muted)] last:border-b">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Checklist({ items, icon = "x" }) {
  const Icon = icon === "check" ? CheckCircle2 : XCircle;
  const color = icon === "check" ? "text-[var(--cor-good)]" : "text-[var(--cor-danger)]";

  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-4 py-3 text-sm leading-6 text-[var(--cor-muted)]">
          <Icon size={17} className={`mt-0.5 flex-none ${color}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function rgbaFromHex(hex, alpha) {
  const clean = hex.replace("#", "").trim();
  const normalized = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return `rgba(79, 70, 229, ${alpha})`;

  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
