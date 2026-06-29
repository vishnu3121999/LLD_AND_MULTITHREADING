function lesson(slug, title, summary, outcomes, sections, mistakes = []) {
  return { slug, title, summary, outcomes, sections, mistakes };
}

function codingProblem(slug, title, summary, category, outcomes, sections, mistakes, problem) {
  return {
    ...lesson(slug, title, summary, outcomes, sections, mistakes),
    kind: "problem",
    category,
    problem
  };
}

export const concurrencyModules = [
  {
    id: "core-concepts",
    number: "Module 1",
    title: "Core Concepts",
    description: "The mental models every learner needs before writing concurrent code.",
    lessons: [
      lesson(
        "process-vs-thread",
        "Process vs Thread",
        "Understand the boundary between isolated programs and lightweight execution units inside a program.",
        ["Process memory isolation", "Thread shared address space", "Why threads can corrupt shared state"],
        [
          ["Mental model", "A process owns resources such as memory, file handles, and environment state. A thread is an execution path inside a process. Threads in the same process share heap memory, which makes communication cheap and mistakes easy."],
          ["LLD relevance", "When an interviewer asks whether two requests can touch the same object, they are asking whether shared state exists inside one process, across many processes, or both."],
          ["Interview phrasing", "I would treat threads as concurrent execution paths that share process memory, so any mutable object reachable by both threads needs a clear ownership or synchronization rule."]
        ],
        ["Saying a process and thread are the same thing.", "Ignoring that threads share heap memory."]
      ),
      lesson(
        "thread-lifecycle",
        "Thread Lifecycle",
        "Learn how a thread moves through creation, runnable, blocked, waiting, timed waiting, and termination states.",
        ["Runnable vs running", "Blocking and waiting", "Termination and cleanup"],
        [
          ["Mental model", "A thread is not always running just because it exists. It may be ready to run, waiting for a lock, sleeping for a timeout, blocked on I/O, or finished."],
          ["LLD relevance", "Thread lifecycle matters when designing thread pools, blocking queues, worker shutdown, and timeout behavior."],
          ["Interview phrasing", "I would define when workers start, how they wait for work, how they unblock, and how shutdown moves them to termination without losing tasks."]
        ],
        ["Forgetting blocked and waiting states.", "Designing worker shutdown without an exit condition."]
      ),
      lesson(
        "context-switching",
        "Context Switching",
        "Understand how CPUs switch between runnable threads and why too many threads can reduce throughput.",
        ["Scheduler role", "Context switch cost", "Thread count trade-offs"],
        [
          ["Mental model", "A context switch saves the current execution state and restores another thread's state. It gives the illusion of simultaneous work on limited cores, but it is not free."],
          ["LLD relevance", "Thread-per-request designs can be simple, but too many blocked or runnable threads create memory pressure and scheduler overhead."],
          ["Interview phrasing", "I would avoid unbounded thread creation and use a bounded executor so concurrency is controlled instead of letting the scheduler absorb unlimited work."]
        ],
        ["Assuming more threads always means faster execution.", "Ignoring blocked threads consuming memory."]
      ),
      lesson(
        "shared-mutable-state",
        "Shared Mutable State",
        "See why data that can be read and written by multiple execution paths is the root of most concurrency bugs.",
        ["Shared ownership", "Mutation hazards", "Immutability as a design tool"],
        [
          ["Mental model", "Shared mutable state is any value that more than one thread can access where at least one thread can write. Without coordination, readers and writers can observe inconsistent state."],
          ["LLD relevance", "Seats, inventory counts, balances, parking spots, game turns, queues, and caches are all shared mutable state in common LLD problems."],
          ["Interview phrasing", "I would first identify the shared mutable state and then either make it immutable, confine it to one owner, or protect it with a synchronization boundary."]
        ],
        ["Locking everything instead of identifying the shared state.", "Protecting the collection but not the object stored inside it."]
      ),
      lesson(
        "race-conditions",
        "Race Conditions",
        "Understand bugs where correctness depends on timing between overlapping operations.",
        ["Read-check-write races", "Lost updates", "Check-then-act bugs"],
        [
          ["Mental model", "A race condition appears when two operations interleave in a way that violates the expected result. The code may pass tests because the bad interleaving does not always happen."],
          ["LLD relevance", "Two users booking the same seat, two vehicles taking one spot, and two expenses updating one balance are race-condition examples."],
          ["Interview phrasing", "The dangerous part is the read-check-write sequence. I would make that sequence atomic so both requests cannot pass the same check."]
        ],
        ["Only testing the single-threaded flow.", "Saying ConcurrentHashMap fixes every race."]
      ),
      lesson(
        "atomicity",
        "Atomicity",
        "Learn the difference between one indivisible operation and a sequence that can be interrupted.",
        ["Single atomic operations", "Compound operations", "Atomic critical sections"],
        [
          ["Mental model", "Atomic means no other thread can observe the operation halfway complete. A single assignment may be atomic while a read-modify-write sequence is not."],
          ["LLD relevance", "Seat booking needs the availability check and state update to behave as one atomic decision."],
          ["Interview phrasing", "I would protect the whole compound operation, not just the individual read or write."]
        ],
        ["Calling every small operation atomic.", "Protecting write but not the preceding check."]
      ),
      lesson(
        "happens-before",
        "Happens-Before Relationship",
        "Understand the ordering rule that tells whether one thread is guaranteed to see another thread's writes.",
        ["Ordering guarantees", "Synchronization edges", "Visibility through happens-before"],
        [
          ["Mental model", "Happens-before is a visibility and ordering relationship. If one action happens-before another, the later action must observe the effects of the earlier action."],
          ["LLD relevance", "Without a happens-before edge, a worker thread may not see a shutdown flag or a consumer may not see a produced item correctly."],
          ["Interview phrasing", "I would use synchronization, volatile, thread-safe queues, or executor boundaries to create a clear happens-before relationship."]
        ],
        ["Treating happens-before as wall-clock order.", "Assuming writes become visible immediately without synchronization."]
      ),
      lesson(
        "memory-visibility",
        "Memory Visibility",
        "Learn why one thread's write may not be immediately visible to another thread.",
        ["CPU caches", "Compiler optimizations", "Visibility guarantees"],
        [
          ["Mental model", "Threads can see stale values because CPUs cache data and compilers reorder code under the language memory model."],
          ["LLD relevance", "Visibility issues matter for flags, cached values, singleton initialization, and worker coordination."],
          ["Interview phrasing", "If multiple threads read a flag written by another thread, I need a visibility mechanism such as volatile, synchronized access, or a concurrent abstraction."]
        ],
        ["Assuming a boolean flag is safe by default.", "Confusing atomicity with visibility."]
      ),
      lesson(
        "reordering",
        "CPU And Compiler Reordering",
        "Understand how legal optimizations can change apparent execution order unless synchronization constrains them.",
        ["Instruction reordering", "Memory barriers", "Why locks constrain ordering"],
        [
          ["Mental model", "The compiler and CPU may reorder operations when single-threaded behavior is preserved. In concurrent code, that can expose surprising states unless the memory model prevents it."],
          ["LLD relevance", "Double-checked locking, lazy initialization, and publish-before-ready bugs depend on ordering and visibility."],
          ["Interview phrasing", "I would not rely on source-code order alone. I would use language guarantees that prevent unsafe publication and stale reads."]
        ],
        ["Assuming code executes exactly in source order across threads.", "Publishing partially initialized objects."]
      ),
      lesson(
        "deadlock-livelock-starvation",
        "Deadlock, Livelock, Starvation",
        "Distinguish the common progress failures in concurrent systems.",
        ["Circular waiting", "Repeated non-progress", "Unfair scheduling"],
        [
          ["Mental model", "Deadlock means threads wait forever for each other. Livelock means they keep reacting but make no progress. Starvation means one task keeps losing access to resources."],
          ["LLD relevance", "Multi-seat booking, dining philosophers, and read-write locks all need progress guarantees, not only mutual exclusion."],
          ["Interview phrasing", "I would define a consistent lock ordering, use timeouts when appropriate, and avoid designs where a class of requests can be starved indefinitely."]
        ],
        ["Only discussing deadlock and ignoring starvation.", "Taking multiple locks without a fixed order."]
      )
    ]
  },
  {
    id: "patterns",
    number: "Module 2",
    title: "Concurrency Patterns",
    description: "Synchronization primitives and classical problems explained through motivating failures.",
    lessons: [
      lesson("mutex", "Mutex", "Protect one critical section so only one thread can execute it at a time.", ["Mutual exclusion", "Critical section sizing", "Lock release discipline"], [["Problem first", "Without a mutex, two threads can enter the same update path and corrupt shared state."], ["Correct use", "Lock before reading shared state, perform the minimal check-update work, then release the lock in a finally-style path."], ["Interview phrasing", "I would use a mutex around the smallest code block that protects the invariant."]], ["Holding a lock during network calls.", "Forgetting to release the lock on exceptions."]),
      lesson("semaphore", "Semaphore", "Limit how many threads can access a resource or enter a section.", ["Permits", "Bounded access", "Acquire and release"], [["Problem first", "A fixed-size resource pool needs at most N concurrent users."], ["Correct use", "Acquire a permit before using the resource and release it once the resource is returned."], ["Interview phrasing", "I would use a semaphore when the limit is more than one but still bounded."]], ["Using a semaphore when strict ownership is needed.", "Leaking permits."]),
      lesson("condition-variable", "Condition Variable", "Let threads wait until a condition becomes true.", ["Wait loop", "Notify", "Spurious wakeups"], [["Problem first", "A consumer should sleep when a queue is empty and wake when producers add work."], ["Correct use", "Always wait in a loop that rechecks the condition after waking."], ["Interview phrasing", "I would pair the condition variable with a lock and recheck the condition after every wakeup."]], ["Using if instead of while around wait.", "Not holding the associated lock."]),
      lesson("monitor", "Monitor", "Bundle shared state with synchronized methods that guard access.", ["Encapsulation", "Intrinsic lock", "Condition coordination"], [["Problem first", "Shared state becomes hard to protect when every caller locks it differently."], ["Correct use", "Expose methods that own the lock discipline and hide the raw state."], ["Interview phrasing", "I would make the object responsible for its own synchronization boundary."]], ["Exposing internal mutable state.", "Calling external code while inside the monitor."]),
      lesson("read-write-lock", "Read-Write Lock", "Allow many readers or one writer when reads dominate writes.", ["Shared reads", "Exclusive writes", "Read-heavy workloads"], [["Problem first", "A cache is read constantly but written rarely."], ["Correct use", "Readers share a read lock; writers require exclusive access."], ["Interview phrasing", "I would use a read-write lock only if read concurrency matters and writes are relatively rare."]], ["Using it for write-heavy workloads.", "Ignoring writer starvation."]),
      lesson("producer-consumer", "Producer-Consumer", "Coordinate producers that add work and consumers that process it.", ["Blocking queue", "Backpressure", "Shutdown signal"], [["Problem first", "Producers can outpace consumers and exhaust memory."], ["Correct use", "Use a bounded blocking queue so producers wait when the queue is full and consumers wait when it is empty."], ["Interview phrasing", "I would use a bounded queue to create backpressure and avoid unbounded memory growth."]], ["Using an unbounded queue by default.", "No clean shutdown path."]),
      lesson("readers-writers", "Readers-Writers", "Manage access when many reads can run together but writes need exclusivity.", ["Read concurrency", "Write exclusivity", "Fairness"], [["Problem first", "Reads do not conflict with reads, but writes conflict with everything."], ["Correct use", "Choose reader-preference, writer-preference, or fair policy explicitly."], ["Interview phrasing", "I would call out fairness because a naive readers-writers solution can starve writers."]], ["Ignoring starvation.", "Using it where a simple mutex is enough."]),
      lesson("dining-philosophers", "Dining Philosophers", "Classic deadlock problem for reasoning about multiple locks.", ["Circular wait", "Lock ordering", "Resource hierarchy"], [["Problem first", "Each participant needs two resources, and everyone can hold one while waiting for another."], ["Correct use", "Break at least one deadlock condition using ordering, a waiter, timeouts, or limiting participants."], ["Interview phrasing", "I would prevent circular wait by enforcing a global lock order."]], ["Solving mutual exclusion but leaving deadlock.", "No progress guarantee."])
    ]
  },
  {
    id: "language-deep-dives",
    number: "Module 3",
    title: "Language Deep Dives",
    description: "Choose Java, Go, or Python and map the same primitives to language idioms.",
    lessons: [
      lesson("java-concurrency-track", "Java Track", "Use Java's synchronization primitives and java.util.concurrent abstractions correctly.", ["synchronized", "ReentrantLock", "volatile", "ExecutorService", "BlockingQueue"], [["Core tools", "Java gives intrinsic locks through synchronized, explicit locks through ReentrantLock, visibility through volatile, and higher-level utilities in java.util.concurrent."], ["Mapping", "Mutex maps to synchronized or Lock. Producer-consumer maps to BlockingQueue. Worker pools map to ExecutorService."], ["Interview phrasing", "I would prefer high-level java.util.concurrent utilities unless the interview asks me to implement the primitive."]], ["Using volatile for compound updates.", "Creating raw threads instead of bounded executors."]),
      lesson("go-concurrency-track", "Go Track", "Use goroutines, channels, select, WaitGroup, and mutexes idiomatically.", ["goroutines", "channels", "select", "sync.WaitGroup", "sync.Mutex"], [["Core tools", "Go makes lightweight concurrent execution cheap with goroutines and encourages communication through channels."], ["Mapping", "Producer-consumer maps naturally to channels. Mutual exclusion uses sync.Mutex. Waiting for worker completion uses sync.WaitGroup."], ["Interview phrasing", "I would use channels for ownership transfer and mutexes when protecting shared memory is clearer."]], ["Leaking goroutines.", "Using channels where a mutex would be simpler."]),
      lesson("python-concurrency-track", "Python Track", "Understand the GIL, threading, multiprocessing, and asyncio event loop trade-offs.", ["GIL implications", "threading", "multiprocessing", "asyncio", "event loop"], [["Core tools", "Python threads are useful for I/O concurrency, multiprocessing helps CPU-heavy work bypass the GIL, and asyncio coordinates many I/O tasks on an event loop."], ["Mapping", "Producer-consumer can use queue.Queue for threads or asyncio.Queue for async code. CPU-bound parallelism usually needs multiprocessing."], ["Interview phrasing", "I would distinguish I/O concurrency from CPU parallelism because Python's GIL changes the best tool."]], ["Claiming Python threads never help.", "Using asyncio for CPU-heavy work without offloading."])
    ]
  },
  {
    id: "distributed-concurrency",
    number: "Module 4",
    title: "Distributed Concurrency",
    description: "Move from one process to many machines and connect concurrency to HLD interviews.",
    lessons: [
      lesson("distributed-locks", "Distributed Locks", "Coordinate access across processes or machines when one local lock is not enough.", ["Lease ownership", "Expiry", "Fencing tokens"], [["Problem first", "Two app servers can both try to process the same resource."], ["Correct use", "Use leases carefully, keep critical sections short, and use fencing tokens when stale owners can still write."], ["Interview phrasing", "I would prefer database constraints when possible and use distributed locks only when there is no single transactional owner."]], ["Trusting lock expiry alone.", "No fencing token."]),
      lesson("redis-setnx", "Redis SETNX", "Use Redis for simple lock acquisition with expiry, while understanding the failure modes.", ["SET NX PX", "Expiry", "Ownership token"], [["Problem first", "A process must acquire a shared lease before doing work."], ["Correct use", "Set a unique token with NX and expiry, and only release if the token still matches."], ["Interview phrasing", "I would discuss expiry, ownership tokens, and what happens if the worker pauses longer than the lease."]], ["Deleting another owner's lock.", "No plan for long pauses."]),
      lesson("zookeeper-locks", "ZooKeeper Locks", "Use ephemeral sequential nodes for stronger coordination patterns.", ["Ephemeral nodes", "Sequential ordering", "Watchers"], [["Problem first", "A system needs ordered lock acquisition with failure detection."], ["Correct use", "Create an ephemeral sequential node and watch the predecessor."], ["Interview phrasing", "ZooKeeper is heavier than Redis but gives stronger coordination primitives."]], ["Watching all nodes instead of predecessor.", "Ignoring session expiry."]),
      lesson("raft-paxos", "Raft And Paxos", "Understand consensus at a high level for replicated agreement.", ["Leader election", "Log replication", "Majority agreement"], [["Problem first", "Replicas must agree on one ordered history despite failures."], ["Correct use", "Use consensus to agree on commands, not as a casual replacement for every lock."], ["Interview phrasing", "I would describe Raft as a leader-based consensus protocol that replicates a log through majority agreement."]], ["Going too deep into math in an LLD answer.", "Confusing consensus with a mutex."]),
      lesson("cap-theorem", "CAP Theorem", "Understand the consistency and availability trade-off under network partitions.", ["Consistency", "Availability", "Partition tolerance"], [["Problem first", "A partition prevents all nodes from communicating."], ["Correct use", "Explain which property the system sacrifices for a given operation."], ["Interview phrasing", "Under partition, the system must choose whether to reject some operations or risk stale/conflicting results."]], ["Using CAP as a slogan.", "Ignoring operation-level choices."]),
      lesson("database-concurrency", "Database Concurrency", "Compare optimistic and pessimistic concurrency for database-backed state.", ["Row locks", "Version columns", "Unique constraints", "Isolation levels"], [["Problem first", "Two transactions update the same logical resource."], ["Correct use", "Use row locks when conflict is likely, optimistic versions when conflict is rare, and constraints as final guards."], ["Interview phrasing", "I would combine application logic with database guarantees so correctness does not depend only on app servers."]], ["Relying only on app locks.", "Ignoring transaction isolation."]),
      lesson("crdts", "CRDTs", "Use mergeable data structures when conflicts should resolve without central locking.", ["Commutative updates", "Convergent state", "Eventual consistency"], [["Problem first", "Distributed replicas need local writes and later convergence."], ["Correct use", "Use CRDTs when the data type has a safe merge rule."], ["Interview phrasing", "I would consider CRDTs when availability matters and the domain can tolerate merge-based convergence."]], ["Using CRDTs where conflicts need business judgment.", "Assuming every data type has a simple merge."]),
      lesson("event-sourcing", "Event Sourcing", "Avoid some distributed locks by recording events and deriving state from an ordered log.", ["Append-only log", "Replay", "Idempotent handlers"], [["Problem first", "Instead of mutating shared state everywhere, record facts in order."], ["Correct use", "Append events atomically, process handlers idempotently, and rebuild read models from the log."], ["Interview phrasing", "Event sourcing can reduce distributed locking by turning state changes into ordered events."]], ["No idempotency for handlers.", "Ignoring schema evolution."])
    ]
  },
  {
    id: "coding-problems",
    number: "Module 5",
    title: "Coding Problems",
    description: "Browser-evaluated practice problems grouped by difficulty.",
    lessons: [
      codingProblem(
        "thread-safe-stack",
        "Thread-Safe Stack",
        "Implement stack operations without corrupting internal state.",
        "beginner",
        ["Beginner", "Invariant protection", "LIFO contract"],
        [
          ["Problem shape", "A stack looks simple, but push, pop, and size must protect the same internal invariant. In multithreaded languages, those operations would sit behind one synchronization boundary."],
          ["Browser evaluation", "The in-browser runner checks the observable API contract: last-in-first-out behavior, empty pops, and size consistency after interleaved operations."],
          ["Interview focus", "Call out that JavaScript in this browser runner is single-threaded; the LLD answer should still explain where the lock or synchronization boundary would live in Java, Go, or Python."]
        ],
        ["Locking push but not pop.", "Returning references to mutable internal nodes."],
        {
          difficulty: "Beginner",
          exportName: "ThreadSafeStack",
          statement: [
            "Design a stack abstraction that exposes push, pop, peek, and size.",
            "The public methods must preserve the stack invariant even when callers perform many operations in different orders.",
            "In a real multithreaded implementation, all mutations and reads that depend on internal state should be protected by the same synchronization boundary."
          ],
          requirements: [
            "push(value) adds value to the top of the stack.",
            "pop() removes and returns the top value, or undefined when the stack is empty.",
            "peek() returns the top value without removing it, or undefined when empty.",
            "size() returns the current number of items.",
            "Do not expose the internal backing array or node structure."
          ],
          starterCode: `class ThreadSafeStack {
  constructor() {
    this.items = [];
  }

  push(value) {
    // TODO: add value to the top.
  }

  pop() {
    // TODO: remove and return the top value.
  }

  peek() {
    // TODO: return the top value without removing it.
  }

  size() {
    return this.items.length;
  }
}`,
          tests: [
            {
              name: "preserves LIFO order",
              code: `const { ThreadSafeStack } = submission;
const stack = new ThreadSafeStack();
stack.push("first");
stack.push("second");
stack.push("third");
assert.equal(stack.pop(), "third");
assert.equal(stack.pop(), "second");
assert.equal(stack.pop(), "first");`
            },
            {
              name: "handles empty and peek behavior",
              code: `const { ThreadSafeStack } = submission;
const stack = new ThreadSafeStack();
assert.equal(stack.pop(), undefined);
stack.push(42);
assert.equal(stack.peek(), 42);
assert.equal(stack.size(), 1);
assert.equal(stack.pop(), 42);
assert.equal(stack.size(), 0);`
            }
          ]
        }
      ),
      codingProblem(
        "simple-semaphore-problem",
        "Simple Semaphore",
        "Implement acquire and release with a fixed permit count.",
        "beginner",
        ["Beginner", "Permit accounting", "Async waiting"],
        [
          ["Problem shape", "A semaphore protects a finite number of equivalent resources. When no permits are available, callers wait instead of spinning."],
          ["Browser evaluation", "The runner uses promises to model waiting callers and checks that blocked acquirers resume only after a permit is released."],
          ["Interview focus", "Explain the same design as a lock plus condition variable in Java/Python or a channel-like permit queue in Go."]
        ],
        ["Using if instead of while around a wait.", "Allowing permits to exceed the configured capacity."],
        {
          difficulty: "Beginner",
          exportName: "SimpleSemaphore",
          statement: [
            "Build a counting semaphore with a fixed capacity.",
            "Each acquire consumes one permit. If no permit exists, acquire should wait asynchronously until release makes a permit available.",
            "release gives one permit back and wakes exactly one waiter when possible."
          ],
          requirements: [
            "constructor(permits) rejects negative capacity by throwing an Error.",
            "acquire() returns a Promise that resolves after the caller owns a permit.",
            "release() returns a permit, but must not increase available permits above capacity.",
            "availablePermits() returns the number of currently free permits."
          ],
          starterCode: `class SimpleSemaphore {
  constructor(permits) {
    this.capacity = permits;
    this.permits = permits;
    this.waiters = [];
  }

  async acquire() {
    // TODO: resolve immediately when a permit exists,
    // otherwise wait until release wakes this caller.
  }

  release() {
    // TODO: return one permit or wake one waiter.
  }

  availablePermits() {
    return this.permits;
  }
}`,
          tests: [
            {
              name: "tracks permits",
              code: `const { SimpleSemaphore } = submission;
const semaphore = new SimpleSemaphore(2);
await semaphore.acquire();
await semaphore.acquire();
assert.equal(semaphore.availablePermits(), 0);
semaphore.release();
assert.equal(semaphore.availablePermits(), 1);`
            },
            {
              name: "waits when no permits are free",
              code: `const { SimpleSemaphore } = submission;
const semaphore = new SimpleSemaphore(1);
await semaphore.acquire();
let acquired = false;
const pending = semaphore.acquire().then(() => { acquired = true; });
await delay(25);
assert.equal(acquired, false);
semaphore.release();
await pending;
assert.equal(acquired, true);
assert.equal(semaphore.availablePermits(), 0);`
            }
          ]
        }
      ),
      codingProblem(
        "bounded-blocking-queue",
        "Bounded Blocking Queue",
        "Build a queue where producers wait when full and consumers wait when empty.",
        "intermediate",
        ["Intermediate", "Producer-consumer", "Backpressure"],
        [
          ["Problem shape", "A bounded queue creates backpressure. Producers should not grow memory forever, and consumers should not busy-wait for work."],
          ["Browser evaluation", "The runner models blocking with promises and checks FIFO order plus full/empty waiting behavior."],
          ["Interview focus", "Map enqueue/dequeue waits to notFull and notEmpty condition variables, or to a language-provided blocking queue."]
        ],
        ["Waking the wrong side.", "Forgetting to handle both full and empty waiters."],
        {
          difficulty: "Intermediate",
          exportName: "BoundedBlockingQueue",
          statement: [
            "Implement a fixed-capacity FIFO queue.",
            "enqueue(value) should wait while the queue is full.",
            "dequeue() should wait while the queue is empty.",
            "The queue must preserve FIFO ordering under alternating producers and consumers."
          ],
          requirements: [
            "constructor(capacity) throws an Error for capacity less than 1.",
            "enqueue(value) returns a Promise that resolves once value is stored.",
            "dequeue() returns a Promise resolving to the next queued value.",
            "size() returns the current number of buffered items."
          ],
          starterCode: `class BoundedBlockingQueue {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = [];
  }

  async enqueue(value) {
    // TODO: wait while full, then enqueue.
  }

  async dequeue() {
    // TODO: wait while empty, then dequeue.
  }

  size() {
    return this.items.length;
  }
}`,
          tests: [
            {
              name: "preserves FIFO order",
              code: `const { BoundedBlockingQueue } = submission;
const queue = new BoundedBlockingQueue(3);
await queue.enqueue("A");
await queue.enqueue("B");
assert.equal(await queue.dequeue(), "A");
assert.equal(await queue.dequeue(), "B");
assert.equal(queue.size(), 0);`
            },
            {
              name: "blocks producer while full",
              code: `const { BoundedBlockingQueue } = submission;
const queue = new BoundedBlockingQueue(1);
await queue.enqueue("first");
let secondStored = false;
const pending = queue.enqueue("second").then(() => { secondStored = true; });
await delay(25);
assert.equal(secondStored, false);
assert.equal(await queue.dequeue(), "first");
await pending;
assert.equal(secondStored, true);
assert.equal(await queue.dequeue(), "second");`
            }
          ]
        }
      ),
      codingProblem(
        "rate-limiter",
        "Rate Limiter",
        "Limit requests per key under concurrent access.",
        "intermediate",
        ["Intermediate", "Atomic check-update", "Time windows"],
        [
          ["Problem shape", "A rate limiter is a check-and-update problem. If the check and increment are not atomic in a real concurrent system, bursts can pass the limit."],
          ["Browser evaluation", "The runner checks a sliding-window style contract using explicit timestamps, so the behavior is deterministic."],
          ["Interview focus", "Discuss per-key locking, atomic counters, Redis sorted sets, or database constraints depending on scale."]
        ],
        ["Separating check from increment.", "Letting old timestamps grow memory forever."],
        {
          difficulty: "Intermediate",
          exportName: "RateLimiter",
          statement: [
            "Implement a per-key rate limiter.",
            "Each key can make at most limit successful requests inside a rolling window of windowMs milliseconds.",
            "The method should return true when a request is allowed and false when it is rejected."
          ],
          requirements: [
            "constructor(limit, windowMs) stores the policy.",
            "allow(key, timestampMs) records the request only if it is allowed.",
            "Old events outside the window should be removed.",
            "Different keys must not affect each other."
          ],
          starterCode: `class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.eventsByKey = new Map();
  }

  allow(key, timestampMs) {
    // TODO: keep only timestamps in the rolling window,
    // then atomically decide and record.
    return true;
  }
}`,
          tests: [
            {
              name: "enforces per-key limit",
              code: `const { RateLimiter } = submission;
const limiter = new RateLimiter(2, 1000);
assert.equal(limiter.allow("user-1", 1000), true);
assert.equal(limiter.allow("user-1", 1100), true);
assert.equal(limiter.allow("user-1", 1200), false);
assert.equal(limiter.allow("user-2", 1200), true);`
            },
            {
              name: "expires old requests",
              code: `const { RateLimiter } = submission;
const limiter = new RateLimiter(2, 1000);
assert.equal(limiter.allow("u", 0), true);
assert.equal(limiter.allow("u", 100), true);
assert.equal(limiter.allow("u", 999), false);
assert.equal(limiter.allow("u", 1001), true);`
            }
          ]
        }
      ),
      codingProblem(
        "publish-subscribe-bus",
        "Publish-Subscribe Bus",
        "Deliver events without corrupting subscription state.",
        "intermediate",
        ["Intermediate", "Snapshot iteration", "Failure isolation"],
        [
          ["Problem shape", "Publish-subscribe looks like a list traversal until subscribers add, remove, or throw while publishing is in progress."],
          ["Browser evaluation", "The runner checks subscribe, unsubscribe, publish order, and isolation from failing handlers."],
          ["Interview focus", "Avoid holding a global lock while invoking subscriber code. Snapshot or copy-on-write iteration is usually cleaner."]
        ],
        ["Calling subscribers while holding a mutation lock.", "Letting one failing subscriber stop all delivery."],
        {
          difficulty: "Intermediate",
          exportName: "PubSubBus",
          statement: [
            "Design a topic-based in-memory publish-subscribe bus.",
            "Subscribers register handlers for a topic and receive later published events for that topic.",
            "Unsubscribe should stop future deliveries without corrupting the subscriber list during an active publish."
          ],
          requirements: [
            "subscribe(topic, handler) returns an unsubscribe function.",
            "publish(topic, event) invokes current subscribers for that topic.",
            "Publishing to one topic must not call subscribers of another topic.",
            "A throwing subscriber must not prevent other subscribers from receiving the event."
          ],
          starterCode: `class PubSubBus {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(topic, handler) {
    // TODO: store handler and return an unsubscribe function.
  }

  publish(topic, event) {
    // TODO: deliver to a stable snapshot of subscribers.
  }
}`,
          tests: [
            {
              name: "delivers and unsubscribes",
              code: `const { PubSubBus } = submission;
const bus = new PubSubBus();
const seen = [];
const unsubscribe = bus.subscribe("orders", (event) => seen.push(event.id));
bus.publish("orders", { id: 1 });
unsubscribe();
bus.publish("orders", { id: 2 });
assert.deepEqual(seen, [1]);`
            },
            {
              name: "isolates subscriber failures",
              code: `const { PubSubBus } = submission;
const bus = new PubSubBus();
const seen = [];
bus.subscribe("topic", () => { throw new Error("boom"); });
bus.subscribe("topic", (event) => seen.push(event.value));
bus.publish("topic", { value: "ok" });
assert.deepEqual(seen, ["ok"]);`
            }
          ]
        }
      ),
      codingProblem(
        "thread-pool",
        "Thread Pool From Scratch",
        "Implement bounded worker concurrency and shutdown behavior.",
        "advanced",
        ["Advanced", "Worker lifecycle", "Backpressure"],
        [
          ["Problem shape", "A thread pool limits concurrent execution and gives callers a predictable lifecycle for accepting, running, and rejecting work."],
          ["Browser evaluation", "The runner models workers with promises and checks max concurrency plus rejection after shutdown."],
          ["Interview focus", "In a real LLD answer, define queue bounds, rejection policy, worker loop, graceful drain, and immediate shutdown separately."]
        ],
        ["Accepting tasks after shutdown.", "Starting unbounded work instead of respecting worker count."],
        {
          difficulty: "Advanced",
          exportName: "ThreadPool",
          statement: [
            "Build a small asynchronous thread-pool abstraction.",
            "submit(task) accepts a function returning a value or promise and returns a Promise for the task result.",
            "At most workerCount tasks may run at the same time."
          ],
          requirements: [
            "constructor(workerCount) throws an Error when workerCount is less than 1.",
            "submit(task) queues work and resolves/rejects with the task result.",
            "No more than workerCount tasks may execute concurrently.",
            "shutdown() prevents new submissions and resolves when accepted work is drained."
          ],
          starterCode: `class ThreadPool {
  constructor(workerCount) {
    this.workerCount = workerCount;
    this.closed = false;
  }

  submit(task) {
    // TODO: queue task and run with bounded concurrency.
    return Promise.resolve().then(task);
  }

  async shutdown() {
    // TODO: reject future submissions and wait for queued work.
    this.closed = true;
  }
}`,
          tests: [
            {
              name: "respects worker concurrency",
              code: `const { ThreadPool } = submission;
const pool = new ThreadPool(2);
let active = 0;
let maxActive = 0;
const tasks = Array.from({ length: 6 }, (_, index) =>
  pool.submit(async () => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await delay(20);
    active -= 1;
    return index;
  })
);
assert.deepEqual(await Promise.all(tasks), [0, 1, 2, 3, 4, 5]);
assert.ok(maxActive <= 2, "more than two tasks ran at once");`
            },
            {
              name: "rejects after shutdown",
              code: `const { ThreadPool } = submission;
const pool = new ThreadPool(1);
await pool.shutdown();
await assert.rejects(() => pool.submit(() => "late"));`
            }
          ]
        }
      ),
      codingProblem(
        "lock-free-queue",
        "Lock-Free Queue",
        "Implement the observable behavior of a FIFO queue and reason about lock-free trade-offs.",
        "advanced",
        ["Advanced", "FIFO invariant", "CAS reasoning"],
        [
          ["Problem shape", "In Java or C++, lock-free queues use compare-and-swap loops to coordinate head and tail updates. The browser runner focuses on the public queue contract."],
          ["Browser evaluation", "The runner checks empty behavior, FIFO ordering, and alternating enqueue/dequeue sequences."],
          ["Interview focus", "Be clear that lock-free does not mean wait-free, and mention ABA or memory reclamation when discussing real lock-free implementations."]
        ],
        ["Assuming lock-free means every operation finishes in bounded steps.", "Ignoring ABA and memory reclamation."],
        {
          difficulty: "Advanced",
          exportName: "LockFreeQueue",
          statement: [
            "Implement a FIFO queue API.",
            "For the interview explanation, describe how a production lock-free implementation would protect head and tail updates with atomic compare-and-swap.",
            "For browser evaluation, implement the correct observable API behavior."
          ],
          requirements: [
            "enqueue(value) appends a value.",
            "dequeue() returns the oldest value, or undefined when empty.",
            "size() returns the number of queued values.",
            "Do not expose the internal backing storage."
          ],
          starterCode: `class LockFreeQueue {
  constructor() {
    this.items = [];
  }

  enqueue(value) {
    // TODO: append value.
  }

  dequeue() {
    // TODO: remove and return the oldest value.
  }

  size() {
    return this.items.length;
  }
}`,
          tests: [
            {
              name: "preserves FIFO order",
              code: `const { LockFreeQueue } = submission;
const queue = new LockFreeQueue();
queue.enqueue("A");
queue.enqueue("B");
queue.enqueue("C");
assert.equal(queue.dequeue(), "A");
assert.equal(queue.dequeue(), "B");
assert.equal(queue.dequeue(), "C");
assert.equal(queue.dequeue(), undefined);`
            },
            {
              name: "supports alternating operations",
              code: `const { LockFreeQueue } = submission;
const queue = new LockFreeQueue();
queue.enqueue(1);
assert.equal(queue.dequeue(), 1);
queue.enqueue(2);
queue.enqueue(3);
assert.equal(queue.size(), 2);
assert.equal(queue.dequeue(), 2);
queue.enqueue(4);
assert.deepEqual([queue.dequeue(), queue.dequeue()], [3, 4]);`
            }
          ]
        }
      ),
      codingProblem(
        "read-write-lock-implementation",
        "Read-Write Lock Implementation",
        "Allow concurrent readers while keeping writers exclusive.",
        "advanced",
        ["Advanced", "Reader concurrency", "Writer exclusivity"],
        [
          ["Problem shape", "A read-write lock improves read-heavy workloads by allowing many readers together, but every writer must be exclusive."],
          ["Browser evaluation", "The runner models readers and writers with promises and checks reader overlap plus writer exclusion."],
          ["Interview focus", "Discuss fairness explicitly. Reader-preference designs can starve writers; writer-preference designs can reduce read throughput."]
        ],
        ["Ignoring fairness policy.", "Not rechecking state after a waiting operation resumes."],
        {
          difficulty: "Advanced",
          exportName: "ReadWriteLock",
          statement: [
            "Implement an asynchronous read-write lock.",
            "read(fn) should run fn while shared read access is held.",
            "write(fn) should run fn only when no reader or writer is active."
          ],
          requirements: [
            "Multiple read(fn) calls may overlap.",
            "write(fn) must not overlap with any reader or writer.",
            "read(fn) and write(fn) resolve or reject with fn's result.",
            "The lock must release even when fn throws."
          ],
          starterCode: `class ReadWriteLock {
  constructor() {
    this.activeReaders = 0;
    this.activeWriter = false;
  }

  async read(fn) {
    // TODO: allow concurrent readers unless a writer owns the lock.
    return fn();
  }

  async write(fn) {
    // TODO: wait for readers/writers, then run exclusively.
    return fn();
  }
}`,
          tests: [
            {
              name: "allows readers to overlap",
              code: `const { ReadWriteLock } = submission;
const lock = new ReadWriteLock();
let activeReaders = 0;
let maxReaders = 0;
await Promise.all([1, 2, 3].map(() =>
  lock.read(async () => {
    activeReaders += 1;
    maxReaders = Math.max(maxReaders, activeReaders);
    await delay(20);
    activeReaders -= 1;
  })
));
assert.ok(maxReaders > 1, "readers did not overlap");`
            },
            {
              name: "keeps writer exclusive",
              code: `const { ReadWriteLock } = submission;
const lock = new ReadWriteLock();
let activeReaders = 0;
let writerSawReader = false;
const reader = lock.read(async () => {
  activeReaders += 1;
  await delay(30);
  activeReaders -= 1;
});
await delay(5);
await lock.write(async () => {
  writerSawReader = activeReaders > 0;
});
await reader;
assert.equal(writerSawReader, false);`
            }
          ]
        }
      )
    ]
  }
];

export const allConcurrencyLessons = concurrencyModules.flatMap((module) =>
  module.lessons.map((item) => ({
    ...item,
    module: {
      id: module.id,
      number: module.number,
      title: module.title
    }
  }))
);

export function getConcurrencyLesson(slug) {
  return allConcurrencyLessons.find((item) => item.slug === slug);
}

export function getAdjacentConcurrencyLessons(slug) {
  const index = allConcurrencyLessons.findIndex((item) => item.slug === slug);
  return {
    previous: index > 0 ? allConcurrencyLessons[index - 1] : null,
    next: index >= 0 && index < allConcurrencyLessons.length - 1 ? allConcurrencyLessons[index + 1] : null
  };
}
