---
title: Apache ZooKeeper
slug: zookeeper
summary: Interview-focused guide to ZooKeeper coordination, znodes, sessions, watches, Zab, quorum, recipes, failure handling, security, operations, and capacity planning.
tags:
  - distributed-systems
  - coordination
  - consensus
  - zookeeper
difficulty: intermediate
---

# Apache ZooKeeper

Apache ZooKeeper is a distributed coordination service used by applications to agree on small pieces of shared state.

It is commonly used for:

- Leader election.
- Cluster membership.
- Service discovery.
- Distributed locks and leases.
- Configuration distribution.
- Naming and metadata.
- Shard ownership.
- Barriers and coordination between workers.

> **One-line interview definition:** ZooKeeper is a replicated coordination service that exposes a hierarchical namespace of small znodes, ordered updates, sessions, ephemeral nodes and watches so distributed applications can build coordination primitives safely.

ZooKeeper should store:

```text
small coordination metadata
```

not:

```text
large application records
logs
messages
files
analytical data
```

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper in a distributed system
What to use: Applications and distributed workers using a three- or five-node ZooKeeper ensemble for leader election, membership, configuration and locks, while business data remains in separate databases and object stores.
Preferred source: Apache ZooKeeper homepage, overview and use-case documentation.
Search terms: site:zookeeper.apache.org ZooKeeper distributed coordination architecture use cases
Purpose: Establish ZooKeeper as a coordination layer rather than a general-purpose database.
Alt text: Distributed applications use a ZooKeeper ensemble for coordination metadata while storing business data elsewhere.
Editorial note: Verify the image licence before publishing. Prefer an official Apache ZooKeeper diagram. If no clear reusable image exists, create an original Excalidraw diagram from the official documentation.
-->

# 1. Why ZooKeeper Exists

Distributed processes need to agree on questions such as:

```text
Who is the current leader?
Which workers are alive?
Who owns shard 17?
What is the current configuration version?
Has every worker reached the barrier?
Who holds the lock?
```

Solving these using ordinary database rows, files or ad-hoc heartbeats is difficult because of:

- Process crashes.
- Network partitions.
- Delayed messages.
- Duplicate requests.
- Concurrent updates.
- Paused processes.
- Partial failures.
- Leader failover.

ZooKeeper provides a small set of primitives with well-defined ordering and failure semantics. Higher-level recipes are built on top of those primitives.

## 2. Coordination Kernel, Not a Recipe Server

ZooKeeper directly provides:

- A hierarchical namespace.
- Atomic znode operations.
- Versions.
- Sessions.
- Ephemeral znodes.
- Sequential znodes.
- Watches.
- Multi-operation transactions.
- Replicated ordered updates.

It does not directly provide a command named:

```text
acquireDistributedLock()
electLeader()
assignShards()
```

Client libraries implement these recipes using ZooKeeper primitives.

This distinction matters because recipe correctness depends on:

- Znode layout.
- Watch placement.
- Retry handling.
- Session expiration.
- Fencing.
- Cleanup.

## 3. Why a Normal Database Is Not Always Enough

A transactional database can implement some coordination patterns with:

- Unique rows.
- Transactions.
- Compare-and-set updates.
- Advisory locks.

ZooKeeper is useful when the coordination state must also provide:

- Ephemeral ownership tied to a client session.
- Ordered sequence numbers.
- Change notifications.
- Replicated failover-oriented coordination.
- Hierarchical metadata.
- Large numbers of read-heavy coordination clients.

Do not use ZooKeeper merely because a system is distributed. Use it when the application needs coordination semantics that justify the operational dependency.

<!-- IMAGE PLACEHOLDER
Title: The distributed coordination problem
What to use: Three workers concurrently trying to become leader or claim the same shard, with crashes and delayed messages, contrasted with all workers coordinating through ZooKeeper.
Preferred source: Create an original diagram based on the Apache ZooKeeper overview and recipes documentation.
Search terms: Apache ZooKeeper leader election coordination problem
Purpose: Explain the class of races ZooKeeper is intended to solve.
Alt text: Without coordination, several workers can claim the same role; ZooKeeper serializes the coordination decision.
Editorial note: Use an original diagram if the official documentation has no suitable reusable visual.
-->

# When to Use ZooKeeper

## 4. Good Use Cases

ZooKeeper is a good fit when most of the following are true:

- The shared state is small.
- Updates are less frequent than reads.
- Processes need notifications when coordination state changes.
- Ownership must disappear after a session expires.
- A total order of coordination updates is useful.
- The system needs leader election or membership.
- The application can tolerate unavailability when a quorum is lost.
- The team can operate a quorum-based stateful service.

Typical use cases:

- Elect one controller among replicas.
- Track live brokers or workers.
- Store shard-to-worker assignments.
- Publish a small configuration version.
- Implement a distributed mutex.
- Coordinate rolling work.
- Allocate monotonically ordered contenders.
- Maintain service instance membership.

## 5. When Not to Use ZooKeeper

Avoid ZooKeeper for:

- Large values.
- High-volume event ingestion.
- Queuing millions of messages.
- Log storage.
- Analytical queries.
- Full-text search.
- Frequently updated counters.
- Large service payloads.
- General application CRUD.
- Object storage.
- Strongly isolated business transactions.
- Coordination that a simpler managed primitive already provides.

| Requirement | Better starting choice |
|---|---|
| Business records and transactions | PostgreSQL or another transactional database |
| Event streaming and replay | Kafka |
| Hot cache and counters | Redis |
| Large analytical scans | ClickHouse |
| Service discovery with health checks and DNS | Consul or platform-native discovery |
| Kubernetes-native leader election | Kubernetes Lease API |
| Small distributed coordination metadata | ZooKeeper |

## 6. ZooKeeper vs Application Data

Good znode data:

```json
{
  "leaderId": "controller-7",
  "epoch": 42
}
```

Bad znode data:

```text
100 MB model file
large JSON document
complete customer profile
millions of queued jobs
```

The default maximum buffer is just under 1 MiB, but operationally znodes should normally be much smaller.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper workload decision tree
What to use: A decision tree separating small coordination metadata from business data, cache, queues, logs and analytics.
Preferred source: Create an original diagram using Apache ZooKeeper programmer and administrator guidance.
Search terms: ZooKeeper when to use small data coordination not database
Purpose: Prevent misuse of ZooKeeper as a general database.
Alt text: Small ordered coordination state goes to ZooKeeper, while business data and high-volume workloads use specialized systems.
Editorial note: Include the one-megabyte default limit only as a protocol/configuration reference, not as a recommended znode size.
-->

# ZooKeeper Mental Model

## 7. Ensemble

A group of ZooKeeper servers is called an ensemble.

Common production sizes:

```text
3 servers
5 servers
```

One server is elected leader. Other voting servers are followers. Non-voting read-scaling members are observers.

The ensemble can process writes only when a quorum of voting members can communicate.

## 8. Leader

The leader:

- Orders write proposals.
- Coordinates Zab broadcast.
- Receives forwarded writes from followers and observers.
- Waits for quorum acknowledgement.
- Commits transactions.

The leader is not the only server that clients can connect to.

## 9. Follower

A follower:

- Participates in leader election.
- Votes in the write quorum.
- Stores the replicated state.
- Serves client reads locally.
- Forwards client writes to the leader.
- Applies committed transactions in order.

## 10. Observer

An observer:

- Stores a replicated copy.
- Serves reads.
- Forwards writes.
- Does not vote in leader election or write quorum.

Use observers when:

- Read capacity must grow.
- Remote sites need a local read-serving member.
- Adding more voters would increase quorum communication cost.

Trade-offs:

- Observer reads can be stale.
- Observers do not improve write fault tolerance.
- They still consume replication bandwidth.
- Remote observers add propagation delay.

## 11. Client

A client connects to one server from a connection string:

```text
zk1:2181,zk2:2181,zk3:2181
```

The connected server handles reads locally and forwards writes when necessary.

If the connection breaks, the client library can reconnect to another server while preserving the same session, provided the session has not expired.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper ensemble roles
What to use: A five-server ensemble with one leader, three followers or two followers plus observers, and clients connected to different servers. Show writes forwarded to the leader and reads served locally.
Preferred source: Apache ZooKeeper overview, programmer guide and observers guide.
Search terms: site:zookeeper.apache.org ZooKeeper leader follower observer architecture diagram
Purpose: Explain permanent server roles during one leader epoch and client routing.
Alt text: Clients connect to any ZooKeeper server; followers and observers serve reads while writes are ordered by the leader.
Editorial note: Clearly distinguish voting followers from non-voting observers.
-->

## 12. Odd Ensemble Sizes

Without weighted quorums, a majority is required.

| Voting servers | Quorum | Failures tolerated |
|---:|---:|---:|
| 1 | 1 | 0 |
| 2 | 2 | 0 |
| 3 | 2 | 1 |
| 4 | 3 | 1 |
| 5 | 3 | 2 |
| 7 | 4 | 3 |

A four-node ensemble tolerates the same number of failures as a three-node ensemble but requires a larger quorum.

Therefore:

```text
3 or 5 voters
```

are common choices.

## 13. Quorum Is About Voters

Observers do not count toward quorum.

Example:

```text
3 voters + 10 observers
quorum = 2 voters
```

Losing two voters stops writes even if all ten observers remain healthy.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper quorum mathematics
What to use: Side-by-side 3-, 4- and 5-voter ensembles showing majority size and tolerated failures.
Preferred source: Apache ZooKeeper overview and administrator guide.
Search terms: ZooKeeper quorum majority ensemble size 3 5
Purpose: Explain why odd voter counts are preferred.
Alt text: Three voters tolerate one failure, four voters still tolerate one, and five voters tolerate two.
Editorial note: Mention that advanced weighted quorum configurations exist, but keep the main visual on ordinary majority quorum.
-->

# Hierarchical Namespace

## 14. Znodes

ZooKeeper stores data in a tree of znodes.

Example:

```text
/
├── config
│   ├── database
│   └── feature-flags
├── services
│   └── payment
│       ├── instance-0000000012
│       └── instance-0000000013
└── elections
    └── scheduler
        ├── candidate-0000000041
        └── candidate-0000000042
```

A znode has:

- A path.
- A byte-array value.
- Children.
- Metadata called `Stat`.
- ACLs.
- A creation mode.

Unlike a file system, a znode can contain both data and children.

## 15. Path Rules

Paths are absolute:

```text
/app/config
/services/search/instance-1
```

Important rules:

- `/` is the root.
- Path components are separated by `/`.
- Relative paths are not used.
- The namespace should be stable and intentional.
- Avoid one flat root containing millions of unrelated children.

## 16. Znode Data

Znode data is an opaque byte array to ZooKeeper.

The application defines encoding:

- JSON.
- Protobuf.
- Avro.
- UTF-8 text.
- Binary custom format.

Include an explicit schema version when the payload evolves.

Example:

```json
{
  "schemaVersion": 2,
  "maxWorkers": 50,
  "rollout": "blue"
}
```

## 17. `Stat` Metadata

A znode's stat contains metadata such as:

- `czxid`: transaction ID that created the znode.
- `mzxid`: transaction ID of the last data change.
- `pzxid`: transaction ID of the last child-list change.
- `ctime`: creation time.
- `mtime`: last modification time.
- `version`: data version.
- `cversion`: child-list version.
- `aversion`: ACL version.
- `ephemeralOwner`: owning session for an ephemeral node.
- `dataLength`.
- `numChildren`.

Versions are used for optimistic concurrency.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper znode tree
What to use: A tree containing configuration, service instances, election candidates and shard assignments, with one znode expanded to show data, Stat, ACL and children.
Preferred source: Apache ZooKeeper programmer guide and overview.
Search terms: site:zookeeper.apache.org ZooKeeper znode tree namespace stat
Purpose: Make the hierarchical data model concrete.
Alt text: ZooKeeper stores small byte values and metadata in a hierarchical tree of znodes.
Editorial note: Use application-oriented node names rather than file-system icons that imply large file storage.
-->

## 18. Persistent Znode

A persistent znode remains until explicitly deleted.

Use for:

- Configuration roots.
- Assignment metadata.
- Election parent paths.
- Service namespaces.
- Durable small metadata.

Example:

```text
/config/payment-service
```

## 19. Ephemeral Znode

An ephemeral znode is tied to a ZooKeeper session.

When the session expires:

```text
the ephemeral znode is removed
```

Use for:

- Live membership.
- Leader ownership.
- Lock contenders.
- Service registration.

An ephemeral znode cannot have children.

Important:

```text
TCP disconnect != session expiration
```

A briefly disconnected client still owns its ephemeral nodes until the session expires or closes.

## 20. Sequential Znode

A sequential create appends a monotonically increasing sequence number to the requested prefix.

Requested:

```text
/lock/request-
```

Created:

```text
/lock/request-0000000042
```

Sequential znodes provide ordering among contenders under the same parent.

Use for:

- Lock queues.
- Leader-election candidates.
- Ordered work allocation.
- Fencing-token derivation.

## 21. Ephemeral Sequential Znode

Combining both flags creates a znode that:

- Is tied to the client's session.
- Has an ordered sequence suffix.

This is the foundation of many ZooKeeper recipes.

## 22. Container Znode

A container znode can be automatically removed after its last child is deleted, subject to server cleanup behavior.

Use it as a convenience for recipe parent paths, not when the parent must always exist.

Applications must tolerate the container disappearing and being recreated.

## 23. TTL Znode

TTL node modes allow selected persistent nodes to be deleted after a configured inactivity period.

This feature is version- and configuration-sensitive.

Do not use TTL nodes as an exact scheduler. Cleanup is asynchronous.

Use only after verifying:

- Server version.
- Feature enablement.
- Client support.
- Operational cleanup timing.

<!-- IMAGE PLACEHOLDER
Title: Znode creation modes
What to use: Four or five panels comparing persistent, ephemeral, sequential, ephemeral-sequential, container and TTL nodes with their lifecycle triggers.
Preferred source: Apache ZooKeeper programmer guide and create-mode API documentation.
Search terms: site:zookeeper.apache.org ZooKeeper persistent ephemeral sequential container TTL node
Purpose: Show which znode type fits each coordination pattern.
Alt text: ZooKeeper znode modes differ by whether they survive sessions, receive sequence suffixes or are cleaned automatically.
Editorial note: Label TTL and container cleanup as asynchronous and version-sensitive.
-->

# API Operations and Versions

## 24. Core Operations

Common operations:

```text
create
exists
getData
setData
getChildren
delete
getACL
setACL
sync
multi
```

Each operation acts on a znode path.

## 25. Compare-and-Set with Versions

Read:

```text
value, stat = getData(path)
```

Conditional update:

```text
setData(path, newValue, expectedVersion)
```

If another client updated the znode first, the version no longer matches and the operation fails.

This prevents lost updates.

Unsafe:

```text
read value
modify locally
write with version = -1
```

Safe:

```text
read value and version
compute new value
write using expected version
retry on BadVersion
```

## 26. Conditional Delete

Delete can also include an expected version.

Use this to avoid deleting a znode that changed after it was read.

## 27. `multi`

`multi` executes a list of operations atomically.

Example:

```text
check /assignments/shard-7 version 12
set   /assignments/shard-7 worker-9
create /workers/worker-9/shards/7
```

Either all operations succeed or none are applied.

Limitations:

- The transaction is confined to ZooKeeper metadata.
- It does not include an external database or service.
- Large multi operations increase latency and memory.
- Retry ambiguity must still be handled.

## 28. `sync`

Reads can be served locally by the connected server and may be stale.

`sync(path)` asks the server to catch up with the leader before a subsequent read.

Use when a client needs a fresher view after events such as:

- Receiving an external signal that a write completed.
- Moving between servers.
- Coordinating a critical read after a write performed elsewhere.

`sync` is not a transaction with the subsequent read. The client must still reason about concurrent writes.

<!-- IMAGE PLACEHOLDER
Title: Optimistic concurrency with znode versions
What to use: Two clients read version 7; Client A writes version 8 successfully, while Client B's update using expected version 7 fails with BadVersion and retries.
Preferred source: Apache ZooKeeper programmer guide.
Search terms: ZooKeeper version setData BadVersion optimistic concurrency
Purpose: Explain compare-and-set semantics.
Alt text: ZooKeeper znode versions prevent a stale client from silently overwriting a newer value.
Editorial note: Show version `-1` as unconditional only in a warning annotation.
-->

<!-- IMAGE PLACEHOLDER
Title: Atomic multi operation
What to use: A multi request containing check, set and create operations, with an all-success path and an all-rollback path.
Preferred source: Apache ZooKeeper programmer guide and transaction API documentation.
Search terms: ZooKeeper multi transaction atomic operations
Purpose: Explain atomic metadata changes.
Alt text: ZooKeeper applies every operation in a multi request or applies none of them.
Editorial note: Explicitly show that external systems are outside the atomic boundary.
-->

# Sessions and Connections

## 29. Session

A session represents a client's logical relationship with the ZooKeeper ensemble.

A session has:

- Session ID.
- Session credentials/password.
- Negotiated timeout.
- Connection state.
- Ephemeral znodes.
- Watches.

The session can move from one server connection to another.

## 30. Heartbeats

The client and server exchange traffic to keep the session alive.

When the client has no application request, ping traffic prevents the session from timing out.

## 31. Session Timeout

The client requests a timeout, and the server negotiates one within configured bounds.

Trade-off:

### Short timeout

- Faster failure detection.
- Faster ephemeral cleanup.
- More false expiration risk during pauses or network delay.

### Long timeout

- More tolerant of temporary problems.
- Slower failover and stale ownership cleanup.

Choose based on:

- Network reliability.
- JVM pause behavior.
- Leader-election recovery target.
- Business tolerance for duplicate or unavailable ownership.

## 32. Connection States

Important client states include concepts such as:

- Connected.
- Disconnected.
- Read-only connected, when explicitly enabled and supported.
- Auth failed.
- Expired.
- Closed.

Client libraries expose exact state names and callbacks.

## 33. Disconnected State

Disconnected means the client currently has no active server connection.

It does not mean:

- Session has expired.
- Ephemeral nodes have been deleted.
- Lock ownership has definitely ended.
- Another leader has definitely been elected.

During disconnection, the client cannot know whether its last request committed.

## 34. Expired State

The ensemble decides that the session has expired.

Consequences:

- Ephemeral znodes are removed.
- Existing watches are lost.
- The old session cannot be resumed.
- The client must create a new session.
- Recipes must re-register and re-contend.

The client learns expiration only after reconnecting or receiving the state event.

## 35. Session Re-establishment

When reconnecting before expiration, the client presents session credentials and resumes the session on another server.

The server must be sufficiently up to date to accept the session.

## 36. Session Stealing

Two clients should not use the same session credentials concurrently.

A later connection can move the session and invalidate the earlier connection.

Treat session credentials as sensitive.

## 37. GC Pause Risk

A long stop-the-world pause can exceed the session timeout.

Scenario:

1. Client holds a lock.
2. Client pauses.
3. Session expires.
4. Another client acquires the lock.
5. Old client resumes and still believes it can act.

This is why correctness-critical locks require fencing tokens, not only ephemeral ownership.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper session across server reconnects
What to use: One client session first connected to Server A, network break, then reconnecting to Server C with the same session ID before timeout. Ephemeral nodes remain throughout.
Preferred source: Apache ZooKeeper programmer guide.
Search terms: ZooKeeper session reconnect different server ephemeral nodes
Purpose: Separate sessions from TCP connections.
Alt text: A ZooKeeper client can reconnect to another server without losing its session or ephemeral znodes.
Editorial note: Include a second branch where the timeout passes and the session expires.
-->

<!-- IMAGE PLACEHOLDER
Title: Disconnect vs session expiration
What to use: A timeline showing network disconnection, reconnect-before-timeout preserving ownership, and reconnect-after-timeout requiring a new session.
Preferred source: Apache ZooKeeper programmer guide.
Search terms: ZooKeeper disconnected expired session timeline
Purpose: Explain one of the most important client correctness distinctions.
Alt text: A temporary disconnect preserves the ZooKeeper session, while expiration removes ephemerals and invalidates ownership.
Editorial note: Mark the server ensemble—not the disconnected client—as the authority that expires a session.
-->

<!-- IMAGE PLACEHOLDER
Title: GC pause and stale lock owner
What to use: Client A holds a lease, pauses beyond session timeout, Client B acquires ownership, and Client A later resumes. Show a downstream resource rejecting Client A using an older fencing token.
Preferred source: Create an original diagram based on ZooKeeper lock recipes and distributed lease safety principles.
Search terms: ZooKeeper lock session expiration fencing token GC pause
Purpose: Explain why session-based ownership alone cannot fence a paused process.
Alt text: A fencing token prevents a resumed client with expired ZooKeeper ownership from modifying the protected resource.
Editorial note: This diagram is a critical interview concept; do not imply that ZooKeeper automatically fences external resources.
-->

# Watches

## 38. What a Watch Is

A watch is a notification that a znode-related condition changed.

A client can watch:

- Znode existence.
- Znode data.
- Child list.

Watches reduce polling.

## 39. Standard Watches Are One-Shot

Traditional watches trigger once.

After receiving the event, the client usually:

1. Reads current state.
2. Processes it.
3. Registers a new watch.

The watch event means:

```text
something changed
```

not:

```text
this event contains the complete new authoritative state
```

Always reread ZooKeeper.

## 40. Watch Types

### Exists watch

Registered through an existence check.

Can notify when a node is:

- Created.
- Deleted.
- Data changed, depending on API semantics.

### Data watch

Registered when reading node data.

Can notify when:

- Data changes.
- Node is deleted.

### Child watch

Registered when listing children.

Can notify when:

- A child is added.
- A child is removed.

It does not automatically watch every child's data.

## 41. Watch Ordering

ZooKeeper orders watch delivery relative to the updates observed by the client connection.

A client will not observe a new value through a successful read and only later receive the watch for the earlier change on that connection.

Applications should still treat callbacks as signals to reread state.

## 42. Watch Gap During Disconnection

During a disconnection, changes may occur before the client reconnects and re-establishes watches.

The client should:

- Treat reconnection as a reason to refresh state.
- Re-register required watches.
- Handle nodes that were created and deleted while disconnected.
- Avoid assuming one callback per state transition.

## 43. Persistent Watches

Modern ZooKeeper versions support persistent watches that remain registered after events.

Persistent recursive watches can cover a subtree.

Benefits:

- Less re-registration logic.
- Useful for caches and metadata trees.

Trade-offs:

- Larger server watch state.
- Event bursts.
- Client processing load.
- Version compatibility.

## 44. Watch Herd Effect

If thousands of clients watch the same znode, one change wakes all of them.

Example:

```text
all lock contenders watch /lock
```

On release, every contender races to acquire.

This creates:

- Network burst.
- CPU burst.
- Repeated failed operations.
- Latency spike.

Better lock recipe:

```text
each contender watches only its immediate predecessor
```

Only the next contender wakes when the lock is released.

<!-- IMAGE PLACEHOLDER
Title: One-shot watch lifecycle
What to use: Client reads with watch, server records watch, znode changes, one event is delivered, client rereads and registers the next watch.
Preferred source: Apache ZooKeeper programmer guide watches section.
Search terms: site:zookeeper.apache.org ZooKeeper one shot watch lifecycle
Purpose: Explain that standard watches must be re-established.
Alt text: A ZooKeeper one-shot watch fires once and the client rereads state before registering another watch.
Editorial note: Show the watch as a notification rather than a data stream.
-->

<!-- IMAGE PLACEHOLDER
Title: Watch types
What to use: A znode with separate exists, data and child-list watchers, showing which mutations trigger each watcher.
Preferred source: Apache ZooKeeper programmer guide.
Search terms: ZooKeeper exists data children watch events
Purpose: Differentiate commonly confused watch APIs.
Alt text: ZooKeeper supports watches on node existence, node data and the list of direct children.
Editorial note: Do not imply that a child watch observes descendant data changes.
-->

<!-- IMAGE PLACEHOLDER
Title: Watch gap during disconnect
What to use: Client disconnected while a znode changes several times, then reconnects and refreshes the current state instead of replaying every intermediate event.
Preferred source: Apache ZooKeeper programmer guide.
Search terms: ZooKeeper watches disconnected missed events reconnect
Purpose: Explain why watches are state-change notifications rather than a durable event log.
Alt text: A disconnected client refreshes ZooKeeper state after reconnecting because it may not receive every intermediate change.
Editorial note: Contrast with Kafka-style retained events.
-->

<!-- IMAGE PLACEHOLDER
Title: Herd effect vs predecessor watch
What to use: Left side: every lock contender watches the lock root and wakes together. Right side: each contender watches only the preceding sequential znode and only one wakes.
Preferred source: Apache ZooKeeper lock recipe documentation.
Search terms: site:zookeeper.apache.org ZooKeeper lock herd effect predecessor watch
Purpose: Teach the scalable lock recipe.
Alt text: Predecessor watches avoid waking every ZooKeeper lock contender when ownership changes.
Editorial note: Use ordered ephemeral sequential nodes in both panels.
-->

# ZooKeeper Guarantees

## 45. Sequential Consistency

Updates from one client are applied in the order that client issued them.

If a client successfully performs:

```text
set /config version=10
set /config version=11
```

ZooKeeper will not apply version 11 before version 10.

This is client-order consistency, not a claim that all local reads from every replica are always immediately current.

## 46. Atomicity

An update either succeeds or fails.

ZooKeeper does not expose a partially applied single operation.

A `multi` transaction similarly applies every listed operation or none.

## 47. Single System Image

A client sees the same service regardless of which server it connects to, subject to allowed replica staleness.

After reconnecting, the client should not be moved permanently backward behind a state it already observed through the session's ordering guarantees.

## 48. Reliability

After an update has been acknowledged and remains committed, it persists until overwritten by a later update.

Durability depends on:

- Quorum commit.
- Transaction logs.
- Server storage.
- Correct operational configuration.
- Backups for disaster recovery.

## 49. Timeliness

ZooKeeper aims to keep the system view current within a bounded operational time under normal conditions, but it is not a real-time system with a strict universal deadline.

Define application freshness explicitly.

## 50. Ordered Writes, Potentially Stale Reads

The most useful interview summary is:

```text
writes are globally ordered through the leader and quorum
reads are normally served by the connected server and may be stale
```

This is why ZooKeeper can scale read-heavy workloads better than a design where every read requires quorum.

## 51. Linearizability Terminology

ZooKeeper provides a total order for successful updates through Zab.

Do not casually claim:

```text
every ZooKeeper read is linearizable
```

A local follower or observer read can lag behind the leader.

Use:

- Same-client ordering.
- Watches.
- `sync` before a critical read.
- Application-specific validation.

when fresher read semantics are required.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper consistency model
What to use: A write passing through leader and quorum in one total order, while reads are served locally by leader, follower or observer with different freshness.
Preferred source: Apache ZooKeeper programmer guide guarantees and architecture overview.
Search terms: site:zookeeper.apache.org ZooKeeper guarantees sequential consistency stale reads sync
Purpose: Summarize ordered writes and local-read staleness.
Alt text: ZooKeeper totally orders writes through a quorum, while local replica reads can temporarily lag.
Editorial note: Avoid labeling every read as linearizable.
-->

# Zab and Transaction Ordering

## 52. What Zab Is

ZooKeeper Atomic Broadcast, commonly called Zab, is the protocol used to:

- Elect or establish a leader epoch.
- Synchronize followers with the leader.
- Broadcast transactions in a consistent order.
- Commit updates after quorum acknowledgement.
- Recover safely after leader failure.

ZooKeeper is not implemented as a simple primary-replica database with best-effort replication. The leader must preserve the committed transaction history across leadership changes.

## 53. `zxid`

Every ZooKeeper state-changing transaction receives a ZooKeeper transaction ID:

```text
zxid
```

A zxid identifies the global update order.

Conceptually it contains:

```text
leader epoch + transaction counter
```

A later committed transaction has a later ordering position.

Znode stat fields such as `czxid`, `mzxid` and `pzxid` reference this transaction history.

## 54. Leader Epoch

A new leadership term uses a new epoch.

The epoch prevents proposals from an old leader from being confused with proposals from a new leader.

## 55. Zab Phases

A useful conceptual model:

### Election

Servers exchange votes and select a leader candidate with an appropriate history.

### Discovery

The new leader determines the most recent accepted history and establishes a new epoch.

### Synchronization

Followers are brought into agreement with the leader's committed prefix.

A follower may need to:

- Receive missing transactions.
- Truncate uncommitted divergent transactions.
- Receive a snapshot when too far behind.

### Broadcast

The leader proposes new transactions, followers persist and acknowledge them, and the leader commits after quorum.

## 56. Committed Prefix Safety

A new leader must contain all transactions that were previously committed by a quorum.

Because any two majorities overlap, a committed transaction is represented in the election information of at least one member of the new quorum.

This quorum intersection is central to preventing two incompatible committed histories.

## 57. Zab vs Raft/Paxos

All solve agreement problems, but the APIs and protocol details differ.

ZooKeeper exposes:

- Hierarchical znodes.
- Sessions.
- Ephemeral nodes.
- Watches.
- Recipes.

Do not answer:

```text
ZooKeeper uses Raft
```

ZooKeeper uses Zab for atomic broadcast and recovery.

At interview level, compare concepts rather than pretending the protocols are identical:

| Concept | ZooKeeper Zab | Raft-style terminology |
|---|---|---|
| Leadership period | Epoch | Term |
| Ordered update identifier | zxid | Log index plus term |
| Voting replica | Participant/follower | Voting follower |
| Non-voting replica | Observer | Learner/non-voter |
| Committed update | Quorum-acknowledged transaction | Majority-replicated log entry |

<!-- IMAGE PLACEHOLDER
Title: Zab lifecycle
What to use: A circular or staged diagram showing election, discovery, synchronization and broadcast, followed by a leader failure returning to election.
Preferred source: Apache ZooKeeper internals, Zab paper or official documentation.
Search terms: Apache ZooKeeper Zab election discovery synchronization broadcast diagram
Purpose: Provide a high-level protocol mental model without excessive algorithm detail.
Alt text: Zab elects a leader, synchronizes replica histories and then broadcasts ordered transactions until leadership changes.
Editorial note: Prefer an original diagram based on the official protocol description if no current official illustration is available.
-->

<!-- IMAGE PLACEHOLDER
Title: zxid structure and ordering
What to use: A sequence of zxids grouped into two leader epochs, with transaction counters increasing inside each epoch and a leader change between groups.
Preferred source: Apache ZooKeeper programmer guide and internals documentation.
Search terms: ZooKeeper zxid epoch counter diagram
Purpose: Explain global transaction ordering and leadership terms.
Alt text: ZooKeeper zxids combine a leader epoch with an increasing transaction counter.
Editorial note: Present the structure conceptually; avoid relying on bit-layout details that are unnecessary for HLD interviews.
-->

<!-- IMAGE PLACEHOLDER
Title: Quorum intersection preserves committed history
What to use: Two overlapping majorities in a five-server ensemble, with a committed transaction present on the overlap member used during the next election.
Preferred source: Create an original diagram based on Zab quorum safety.
Search terms: ZooKeeper quorum intersection committed transaction new leader
Purpose: Explain why a new leader cannot safely omit a previously committed update.
Alt text: Overlapping ZooKeeper quorums ensure that a committed transaction is represented during a later leader election.
Editorial note: Keep the proof intuitive rather than protocol-formal.
-->

# Write Path

## 58. End-to-End Write Flow

Suppose a client connected to a follower sends:

```text
setData /config value version=7
```

High-level flow:

1. The connected follower validates the request and forwards it to the leader.
2. The leader assigns a zxid.
3. The leader creates a transaction proposal.
4. The proposal is sent to voting followers.
5. Participants persist the proposal to their transaction logs.
6. Participants acknowledge the proposal.
7. After quorum acknowledgement, the leader commits it.
8. Commit is delivered in order to followers and observers.
9. Servers apply the transaction to their in-memory data tree.
10. The connected server returns the result to the client.
11. Relevant watches are queued for delivery.

The exact internal pipeline contains request processors, but this sequence is sufficient for HLD interviews.

## 59. Why Writes Are Slower Than Reads

A write requires:

- Leader ordering.
- Network communication.
- Durable transaction-log work.
- Quorum acknowledgement.
- Commit delivery.

A normal read can be served from one server's in-memory state.

ZooKeeper is therefore designed for:

```text
read-heavy coordination workloads
```

not high-volume write streams.

## 60. Durable Log Before Acknowledgement

Safe production configuration requires transactions to be persisted according to ZooKeeper's durability assumptions before participants acknowledge.

Disabling forced synchronization can improve apparent latency while weakening crash safety and is considered unsafe for normal production use.

## 61. Write Through Observer

A client connected to an observer can submit a write.

The observer forwards it into the leader path but does not vote in the quorum.

The result returns through the observer after commit processing.

## 62. Write Timeout Is Ambiguous

If the client times out or disconnects, it may not know whether the write committed.

Possible states:

```text
request never reached leader
request committed but response was lost
request partially progressed and was not committed
```

Retry design must use:

- Versions.
- Idempotent paths.
- Unique request IDs.
- Recovery reads.
- Recipe-specific node discovery.

## 63. Sequential Create Retry Ambiguity

Scenario:

1. Client creates `/election/candidate-` with sequential mode.
2. Server creates `/election/candidate-0000000042`.
3. Connection breaks before the client receives the created path.
4. Blind retry creates `...0043`.

Now one client owns two contenders.

Mitigation:

- Include a client-generated unique GUID in the node-name prefix or node data.
- After reconnecting, scan children for the GUID.
- Reuse the existing node if found.
- Use a mature recipe library.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper write path
What to use: Client connected to a follower, write forwarded to leader, proposal persisted and acknowledged by a quorum, commit broadcast, state applied and response returned.
Preferred source: Apache ZooKeeper overview, programmer guide and Zab documentation.
Search terms: ZooKeeper write path leader follower quorum transaction log
Purpose: Explain the latency and quorum behavior of writes.
Alt text: ZooKeeper routes writes through the leader and commits them after durable quorum acknowledgement.
Editorial note: Clearly separate proposal acknowledgement from final commit delivery.
-->

<!-- IMAGE PLACEHOLDER
Title: Ambiguous sequential-create retry
What to use: A sequential znode successfully created but the response lost, followed by a blind retry creating a second contender. Show GUID-based recovery as the safe path.
Preferred source: Apache ZooKeeper recipes and client error-handling guidance.
Search terms: ZooKeeper sequential create connection loss duplicate recipe GUID
Purpose: Explain a subtle but common retry bug.
Alt text: A lost create response can make a client create two sequential nodes unless it recovers using a unique identifier.
Editorial note: This is an original explanatory diagram if no official image exists.
-->

# Read Path

## 64. Local Read Flow

For `getData`, `exists` or `getChildren`:

1. Client sends request to its connected server.
2. Server reads its in-memory data tree.
3. Server returns data and stat.
4. If requested, the server registers a watch.

The read normally does not contact the leader or quorum.

## 65. Stale Read Example

```text
Leader commits config version 11.
Follower F2 has applied only version 10.
Client connected to F2 reads version 10 briefly.
```

The follower will catch up, but the read can be stale.

## 66. Monotonic Client View

ZooKeeper tracks transaction progress for the client connection/session so that reconnect behavior avoids moving the client behind state it already observed, subject to protocol and server freshness requirements.

This is stronger than arbitrary replica reads but still not the same as making every read quorum-linearizable.

## 67. Using `sync`

Critical flow:

```text
sync(path)
getData(path)
```

This reduces the chance of reading from a lagging server by bringing it up to date with the leader before the read.

It adds leader communication and latency.

## 68. Observer Read Trade-Off

Observers can scale reads or serve remote clients, but:

- They may lag.
- Remote propagation adds staleness.
- A large observer fleet adds leader/observer-master replication traffic.

Use only for reads that tolerate the freshness window.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper local read path
What to use: Clients reading directly from leader, follower and observer memory, with one lagging replica returning an older value.
Preferred source: Apache ZooKeeper overview and programmer guide.
Search terms: ZooKeeper read path local server stale read
Purpose: Explain why reads are fast and potentially stale.
Alt text: ZooKeeper reads are normally served from the connected server's in-memory state, so a lagging replica can return older data.
Editorial note: Contrast this directly with the quorum-based write path.
-->

<!-- IMAGE PLACEHOLDER
Title: `sync` before a critical read
What to use: Client connected to a lagging follower sends sync, follower catches up with leader, then getData returns the newer value.
Preferred source: Apache ZooKeeper programmer guide sync operation.
Search terms: ZooKeeper sync operation stale read diagram
Purpose: Show how applications request a fresher local view.
Alt text: ZooKeeper sync brings the connected server up to date before the client performs a critical read.
Editorial note: Do not present sync plus read as atomic against concurrent later writes.
-->

# Leader Election Recipe

## 69. Naive Election

Naive approach:

```text
Every candidate tries to create /leader as ephemeral.
Winner becomes leader.
Losers watch /leader.
```

This works conceptually but creates a herd effect when `/leader` disappears because every candidate wakes and retries.

## 70. Scalable Election with Ephemeral Sequential Nodes

Parent:

```text
/election/controller
```

Each candidate creates:

```text
/election/controller/candidate-0000000041
/election/controller/candidate-0000000042
/election/controller/candidate-0000000043
```

Algorithm:

1. Create an ephemeral sequential candidate znode.
2. List children.
3. Sort by sequence number.
4. If own node is smallest, become leader.
5. Otherwise watch the immediate predecessor.
6. When predecessor disappears, repeat the check.

Advantages:

- Fair ordering by sequence.
- One waiter wakes per departure.
- Ephemeral cleanup after session expiration.

## 71. Leadership Callback Safety

The application should not execute leader-only work merely because it once observed itself as smallest.

It must stop or fence work when:

- Session expires.
- Ownership znode disappears.
- A newer fencing token exists.
- Downstream resource rejects the token.

## 72. Leadership Epoch/Fencing Token

The sequential suffix or associated version can become a monotonically ordered leadership token.

Example:

```text
leader A token 41
leader B token 42
```

Every write to the protected resource includes the token.

The resource stores the highest token and rejects token `41` after seeing `42`.

ZooKeeper does not automatically enforce this on the external resource.

## 73. Election Result Publication

Separate:

```text
contender queue
```

from:

```text
published leader metadata
```

Example:

```text
/election/controller/candidate-...
/leaders/controller -> {instanceId, token, endpoint}
```

Update published metadata atomically or version it carefully.

## 74. Leader Failover Timeline

1. Leader process crashes or loses its session.
2. Session timeout expires.
3. Ephemeral candidate is deleted.
4. Its immediate successor receives a watch event.
5. Successor verifies it is now smallest.
6. Successor obtains a higher fencing token.
7. Successor begins leader work.

Failover time is bounded mainly by:

- Failure detection.
- Session timeout.
- Reconnection.
- Application initialization.

<!-- IMAGE PLACEHOLDER
Title: Ephemeral-sequential leader election
What to use: Ordered candidate znodes where the smallest sequence is leader and each other candidate watches only its immediate predecessor.
Preferred source: Apache ZooKeeper recipes and solutions documentation.
Search terms: site:zookeeper.apache.org ZooKeeper leader election ephemeral sequential predecessor watch
Purpose: Teach the canonical scalable election recipe.
Alt text: ZooKeeper elects the candidate with the smallest ephemeral sequential znode and chains predecessor watches.
Editorial note: Include candidate identity and sequence suffix separately.
-->

<!-- IMAGE PLACEHOLDER
Title: Leader failover timeline
What to use: Leader crash, session timeout, ephemeral deletion, successor watch, new token and protected-resource activation.
Preferred source: Create an original diagram based on ZooKeeper session and election semantics.
Search terms: ZooKeeper leader election failover session expiration timeline
Purpose: Quantify why failover is not instantaneous.
Alt text: ZooKeeper leader failover waits for session expiration before the next candidate safely takes ownership.
Editorial note: Show that TCP failure detection by one client is not enough to declare the old session expired.
-->

<!-- IMAGE PLACEHOLDER
Title: Leader election with fencing
What to use: Old leader token 41 and new leader token 42 both attempting a write; external storage accepts only token 42.
Preferred source: Create an original diagram based on ZooKeeper election recipes and fencing-token principles.
Search terms: ZooKeeper leader election fencing token stale leader
Purpose: Prevent split-brain side effects outside ZooKeeper.
Alt text: An external resource rejects writes from a stale ZooKeeper leader using an older fencing token.
Editorial note: Emphasize that fencing is enforced by the resource, not by the watch callback.
-->

# Distributed Lock Recipe

## 75. Naive Lock

Naive approach:

```text
create /lock as ephemeral
```

The successful client owns the lock. All failures watch the same node.

Problems:

- Herd effect.
- No fairness.
- Retry ambiguity.
- No fencing.

## 76. Fair Lock with Ephemeral Sequential Nodes

Parent:

```text
/locks/resource-7
```

Contenders create:

```text
lock-0000000101
lock-0000000102
lock-0000000103
```

Algorithm:

1. Create ephemeral sequential node.
2. List and sort contenders.
3. If own node is smallest, lock acquired.
4. Otherwise watch immediate predecessor.
5. On predecessor deletion, recheck.
6. Release by deleting own node.
7. Session expiration also removes own node.

## 77. Fairness

Sequence ordering gives queue-like fairness among successfully created contender nodes.

It does not guarantee strict wall-clock arrival order when requests race over the network.

## 78. Lock Release

The owner deletes its own contender znode.

A client must never delete another contender merely because it believes that contender is stale.

## 79. Lock Retry Recovery

After connection loss during create:

- Search children for the contender's unique GUID.
- Do not blindly create another node.
- Recover ownership based on the existing path.

## 80. Lock Is a Lease

Because ownership is session-based, the lock behaves like a lease.

The lease can end while the process is paused.

Therefore:

```text
ZooKeeper lock + fencing token
```

is required for safety-critical external side effects.

## 81. Read/Write Lock

A read/write lock recipe can encode contender type in sequential node names:

```text
read-0000000021
write-0000000022
read-0000000023
```

Conceptual rules:

- A writer waits for the immediately preceding relevant contender.
- A reader waits for the preceding writer but can coexist with earlier readers.
- Watches are targeted to avoid herd effects.

Use a tested library because edge cases are subtle.

<!-- IMAGE PLACEHOLDER
Title: Fair ZooKeeper lock queue
What to use: Ordered ephemeral sequential lock nodes, current owner at the smallest sequence and each waiter watching one predecessor.
Preferred source: Apache ZooKeeper lock recipe documentation.
Search terms: site:zookeeper.apache.org ZooKeeper lock ephemeral sequential recipe
Purpose: Explain fairness and targeted wake-up.
Alt text: The lowest sequential contender owns the lock and each later contender watches its predecessor.
Editorial note: Add a fencing-token label to the sequence number for safety-critical usage.
-->

<!-- IMAGE PLACEHOLDER
Title: Read/write lock recipe
What to use: Mixed read and write sequential contenders, showing compatible readers and a writer waiting for earlier holders.
Preferred source: Apache ZooKeeper read/write lock recipe documentation.
Search terms: site:zookeeper.apache.org ZooKeeper read write lock recipe
Purpose: Visualize a more advanced coordination recipe.
Alt text: ZooKeeper orders read and write contenders so readers can share ownership while writers obtain exclusive access.
Editorial note: Avoid oversimplifying predecessor selection; note that production code should use a tested recipe library.
-->

# Group Membership and Service Discovery

## 82. Group Membership

Create a persistent group root:

```text
/groups/workers
```

Each live member creates an ephemeral child:

```text
/groups/workers/worker-a
/groups/workers/worker-b
```

The child data can contain small metadata:

```json
{
  "endpoint": "10.0.1.8:9090",
  "zone": "az-a",
  "capacity": 20
}
```

Consumers watch the child list and reread current members.

## 83. Service Discovery

Layout:

```text
/services/payment/instances/<instance-id>
```

Each instance registers an ephemeral znode.

Clients or a discovery agent:

1. List instances.
2. Watch the child list.
3. Read endpoint metadata.
4. Load-balance requests.

## 84. Health Semantics

An ephemeral node proves only that:

```text
the ZooKeeper session is still alive
```

It does not prove:

- Application endpoint is healthy.
- Database dependency is healthy.
- Instance has available capacity.
- Requests succeed.

Combine membership with application health checks.

## 85. Churn

Rapid instance registration/removal creates:

- Many writes.
- Many watch events.
- Client cache updates.
- Session load.

For thousands of frequently changing endpoints, evaluate platform-native discovery or Consul-like systems designed around health checks.

## 86. Client-Side Cache

Clients should maintain an in-memory discovery cache:

- Initial full read.
- Watch for changes.
- Refresh on events.
- Refresh after reconnection.
- Keep last known data during brief disconnection when safe.

Avoid querying ZooKeeper for every application request.

<!-- IMAGE PLACEHOLDER
Title: Ephemeral group membership
What to use: Worker processes each owning an ephemeral child under one group znode, with a crashed worker's node removed after session expiration.
Preferred source: Apache ZooKeeper recipes and programmer guide.
Search terms: ZooKeeper group membership ephemeral nodes diagram
Purpose: Explain liveness-oriented membership.
Alt text: Live workers register ephemeral ZooKeeper children that disappear after their sessions expire.
Editorial note: Distinguish session liveness from full application health.
-->

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper service discovery cache
What to use: Service instances register ephemeral znodes; discovery clients build a local cache and update it through child watches rather than reading ZooKeeper per request.
Preferred source: Apache ZooKeeper use cases and programmer guide.
Search terms: ZooKeeper service discovery ephemeral nodes watches cache
Purpose: Show the scalable consumption pattern.
Alt text: Clients cache service membership locally and refresh it when ZooKeeper reports child-list changes.
Editorial note: Include independent endpoint health checking.
-->

# Configuration Management

## 87. Configuration Layout

Example:

```text
/config/payment/current -> version 42
/config/payment/versions/42 -> small configuration payload
```

Versioned immutable configuration is safer than repeatedly overwriting one large mutable document.

## 88. Watch and Reload

Client flow:

1. Read current version with a watch.
2. Read the referenced versioned configuration.
3. Validate locally.
4. Atomically swap application configuration.
5. On watch event, repeat.

## 89. Safe Rollout

Do not activate malformed configuration merely because ZooKeeper accepted the bytes.

Use:

- Schema validation.
- Compatibility validation.
- Staged rollout.
- Version history.
- Rollback pointer.
- Audit trail outside ZooKeeper.

## 90. Configuration Size

Store:

- Version.
- Small payload.
- URI/checksum for larger content.

For a large artifact:

```text
ZooKeeper -> version + object-storage URI + checksum
Object storage -> artifact
```

## 91. Configuration Consistency

Clients receive watch events at different times.

If all clients must switch together, a simple config watch is insufficient.

Use:

- Versioned activation time.
- Barrier.
- Two-phase rollout protocol.
- Application tolerance for mixed versions.

<!-- IMAGE PLACEHOLDER
Title: Versioned configuration rollout
What to use: Immutable config versions plus a small `/current` pointer watched by applications, with validation and atomic local swap.
Preferred source: Create an original diagram based on ZooKeeper configuration-management use cases.
Search terms: ZooKeeper configuration management watch versioned config
Purpose: Show a safe configuration pattern.
Alt text: Applications watch a small current-version pointer and load validated immutable ZooKeeper configuration versions.
Editorial note: Put large artifacts in object storage and retain only metadata in ZooKeeper.
-->

# Barriers

## 92. Simple Barrier

A barrier znode represents whether workers may proceed.

Example:

```text
/barriers/job-7/ready
```

Workers watch for creation or deletion depending on the recipe.

## 93. Double Barrier

A double barrier coordinates both entry and exit.

Flow:

1. Each worker creates an ephemeral sequential/member znode.
2. Workers wait until membership reaches `N`.
3. All enter the phase.
4. On completion, each removes its member znode.
5. All wait until the group is empty before leaving.

Use for phased distributed computation.

## 94. Failure Behavior

Ephemeral membership removes crashed workers after session expiration.

The application must define:

- Whether the barrier shrinks.
- Whether the job aborts.
- Whether replacement workers can join.
- Maximum waiting time.
- How partial work is cleaned.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper double barrier
What to use: Workers creating membership znodes until threshold N, all entering a phase, then deleting membership nodes and leaving when empty.
Preferred source: Apache ZooKeeper barrier recipe documentation.
Search terms: site:zookeeper.apache.org ZooKeeper double barrier recipe diagram
Purpose: Explain coordinated phase entry and exit.
Alt text: ZooKeeper workers wait for all participants to enter a barrier and later wait for all to leave.
Editorial note: Show session expiration as one failure branch.
-->

# Queue Recipe

## 95. Basic Queue

Producer creates persistent sequential children:

```text
/queue/item-0000000101
/queue/item-0000000102
```

Consumer selects the lowest sequence and deletes it after processing.

## 96. Why ZooKeeper Is Usually a Poor Message Queue

Problems:

- Every enqueue is a quorum write.
- Large child lists are expensive.
- Consumers may herd.
- Payload size is limited.
- No high-throughput partitioned log.
- Retention and replay are awkward.
- Delete/claim recovery is subtle.

Use Kafka, RabbitMQ, SQS or another queue for application messaging.

ZooKeeper queue recipes are useful for learning coordination primitives or very small control queues.

## 97. Priority Queue

Prefixes can encode priority, but ordering, starvation and child-list scanning become complicated.

Prefer a queue system designed for the workload.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper queue recipe and limitations
What to use: Producers creating persistent sequential children and consumers removing the lowest node, surrounded by warnings for quorum-write cost, child-list growth and payload limits.
Preferred source: Apache ZooKeeper queue recipe documentation.
Search terms: site:zookeeper.apache.org ZooKeeper queue recipe
Purpose: Teach the recipe while discouraging misuse as a high-volume broker.
Alt text: A ZooKeeper queue orders sequential child znodes but is unsuitable for high-volume application messaging.
Editorial note: Contrast it with Kafka or a managed queue in a small comparison inset.
-->

# Failure Semantics

## 98. One Follower Fails

For a three-voter ensemble:

```text
leader + one follower remain
quorum = 2
```

The ensemble can continue reading and writing.

Effects:

- Reduced failure tolerance.
- More load on remaining servers.
- Failed follower catches up after restart.
- Maintenance should avoid another voter outage.

## 99. Leader Fails

High-level flow:

1. Followers stop receiving leader heartbeats/traffic.
2. Election begins.
3. Writes pause.
4. A new leader with an appropriate transaction history is selected.
5. Followers synchronize.
6. Broadcast mode resumes.
7. Clients reconnect or continue through their servers.

Reads from available servers may continue in some phases, but applications should expect disruption.

## 100. Quorum Loss

Example:

```text
3 voters
2 unavailable
```

The remaining server cannot safely commit writes.

Normal mode behavior:

- Writes fail or time out.
- New authoritative leadership cannot be established without quorum.
- Existing sessions may disconnect or expire.
- Read-only mode is separate, optional and limited.

ZooKeeper chooses consistency over write availability during quorum loss.

## 101. Five-Node Failure

For five voters:

```text
quorum = 3
```

The ensemble can tolerate two voter failures.

If only two voters remain, writes stop even if those two can communicate.

## 102. Network Partition

Suppose a five-voter ensemble splits:

```text
3 servers | 2 servers
```

The three-server side can form quorum and continue.

The two-server side cannot commit writes.

This prevents two independent leaders from committing conflicting histories.

## 103. Read-Only Mode

ZooKeeper has an optional read-only mode for clients that explicitly support it when a server is isolated from quorum.

In this mode:

- Reads may continue from stale local state.
- Writes are unavailable.
- Changes from the quorum side are not visible until reconnection.

It is disabled by default and should be used only when stale isolated reads are acceptable.

## 104. Client Disconnection During Write

The client sees connection loss but cannot know the result.

Correct response depends on operation:

| Operation | Recovery approach |
|---|---|
| `setData` with expected version | Read current value/version and determine whether update applied |
| Fixed-path idempotent create | `exists` and validate ownership/data |
| Sequential create | Search by unique GUID before retry |
| Delete | Check existence and expected state |
| `multi` | Read every affected invariant and recover idempotently |

## 105. Session Expiration During Work

The client must stop acting as owner.

Do not wait for a later znode read to discover expiration before stopping safety-critical work. Treat the expiration callback as loss of all session-based ownership.

External fencing remains necessary for a client paused during the expiration interval.

## 106. Slow Follower

A slow follower can:

- Fall behind.
- Miss leader synchronization limits.
- Be dropped and rejoin.
- Require snapshot transfer.
- Increase disk and network work.

It should not block commits if a healthy quorum remains.

## 107. Slow Leader Disk

Leader and follower transaction-log fsync latency directly affects write latency.

Slow disk can cause:

- Request latency spikes.
- Followers timing out.
- Election instability.
- Session expirations.
- Throughput collapse.

Use a dedicated low-latency transaction-log device when write latency matters.

## 108. Disk Full

A full transaction-log or snapshot disk can make a server fail or behave unsafely.

Prevention:

- Disk alerts.
- Autopurge.
- Separate log and snapshot storage when justified.
- Capacity headroom.
- Tested restart behavior.

## 109. Clock Problems

ZooKeeper ordering does not depend on synchronized wall-clock timestamps for correctness.

However, clocks still matter for:

- Monitoring.
- Log correlation.
- TLS certificates.
- Operational diagnosis.
- Application data stored in znodes.

## 110. Split-Brain Application Leader

ZooKeeper can ensure one current session owns an election node, but an old process can continue performing external work after losing the session.

Prevent with:

- Fencing token.
- Downstream version check.
- Idempotent operations.
- Short bounded work units.
- Cancellation on connection/session events.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper leader failure recovery
What to use: Leader failure, election, history synchronization and new leader broadcast, with writes paused during transition.
Preferred source: Apache ZooKeeper overview, Zab protocol and administrator guide.
Search terms: ZooKeeper leader failure election synchronization recovery diagram
Purpose: Explain availability during a leader transition.
Alt text: ZooKeeper pauses writes, elects a new leader, synchronizes followers and resumes ordered transaction broadcast.
Editorial note: Do not promise one fixed failover time; connect it to tick and synchronization configuration.
-->

<!-- IMAGE PLACEHOLDER
Title: Majority and minority network partition
What to use: A five-node ensemble split into three and two; the three-node majority elects/keeps a leader and writes, while the minority cannot write.
Preferred source: Apache ZooKeeper overview and quorum documentation.
Search terms: ZooKeeper network partition majority minority quorum diagram
Purpose: Show the CP behavior during a partition.
Alt text: Only the majority side of a ZooKeeper partition can continue committing writes.
Editorial note: Include optional stale read-only mode only as a separate annotation.
-->

<!-- IMAGE PLACEHOLDER
Title: Client connection-loss decision tree
What to use: A decision tree starting from connection loss and branching by operation type: conditional set, fixed create, sequential create, delete and multi.
Preferred source: Create an original diagram based on ZooKeeper programmer and recipes documentation.
Search terms: ZooKeeper connection loss ambiguous operation retry handling
Purpose: Provide practical retry guidance.
Alt text: ZooKeeper clients recover ambiguous operations differently depending on whether the operation is versioned, idempotent or sequential.
Editorial note: Recommend a mature client recipe library for complex recovery.
-->

<!-- IMAGE PLACEHOLDER
Title: Slow disk causing ensemble instability
What to use: Transaction-log fsync delay on one or more voters leading to delayed ACKs, leader timeout, election and client session pressure.
Preferred source: Apache ZooKeeper administrator guide and performance guidance.
Search terms: ZooKeeper transaction log fsync latency leader election slow disk
Purpose: Explain why storage latency is a correctness and availability concern, not just a throughput metric.
Alt text: Slow ZooKeeper log disks delay quorum acknowledgements and can trigger elections and session instability.
Editorial note: Show separate transaction-log and snapshot I/O paths.
-->

# Persistence and Recovery

## 111. In-Memory Data Tree

ZooKeeper keeps its active namespace in memory for fast reads.

Memory therefore scales with:

- Znode count.
- Path lengths.
- Data bytes.
- ACL metadata.
- Watch registrations.
- Sessions and connections.
- Internal object overhead.

The entire coordination dataset must fit comfortably in heap and process memory.

## 112. Transaction Log

Every committed mutation is appended to a transaction log.

The log supports:

- Durability.
- Crash recovery.
- Replica synchronization.
- Ordered replay.

Transaction-log latency is on the write path.

## 113. Snapshots

ZooKeeper periodically serializes the in-memory data tree to a snapshot.

After restart:

1. Load latest valid snapshot.
2. Replay later transaction-log entries.
3. Reconstruct current state.

Snapshots prevent recovery from requiring the entire historical log.

## 114. Fuzzy Snapshots

Snapshot creation can overlap with ongoing transactions.

The snapshot and transaction log together reconstruct a consistent final state during replay.

Applications do not need to pause all writes for a snapshot.

## 115. `snapCount`

`snapCount` influences how often snapshots are triggered based on transaction counts, with randomization used to avoid all ensemble members snapshotting simultaneously.

Tune only after understanding:

- Recovery time.
- Disk usage.
- Snapshot I/O.
- Write rate.

## 116. Separate `dataLogDir`

`dataLogDir` can place transaction logs on a dedicated device separate from snapshots.

Benefits:

- More predictable sequential fsync latency.
- Snapshot I/O less likely to interfere with log appends.

This matters most for write-heavy or latency-sensitive ensembles.

## 117. Autopurge

ZooKeeper can purge old snapshots and transaction logs.

Important settings include concepts such as:

- Snapshot retention count.
- Purge interval.

Without cleanup, disks can fill.

Retain enough history for operational recovery and backup procedures.

## 118. Restore

Restoring a ZooKeeper ensemble is not the same as restarting one member.

A disaster-recovery plan must define:

- Which snapshot/log set is authoritative.
- Whether the entire ensemble is stopped.
- Server IDs and dynamic configuration.
- Namespace validation.
- Client reconnection.
- Ephemeral-state implications.

Ephemeral nodes represent live sessions and should not be treated as durable business records.

## 119. Backup vs Replication

Replication protects against member failure.

It does not protect against:

- Accidental recursive delete.
- Bad ACL update.
- Corrupt application write.
- Operator error replicated to every server.
- Entire-region loss.

Maintain backups for persistent coordination metadata that cannot be rebuilt.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper storage engine
What to use: In-memory data tree, sequential transaction log, periodic snapshots and restart recovery through snapshot plus log replay.
Preferred source: Apache ZooKeeper overview and administrator guide.
Search terms: site:zookeeper.apache.org ZooKeeper transaction log snapshot in memory database diagram
Purpose: Explain fast reads and durable write recovery.
Alt text: ZooKeeper serves an in-memory tree while persisting mutations to a transaction log and periodically writing snapshots.
Editorial note: Show the transaction log on the synchronous write path and snapshots as background I/O.
-->

<!-- IMAGE PLACEHOLDER
Title: Dedicated transaction-log disk
What to use: ZooKeeper server with data tree in memory, transaction log on a low-latency dedicated device and snapshots on a separate data volume.
Preferred source: Apache ZooKeeper administrator guide deployment section.
Search terms: ZooKeeper dataLogDir separate disk transaction log snapshot
Purpose: Show the recommended I/O separation for latency-sensitive production workloads.
Alt text: Separating ZooKeeper transaction logs from snapshots reduces I/O interference on quorum writes.
Editorial note: Present this as workload-dependent guidance rather than a mandatory topology.
-->

<!-- IMAGE PLACEHOLDER
Title: Replication vs backup
What to use: An accidental znode delete replicated to every ensemble member, contrasted with an independent historical backup used for recovery.
Preferred source: Create an original diagram from ZooKeeper persistence and operations guidance.
Search terms: ZooKeeper replication is not backup
Purpose: Prevent a common durability misconception.
Alt text: ZooKeeper replication copies logical mistakes to all members, while backups preserve a recoverable earlier state.
Editorial note: Mark ephemeral znodes as rebuildable runtime state rather than backup targets.
-->

# Dynamic Reconfiguration

## 120. Static Configuration

Traditional ensembles define server members in configuration:

```text
server.1=zk1:2888:3888;2181
server.2=zk2:2888:3888;2181
server.3=zk3:2888:3888;2181
```

Each member has a unique server ID stored in `myid` or equivalent deployment identity.

## 121. Dynamic Configuration

Modern ZooKeeper supports changing ensemble membership without manually stopping the whole cluster.

Use cases:

- Add a server.
- Remove a server.
- Replace addresses.
- Change participant/observer role.
- Migrate failure domains.

## 122. Safe Reconfiguration

Reconfiguration changes the quorum definition and is safety-critical.

Plan:

1. Verify current ensemble health.
2. Add and synchronize new members.
3. Change membership through supported reconfiguration APIs.
4. Verify quorum and dynamic config.
5. Remove old members.
6. Update client connection strings and automation.

Do not remove enough voters to lose quorum during the transition.

## 123. Rolling Replacement

For server replacement:

- Add replacement capacity first when possible.
- Allow synchronization.
- Confirm voting status.
- Remove old server.
- Preserve unique IDs and avoid identity collision.

## 124. Observers During Migration

A new member can initially join as an observer, catch up, and later be promoted to participant through a controlled reconfiguration.

Verify the exact supported workflow and version.

<!-- IMAGE PLACEHOLDER
Title: Dynamic ensemble reconfiguration
What to use: A three-voter ensemble adding a new observer, synchronizing it, promoting it or replacing an old voter, and ending with a healthy new voter set.
Preferred source: Apache ZooKeeper dynamic reconfiguration documentation.
Search terms: site:zookeeper.apache.org ZooKeeper dynamic reconfiguration add remove server diagram
Purpose: Explain safe membership changes.
Alt text: ZooKeeper changes ensemble membership in stages while preserving a healthy quorum.
Editorial note: Show client connection-string and automation updates as part of the migration.
-->

# Configuration and Deployment

## 125. `tickTime`

`tickTime` is a fundamental time unit used by ZooKeeper for heartbeats, session calculations and quorum timing.

Changing it affects many time-based behaviors.

Do not tune it in isolation.

## 126. `initLimit`

`initLimit` bounds how long followers may take to connect and synchronize with a leader during initialization, expressed in ticks.

If too small:

- Slow restarts and large snapshot transfers may fail repeatedly.

If too large:

- Failure recovery can take longer to declare.

## 127. `syncLimit`

`syncLimit` bounds how far normal follower communication can lag behind the leader in ticks.

Slow networks or disks can cause followers to be dropped if this is too strict.

An overly large value delays failure detection.

## 128. Session Timeout Bounds

The ensemble constrains client-requested session timeouts using minimum and maximum settings derived from tick configuration or explicit parameters.

Choose client timeouts within these operational bounds.

## 129. Client Connection Limits

A per-host connection limit can protect a server from accidental connection storms.

Consider:

- NAT or proxy concentration.
- Kubernetes nodes sharing source IPs.
- Legitimate large client fleets.
- Server file descriptors.

## 130. Four-Letter Commands and AdminServer

ZooKeeper exposes operational commands and an HTTP AdminServer for health and diagnostics.

Common checks include concepts such as:

- Server role and mode.
- Connection statistics.
- Outstanding requests.
- Watches.
- Environment.
- Readiness/health.

Sensitive commands should be explicitly allow-listed and network-restricted.

## 131. Readiness vs Liveness

A process can be alive but unable to serve quorum writes.

Health checks should distinguish:

- JVM/process alive.
- Client port accepting.
- Connected to quorum.
- Server role established.
- Able to process writes.
- Disk healthy.

## 132. Failure-Domain Placement

Place voters across independent failure domains.

For three voters:

```text
AZ-A: 1
AZ-B: 1
AZ-C: 1
```

Avoid:

```text
AZ-A: 2
AZ-B: 1
```

if loss of AZ-A would remove quorum.

## 133. Geographic Placement

A voting quorum spanning distant regions puts WAN latency on every write and can destabilize elections during network problems.

Common design:

- Voters within one low-latency region across AZs.
- Observers in remote regions for local reads.
- Separate disaster-recovery strategy.

For globally coordinated writes, explicitly accept WAN latency and partition behavior.

## 134. Kubernetes Deployment

ZooKeeper on Kubernetes should use:

- StatefulSet identity.
- Stable DNS.
- Persistent volumes.
- Pod anti-affinity/topology spread.
- PodDisruptionBudget.
- Ordered operational procedures.
- Correct readiness probes.
- Graceful termination.

Do not allow a rolling operation to voluntarily remove quorum.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper timing configuration
What to use: A timeline showing tickTime as base unit, session timeout, initLimit and syncLimit, and what each protects.
Preferred source: Apache ZooKeeper administrator guide.
Search terms: ZooKeeper tickTime initLimit syncLimit diagram
Purpose: Make related timeout settings understandable.
Alt text: ZooKeeper uses tickTime as the base for client-session and server-synchronization timing limits.
Editorial note: Avoid providing universal numeric values; tie them to measured network, disk and pause behavior.
-->

<!-- IMAGE PLACEHOLDER
Title: Three-AZ ZooKeeper deployment
What to use: Three voters spread one per availability zone, clients connecting through a stable endpoint list, and dedicated persistent storage on each node.
Preferred source: Apache ZooKeeper administrator guide and Kubernetes ZooKeeper tutorial.
Search terms: ZooKeeper three availability zones deployment diagram
Purpose: Show failure-domain-aware production placement.
Alt text: A three-voter ZooKeeper ensemble places one server in each availability zone so one zone can fail without losing quorum.
Editorial note: Avoid placing a generic load balancer in front if it hides session-aware client connection behavior; clients should know multiple endpoints.
-->

<!-- IMAGE PLACEHOLDER
Title: Kubernetes ZooKeeper StatefulSet
What to use: StatefulSet pods with stable ordinal identities, headless service, persistent volumes, anti-affinity and a PodDisruptionBudget.
Preferred source: Kubernetes official ZooKeeper StatefulSet tutorial and Apache ZooKeeper administrator guide.
Search terms: Kubernetes ZooKeeper StatefulSet headless service PodDisruptionBudget diagram
Purpose: Show the platform-specific operational requirements.
Alt text: ZooKeeper runs on Kubernetes with stable pod identities, persistent disks and disruption controls that preserve quorum.
Editorial note: Kubernetes is an orchestration environment, not a replacement for ZooKeeper quorum design.
-->

# Security

## 135. Threat Model

Protect against:

- Unauthorized reads of configuration or secrets.
- Unauthorized znode writes/deletes.
- Stolen session credentials.
- Client impersonation.
- Quorum-member impersonation.
- Plaintext network interception.
- Dangerous administrative commands.
- Overly broad ACLs.

## 136. ACL Model

ACLs are attached to znodes.

Permissions include:

- `READ`: read data and list children.
- `WRITE`: set data.
- `CREATE`: create children.
- `DELETE`: delete children.
- `ADMIN`: change ACL.

Permissions on a parent and child are distinct.

For example, deleting a child is controlled by delete permission on the parent.

## 137. ACL Schemes

Common identity schemes include:

- `world`.
- `auth`.
- `digest`.
- `ip`.
- `sasl`-authenticated identity.
- `x509` identity with TLS client certificates.

Use least privilege.

Avoid production use of open ACLs such as world-anyone-all.

## 138. Digest Authentication

Digest authentication derives an ACL identity from username/password material.

Without TLS, authentication material can be exposed on the network.

Do not treat digest alone as transport encryption.

## 139. SASL/Kerberos

SASL can authenticate clients and quorum members using Kerberos/GSSAPI in appropriately configured environments.

It adds:

- Principal management.
- Keytabs.
- DNS requirements.
- Clock and realm operations.

## 140. TLS

Use TLS for:

- Client-to-server connections.
- Server-to-server quorum communication where supported and configured.

Validate:

- Hostnames.
- Trust stores.
- Key rotation.
- Protocol versions.
- Cipher suites.
- Certificate expiry.

## 141. Quorum Authentication

ZooKeeper servers should authenticate other quorum members to prevent an unauthorized process from joining or impersonating a server.

Combine:

- Network isolation.
- SASL or TLS identity.
- Correct server IDs.
- Restricted election/quorum ports.

## 142. Secrets in Znodes

Even with ACLs, ZooKeeper is not automatically a dedicated secrets-management system.

Consider:

- Encryption at rest.
- Backup exposure.
- Administrative access.
- Audit requirements.
- Rotation.
- Secret-manager integration.

Prefer storing a secret reference rather than the secret when possible.

## 143. Chroot Namespace

Clients can connect with a chroot suffix:

```text
zk1:2181,zk2:2181/app-a
```

The application sees `/app-a` as its root.

Benefits:

- Namespace organization.
- Reduced accidental cross-application access.

Chroot is not a substitute for ACLs.

## 144. Administrative Network Isolation

Restrict access to:

- Client port.
- Secure client port.
- Quorum port.
- Election port.
- AdminServer.
- Metrics endpoint.
- Four-letter commands.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper security layers
What to use: Network isolation outside, TLS/SASL authentication, znode ACL authorization and administrative-command restrictions inside.
Preferred source: Apache ZooKeeper administrator and programmer security documentation.
Search terms: site:zookeeper.apache.org ZooKeeper TLS SASL ACL security architecture
Purpose: Explain that authentication, encryption and authorization are separate layers.
Alt text: ZooKeeper security combines private networking, encrypted authenticated connections and per-znode ACL permissions.
Editorial note: Do not show digest authentication as encrypted unless TLS is also present.
-->

<!-- IMAGE PLACEHOLDER
Title: Znode ACL permissions
What to use: Parent and child znodes with READ, WRITE, CREATE, DELETE and ADMIN permissions mapped to the operation they control.
Preferred source: Apache ZooKeeper programmer guide ACL section.
Search terms: ZooKeeper ACL read write create delete admin parent child
Purpose: Clarify non-file-system-like permission behavior.
Alt text: ZooKeeper ACL permissions separately control reading, writing, creating children, deleting children and changing ACLs.
Editorial note: Highlight that delete permission is checked on the parent of the node being deleted.
-->

<!-- IMAGE PLACEHOLDER
Title: Client TLS and quorum TLS
What to use: Clients using secure connections to each ZooKeeper server and encrypted authenticated links between leader, followers and observers.
Preferred source: Apache ZooKeeper administrator guide SSL settings.
Search terms: ZooKeeper client TLS quorum TLS diagram
Purpose: Distinguish two independent transport channels.
Alt text: ZooKeeper can secure both client-server traffic and server-to-server quorum traffic with TLS.
Editorial note: Include hostname verification and certificate rotation as callouts.
-->

# Observability

## 145. Core Availability Metrics

Track:

- Server up/down.
- Leader/follower/observer role.
- Quorum health.
- Leader election count.
- Time since last election.
- Read-only state.
- Outstanding requests.

## 146. Latency Metrics

Track:

- Average request latency.
- Minimum and maximum latency.
- p50, p95 and p99 from clients.
- Write latency separately from read latency.
- Fsync latency.
- Snapshot duration.

## 147. Request Metrics

Track:

- Reads per second.
- Writes per second.
- Outstanding requests.
- Request queueing.
- Error codes.
- Connection-loss rate.
- Session-expiration rate.

## 148. Ensemble Metrics

Track:

- Leader proposal rate.
- Quorum acknowledgements.
- Follower sync status.
- Learner lag.
- Packet sent/received counts.
- Election duration.
- Observer lag where available.

## 149. Data-Tree Metrics

Track:

- Znode count.
- Data size.
- Ephemeral count.
- Watch count.
- ACL count.
- Outstanding changes.
- Large znode/path distribution through controlled auditing.

## 150. Session and Connection Metrics

Track:

- Active connections.
- Sessions.
- Session timeout distribution.
- Connections per source host.
- Authentication failures.
- Reconnect rate.
- Client send/receive queue depth where available.

## 151. Disk Metrics

Track:

- Transaction-log fsync latency.
- Log disk utilization.
- Snapshot disk utilization.
- IOPS and throughput.
- Snapshot/log file count.
- Autopurge success.
- Disk errors.

## 152. JVM Metrics

Track:

- Heap.
- GC pauses.
- Thread count.
- Direct memory.
- CPU.
- File descriptors.
- Process RSS.

Long GC pauses can cause session and quorum instability.

## 153. Watch Metrics

A large watch population consumes memory and creates event fan-out.

Track:

- Total watch count.
- Watches by path/prefix where possible.
- Watch event rate.
- Slow clients.
- Client output queues.

## 154. Alerts

Alert on:

- No leader.
- Quorum unavailable.
- Repeated elections.
- Rising fsync latency.
- Session-expiration spike.
- Follower lag/drop.
- Outstanding-request growth.
- Disk utilization.
- Snapshot failure.
- Autopurge failure.
- Authentication failure spike.
- Watch count growth.
- JVM pause exceeding safe fraction of session timeout.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper operations dashboard
What to use: Dashboard panels for quorum/role, read-write latency, outstanding requests, sessions, watches, znode count, disk fsync and JVM pauses.
Preferred source: Apache ZooKeeper metrics and administrator documentation.
Search terms: site:zookeeper.apache.org ZooKeeper metrics monitoring dashboard
Purpose: Show the minimum production observability surface.
Alt text: A ZooKeeper dashboard monitors quorum health, request latency, sessions, watches, data size, disk and JVM pauses.
Editorial note: Prefer percentile latency from clients in addition to server min/avg/max metrics.
-->

<!-- IMAGE PLACEHOLDER
Title: Session-expiration root-cause map
What to use: Network loss, GC pause, overloaded server, leader election and slow disk feeding into missed heartbeats and session expiration.
Preferred source: Create an original diagram based on ZooKeeper operations guidance.
Search terms: ZooKeeper session expiration causes GC network server overload
Purpose: Help diagnose a common production symptom.
Alt text: ZooKeeper sessions expire when heartbeats are missed due to network, pause or server-health problems.
Editorial note: Include client-side and server-side telemetry needed to distinguish causes.
-->

# Capacity Planning

## 155. Capacity Dimensions

Estimate:

```text
znode count
average path length
average data bytes
ACL overhead
watch count
session count
connection count
read QPS
write QPS
watch event rate
snapshot size
transaction-log rate
failure headroom
```

## 156. Data-Tree Memory

A rough planning formula:

```text
memory for znodes
≈ znode count
× measured average in-memory bytes per znode
```

Do not estimate using payload bytes alone.

Each znode also has:

- Path/name objects.
- Stat metadata.
- Child structures.
- ACL references.
- JVM/object overhead.

Measure a production-like namespace in a staging ensemble.

## 157. Example Znode Estimate

Assume:

```text
persistent znodes        = 1,000,000
ephemeral znodes         =   200,000
average measured memory  = 700 bytes/znode
```

```text
1,200,000 × 700
= 840,000,000 bytes
≈ 840 MB
```

Then add:

- Watches.
- Sessions.
- Connections.
- JVM overhead.
- Snapshot serialization.
- Safety headroom.

A multi-gigabyte heap may be required even though stored payload bytes are much smaller.

The `700 bytes` value is an example measurement assumption, not a ZooKeeper guarantee.

## 158. Watch Memory

```text
watch memory
≈ registered watches
× measured bytes per watch
```

One million clients watching one path still creates roughly one million registrations.

Persistent recursive watches can be convenient but must be capacity-tested.

## 159. Connection Capacity

Each connection consumes:

- Socket/file descriptor.
- Network buffers.
- Session/client state.
- Authentication state.
- Watch-delivery queues.

Avoid one ZooKeeper connection per application request.

Use:

```text
one long-lived shared client per application process
```

or a small controlled number.

## 160. Read Capacity

Normal reads are local and scale across servers.

Approximate:

```text
read load per server
≈ connected-client read QPS routed to that server
```

Adding followers adds both read capacity and quorum cost.

Adding observers adds read capacity without increasing voter quorum size.

## 161. Write Capacity

Every write is ordered by the leader and replicated to quorum.

Write throughput is limited by:

- Leader CPU.
- Serialization.
- Network.
- Transaction-log fsync.
- Quorum acknowledgement.
- Watch fan-out.
- Request size.

Adding voters does not linearly scale write throughput and may reduce it.

## 162. Watch Event Capacity

One update can trigger many client notifications.

```text
watch deliveries/s
= updates/s × average watchers triggered/update
```

Example:

```text
100 config updates/s
× 20,000 watchers
= 2,000,000 event deliveries/s
```

This design is likely wrong even if write QPS looks low.

## 163. Snapshot and Recovery Size

Larger data trees cause:

- Larger snapshots.
- Longer startup.
- Longer follower synchronization.
- More memory pressure.
- Longer backup/restore.

ZooKeeper is intended for small coordination state.

## 164. Latency Targets

For HLD interviews, state targets rather than universal product claims.

Example:

```text
local read p99 < 5 ms
quorum write p99 < 20 ms
leader failover < negotiated operational target
```

Validate using:

- Real request size.
- TLS.
- ACL/authentication.
- Disk fsync.
- Failure-domain network.
- Watch volume.
- Client concurrency.

## 165. Ensemble Size Decision

### Three voters

Use when:

- One failure tolerance is sufficient.
- Lower write latency is preferred.
- Deployment is within three failure domains.

### Five voters

Use when:

- Two simultaneous voter failures must be tolerated.
- Additional quorum latency/cost is acceptable.

### More voters

Rarely justified for ordinary deployments.

Use observers for read scale instead of adding voters solely for reads.

## 166. Failure Headroom

Each remaining voter must handle load after a member failure.

For a three-voter ensemble, size each server so the system remains healthy with two active voters.

Also reserve for:

- Rejoin synchronization.
- Snapshot transfer.
- Election burst.
- Client reconnection storm.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper capacity model
What to use: Znodes, watches, sessions, connections, read QPS, write QPS and event fan-out feeding into memory, CPU, disk and network requirements.
Preferred source: Create an original diagram based on Apache ZooKeeper performance and administrator guidance.
Search terms: ZooKeeper capacity planning znodes watches sessions connections
Purpose: Provide a reusable HLD sizing framework.
Alt text: ZooKeeper capacity depends on namespace size, client state, request load and watch fan-out rather than payload bytes alone.
Editorial note: Label all numerical values as workload measurements, not universal limits.
-->

<!-- IMAGE PLACEHOLDER
Title: Read scaling with followers and observers
What to use: More clients distributed across followers and observers for local reads, while every write still flows through one leader and voting quorum.
Preferred source: Apache ZooKeeper observer documentation.
Search terms: ZooKeeper observers read scalability write leader bottleneck
Purpose: Explain asymmetric read and write scaling.
Alt text: ZooKeeper read throughput can scale across followers and observers, but writes remain leader-ordered and quorum-replicated.
Editorial note: Show observer staleness and replication bandwidth as trade-offs.
-->

<!-- IMAGE PLACEHOLDER
Title: Watch fan-out calculation
What to use: One znode update triggering notifications to 20,000 clients and creating a network/event-processing burst.
Preferred source: Create an original diagram based on ZooKeeper watch semantics.
Search terms: ZooKeeper watch fanout herd effect capacity
Purpose: Make watch delivery part of capacity planning.
Alt text: A single ZooKeeper update can fan out to thousands of watch notifications.
Editorial note: Contrast with predecessor-watch and local-cache patterns.
-->

# Client Libraries and Recipe Libraries

## 167. Do Not Reimplement Every Recipe

Raw ZooKeeper APIs expose low-level primitives.

Production applications should usually use a mature library that handles:

- Reconnection.
- Retry policies.
- Sequential-create ambiguity.
- Watch re-registration.
- Lock cleanup.
- Leader callbacks.
- Local caches.
- Namespace creation.

For Java, Apache Curator is the most common higher-level ZooKeeper client library.

## 168. Apache Curator

Curator provides recipes such as:

- Leader election/latch.
- Inter-process mutex.
- Read/write lock.
- Distributed atomic values.
- Barriers.
- Service discovery.
- Node caches.

Curator recipes own particular znode paths and lifecycle conventions. Do not let unrelated application code mutate those paths.

## 169. Retry Policy

A retry policy should define:

- Which error is retryable.
- Maximum attempts.
- Backoff.
- Jitter.
- Operation idempotency.
- Total deadline.

Do not retry indefinitely during quorum loss.

## 170. Shared Client

Create a long-lived client per application process or controlled component.

Avoid:

```text
connect -> operation -> disconnect
```

for every request.

A shared client amortizes:

- Session setup.
- TLS/authentication.
- TCP connections.
- Watch state.

## 171. Local Cache Recipes

A local cache mirrors a subtree using watches.

Use for:

- Service membership.
- Configuration.
- Assignment metadata.

Correct cache behavior includes:

- Initial full population.
- Ordered event processing.
- Rebuild after connection/session events.
- Handling delete/create races.
- Bounded event queues.

<!-- IMAGE PLACEHOLDER
Title: Raw ZooKeeper API vs Curator recipe
What to use: Raw client code handling reconnect, watches and sequential-create recovery, contrasted with a Curator leader/lock/cache recipe encapsulating those behaviors.
Preferred source: Apache Curator recipe documentation.
Search terms: site:curator.apache.org recipes ZooKeeper leader lock cache
Purpose: Encourage use of tested recipe implementations.
Alt text: Apache Curator wraps ZooKeeper primitives with tested leader-election, lock and cache recipes.
Editorial note: Do not suggest that a library removes the need for fencing and application-level failure design.
-->

# Quotas and Namespace Governance

## 172. Quotas

ZooKeeper supports namespace quota mechanisms for counts and bytes in subtrees, with behavior depending on version and configuration.

Use quotas as guardrails against accidental namespace growth.

Do not rely on quotas instead of capacity monitoring.

## 173. Per-Application Root

Use a dedicated root:

```text
/apps/payment
/apps/search
/apps/scheduler
```

or a client chroot.

Benefits:

- ACL isolation.
- Quota boundaries.
- Easier backup and cleanup.
- Clear ownership.

## 174. Schema Ownership

Document for each path:

- Owner team.
- Znode mode.
- Payload schema.
- Maximum size.
- ACL.
- Watch consumers.
- Cleanup.
- Version semantics.
- Recovery behavior.

ZooKeeper paths are an API contract.

## 175. Avoid Huge Child Lists

A parent with hundreds of thousands or millions of children creates:

- Large `getChildren` responses.
- Memory overhead.
- Watch bursts.
- Slow recipes.
- Snapshot growth.

Bucket when required:

```text
/tasks/00/...
/tasks/01/...
...
/tasks/ff/...
```

But reconsider whether ZooKeeper is the correct store before building a huge namespace.

<!-- IMAGE PLACEHOLDER
Title: Governed ZooKeeper namespace
What to use: Separate application roots with distinct ACLs, quotas, schemas and owners, contrasted with an unstructured shared root.
Preferred source: Create an original diagram based on ZooKeeper chroot, ACL and quota documentation.
Search terms: ZooKeeper namespace chroot ACL quota best practices
Purpose: Treat the namespace as a governed production API.
Alt text: ZooKeeper applications use isolated roots with explicit ownership, ACLs, quotas and payload schemas.
Editorial note: Include a warning against enormous child lists.
-->

# Example Znode Layouts

## 176. Controller Leader Election

```text
/apps/controller
├── election
│   ├── candidate-<guid>-0000000041
│   └── candidate-<guid>-0000000042
└── leader
```

Candidate mode:

```text
ephemeral sequential
```

Leader metadata:

```json
{
  "instanceId": "controller-7",
  "endpoint": "10.0.3.7:8080",
  "fencingToken": 41
}
```

Requirements:

- Predecessor watch.
- Session-expiration handling.
- External fencing.
- Recovery from ambiguous create.

## 177. Service Membership

```text
/apps/payments/services/api/instances
├── instance-a
├── instance-b
└── instance-c
```

Each instance znode:

```text
ephemeral
```

Payload:

```json
{
  "host": "10.1.2.3",
  "port": 8443,
  "zone": "az-b",
  "protocol": "https"
}
```

Consumers cache and watch the child list.

## 178. Shard Assignment

```text
/apps/indexer
├── workers
│   ├── worker-a
│   └── worker-b
├── assignments
│   ├── shard-0001
│   └── shard-0002
└── epochs
    ├── shard-0001
    └── shard-0002
```

Persistent assignment:

```json
{
  "workerId": "worker-a",
  "epoch": 83
}
```

Worker membership:

```text
ephemeral
```

The storage or processing system rejects stale epochs.

## 179. Versioned Configuration

```text
/apps/search/config
├── current -> "17"
└── versions
    ├── 16
    └── 17
```

`current` is small and watched.

Versions are immutable.

Large artifacts are referenced by URI and checksum.

## 180. Distributed Lock

```text
/apps/jobs/locks/job-99
├── request-<guid>-0000000101
├── request-<guid>-0000000102
└── request-<guid>-0000000103
```

All contenders are ephemeral sequential.

The lowest sequence holds the lock.

## 181. Worker Barrier

```text
/apps/batch/barriers/run-20260713
├── expected -> "10"
├── ready
│   ├── worker-a
│   ├── worker-b
│   └── ...
└── done
```

Membership nodes are ephemeral where session cleanup is desired.

The job controller defines behavior when membership drops.

## 182. Monotonic Configuration Epoch

```text
/apps/router/config
├── value
└── epoch
```

Use one atomic `multi` to:

- Check old epoch version.
- Update config value.
- Increment/publish epoch.

Consumers reject state older than the highest epoch observed.

## 183. Name Allocation

Persistent sequential nodes can allocate ordered IDs:

```text
/names/order-
```

But ZooKeeper sequence counters are:

- Scoped to a parent/prefix behavior.
- Finite-width implementation values.
- Expensive quorum writes.

Do not use ZooKeeper as a high-throughput ID generator.

<!-- IMAGE PLACEHOLDER
Title: Shard ownership with fencing epochs
What to use: Live worker ephemerals, persistent shard assignments and monotonically increasing shard epochs, with a processing system rejecting an old worker epoch.
Preferred source: Create an original diagram based on ZooKeeper membership and leader-election recipes.
Search terms: ZooKeeper shard assignment fencing epoch workers
Purpose: Show a realistic HLD coordination design.
Alt text: ZooKeeper tracks live workers and shard assignments while downstream processing rejects stale ownership epochs.
Editorial note: Keep assignment metadata small; shard data itself belongs elsewhere.
-->

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper znode layout examples
What to use: A single tree containing election, service instances, configuration versions, shard assignments, locks and barriers, with creation modes labeled.
Preferred source: Create an original diagram from the layouts in this guide.
Search terms: ZooKeeper znode schema leader service discovery config lock
Purpose: Provide a reusable interview reference for path design.
Alt text: Common ZooKeeper path layouts use persistent roots and ephemeral or sequential children for coordination recipes.
Editorial note: Avoid implying that every application needs all recipes in one ensemble.
-->

# Detailed HLD Use Cases

## 184. Distributed Job Scheduler Leader

### Requirement

Exactly one scheduler replica should assign new jobs at a time.

### Design

- Every scheduler joins an ephemeral-sequential election.
- Lowest contender becomes leader.
- Sequence becomes fencing token.
- Job database stores `scheduler_epoch` with every assignment.
- Database rejects updates with an older epoch.
- Followers watch predecessors.

### Why fencing matters

The old scheduler may pause, lose its ZooKeeper session and resume.

Without a database epoch check, both old and new scheduler can assign jobs.

### Outage behavior

- ZooKeeper quorum lost: no new leader change or coordination writes.
- Current scheduler may continue only if business safety allows and its fencing remains valid.
- Safer default: pause new assignments when ZooKeeper session state is uncertain.

## 185. Kafka-Like Broker Membership

### Requirement

Track live brokers and elect one controller.

### Layout

```text
/brokers/ids/<broker-id>        ephemeral
/controller/election/...        ephemeral sequential
/controller/current             persistent metadata
```

### Notes

- Broker session liveness is not complete application health.
- Controller actions require epochs.
- Metadata payload must remain small.
- Modern Apache Kafka releases use KRaft rather than ZooKeeper for new controller metadata architecture; treat ZooKeeper-based Kafka design as historical or migration context.

## 186. Database Shard Coordinator

### Requirement

Assign database shards to workers and recover after worker failure.

### Design

- Workers register ephemeral membership.
- Elected coordinator calculates assignment.
- Assignment update uses `multi` and version checks.
- Each assignment carries a monotonically increasing epoch.
- Workers watch only relevant assignment paths or use a cache.
- Database/storage validates epoch for destructive actions.

## 187. Service Configuration

### Requirement

All application instances should learn a configuration update within 10 seconds.

### Design

- Store immutable versioned configuration.
- Watch small current-version pointer.
- Applications maintain local cache.
- Validate before activation.
- Refresh state on reconnect.
- Track rollout acknowledgement outside or in a bounded subtree.

### Staleness budget

```text
publish write
+ watch delivery
+ client scheduling
+ config fetch
+ validation
<= 10 seconds
```

## 188. Active Worker Membership

### Requirement

Coordinator must know workers that are probably alive.

### Design

- One shared ZooKeeper session per worker process.
- Ephemeral member znode.
- Child watch/local cache in coordinator.
- Independent health and capacity signals.
- Session timeout selected from pause/network measurements.

### Limitation

Failure is detected only after session expiration, not immediately after process death.

## 189. Distributed Migration Lock

### Requirement

Only one deployment process may run a database migration.

### Design

- Curator inter-process mutex.
- Bounded acquire timeout.
- Fencing token stored in migration table.
- Database advisory lock or schema-version CAS as final safety boundary.

For database migrations, the database itself is often the best final lock authority.

## 190. Dynamic Feature Configuration

ZooKeeper can distribute small configuration, but a feature-flag platform may be better when requirements include:

- Targeting rules.
- Percentage rollout.
- Audit history.
- UI.
- Approval workflow.
- Experimentation.

ZooKeeper can store the current low-level coordination state, not necessarily provide the complete product.

<!-- IMAGE PLACEHOLDER
Title: Job scheduler leader with database fencing
What to use: Scheduler replicas elect through ZooKeeper, current leader writes jobs with epoch 42, stale leader with epoch 41 is rejected by the job database.
Preferred source: Create an original diagram based on ZooKeeper leader-election recipes.
Search terms: ZooKeeper scheduler leader fencing database epoch
Purpose: Show an end-to-end safe leader design.
Alt text: ZooKeeper elects a scheduler while the job database enforces the latest fencing epoch.
Editorial note: Make the database the final authority for side effects.
-->

# ZooKeeper vs Other Systems

## 191. Comparison Table

| System | Best at | Main difference from ZooKeeper |
|---|---|---|
| etcd | Strongly consistent coordination and Kubernetes metadata | Flat keyspace, Raft, lease and revision-oriented API |
| Consul | Service discovery, health checks, DNS and service mesh | Richer discovery/network product with Raft-backed servers |
| Redis | Cache, counters, ephemeral state and data structures | Asynchronous replication and different lock/consistency semantics |
| PostgreSQL | Transactions and durable relational state | No session-tied ephemeral hierarchy or native watches |
| Kubernetes Lease | Leader election inside Kubernetes | Platform-native and narrower in scope |
| Kafka | Durable event stream and replay | Log transport rather than coordination metadata |
| ZooKeeper | Hierarchical distributed coordination | Small state, quorum write dependency and operational complexity |

## 192. ZooKeeper vs etcd

Both solve distributed coordination and metadata problems.

ZooKeeper emphasizes:

- Hierarchical znodes.
- Sessions.
- Ephemeral and sequential nodes.
- One-shot and persistent watches.
- Zab.
- Mature recipes.

etcd emphasizes:

- Flat key-value namespace with prefixes.
- Global revisions.
- Leases.
- Watch streams.
- Raft.
- Linearizable read options.
- Kubernetes integration.

Choose based on:

- Existing ecosystem.
- Client language support.
- Operational expertise.
- Required watch/read semantics.
- Platform integration.

## 193. ZooKeeper vs Consul

Choose Consul when the core problem is:

- Service catalogue.
- Health checks.
- DNS discovery.
- Multi-datacenter service discovery.
- Service mesh.

Choose ZooKeeper when the core problem is:

- Custom coordination recipes.
- Ephemeral-sequential ordering.
- Existing ZooKeeper-based infrastructure.
- Hierarchical metadata and watch-based clients.

ZooKeeper membership does not provide the same integrated active-health-check product as Consul.

## 194. ZooKeeper vs Redis Locks

Redis lock:

- Very low latency.
- Simple lease with `SET NX PX`.
- Asynchronous replication/failover concerns.
- Requires token-safe release.
- Still needs fencing for critical resources.

ZooKeeper lock:

- Quorum-backed ordered coordination.
- Session-tied ephemeral ownership.
- Fair sequential queue recipe.
- Higher write latency.
- Still needs fencing for paused old owners.

Use neither as the sole safety boundary when the protected resource cannot reject stale owners.

## 195. ZooKeeper vs PostgreSQL Lock

Use PostgreSQL when:

- Protected state is already in PostgreSQL.
- Advisory lock or transactional row lock is enough.
- Atomicity with database changes matters.

Use ZooKeeper when:

- Coordination spans services and non-database resources.
- Session-tied membership is useful.
- Ordered contender queues are required.

Avoid introducing ZooKeeper only for one lock that the database can safely own.

## 196. ZooKeeper vs Kubernetes Lease

For applications running only in Kubernetes, the Lease API often handles leader election with less operational overhead.

Use ZooKeeper when:

- Coordination spans outside Kubernetes.
- Existing ZooKeeper recipes and namespace are required.
- More complex hierarchical coordination is needed.

## 197. ZooKeeper vs Kafka

ZooKeeper stores current coordination metadata.

Kafka stores an append-only event log with retention and replay.

Do not use ZooKeeper watches as a durable event bus.

Modern Apache Kafka 4.x uses KRaft rather than ZooKeeper for cluster metadata. ZooKeeper remains relevant independently and in legacy/migration deployments.

## 198. ZooKeeper vs DNS Service Discovery

DNS is excellent for broadly consumable endpoint lookup but has:

- TTL caching.
- Limited transaction semantics.
- No ephemeral-sequential recipes.

ZooKeeper provides richer coordination but requires ZooKeeper-aware clients or an adapter.

<!-- IMAGE PLACEHOLDER
Title: Coordination-system comparison matrix
What to use: Matrix comparing ZooKeeper, etcd, Consul, Redis locks, PostgreSQL and Kubernetes Lease across hierarchy, watches, leases, health checks, transactions and operations.
Preferred source: Official Apache ZooKeeper, etcd, Consul, Redis, PostgreSQL and Kubernetes documentation.
Search terms: ZooKeeper etcd Consul Redis lock Kubernetes lease comparison
Purpose: Support interview technology selection.
Alt text: Coordination systems differ in namespace, consistency, service discovery, lease and platform-integration capabilities.
Editorial note: Keep claims version-specific and avoid declaring one universally superior.
-->

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper lock vs database lock
What to use: A decision diagram: if protected state is in one transactional database, lock there; if coordination spans processes/resources, consider ZooKeeper plus fencing.
Preferred source: Create an original diagram based on the trade-offs in this guide.
Search terms: ZooKeeper distributed lock versus database advisory lock
Purpose: Prevent unnecessary ZooKeeper adoption.
Alt text: Database-native locks fit database transactions, while ZooKeeper coordinates distributed ownership across services.
Editorial note: Show external fencing for both lease-based designs where stale actors are possible.
-->

# Common Mistakes

## 199. Storing Large Data

Bad:

```text
large JSON blobs
files
job payloads
logs
```

Better:

```text
store URI, version, checksum and small metadata
```

## 200. Treating a Disconnect as Lock Loss

A disconnected session may still own the ephemeral lock node.

Do not immediately let the same process create a second session and act as both old and new owner without fencing.

## 201. Treating a Watch as a Durable Event

Watches are notifications to refresh state.

They are not:

- Replayable.
- Exactly once.
- A complete change history.

## 202. Watching the Lock Root

Waking every contender creates the herd effect.

Watch the immediate predecessor.

## 203. No Fencing Token

Session expiration can leave a paused process acting on external systems.

Use an ordered token enforced by the protected resource.

## 204. Blind Retry After Connection Loss

A create may have succeeded.

Sequential creates require GUID-based recovery or a tested recipe.

## 205. Four Voters for Better Availability

Four voters still tolerate only one failure, the same as three.

Use three or five ordinary voters.

## 206. Adding Voters to Scale Reads

More voters increase quorum communication.

Use observers for read scaling when their staleness is acceptable.

## 207. One Connection per Request

This creates session, TLS and socket churn.

Use long-lived shared clients.

## 208. Huge Child Lists

Recipes that repeatedly call `getChildren` on enormous parents will degrade.

Bound the namespace or choose another store.

## 209. Unversioned Writes

Using version `-1` everywhere allows stale clients to overwrite new state.

Use expected versions for ownership and configuration changes.

## 210. Secrets with Open ACLs

Never use world-anyone-all ACLs for sensitive production paths.

## 211. Quorum Across High-Latency Regions Without Intent

Every write pays quorum latency and network instability can trigger elections.

Place voters in low-latency failure domains unless global consensus is explicitly required.

## 212. Ignoring Transaction-Log Disk

Slow or full log disks destabilize writes and elections.

## 213. No Reconnection Refresh

After reconnecting, clients must refresh caches and re-establish required state/watch semantics.

## 214. Session Timeout Too Short

Brief network loss or GC pauses cause false ownership loss and failover churn.

## 215. Session Timeout Too Long

Dead leaders and members remain visible for too long.

Choose from measured failure and pause distributions.

## 216. Custom Lock Implementation Without Tests

Use Curator or another mature recipe library.

Still add application-level fencing.

## 217. Using ZooKeeper as a High-Throughput Counter

Every increment is a quorum write with version contention.

Use Redis, database atomic counters or stream aggregation depending on durability.

## 218. Assuming Ephemeral Means Immediate Cleanup

Cleanup happens after session expiration, not instant process death detection.

## 219. Partial Results Hidden from Users

If an application falls back to stale read-only data during quorum loss, mark and bound the staleness. Do not silently use it for safety-critical decisions.

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper anti-patterns
What to use: Poster-style visual with large znodes, root watches, blind retries, four-voter ensemble, no fencing, per-request connections and cross-region quorum, each paired with the correction.
Preferred source: Create an original diagram based on Apache ZooKeeper best practices and recipes.
Search terms: ZooKeeper common mistakes best practices
Purpose: Provide a memorable interview review page.
Alt text: Common ZooKeeper mistakes include large data, herd watches, unsafe retries, poor quorum sizing and locks without fencing.
Editorial note: Keep each anti-pattern concise and visually distinct.
-->

# Interview Decision Framework

## 220. Choose ZooKeeper When

```text
[ ] Shared coordination state is small.
[ ] Reads significantly outnumber writes.
[ ] Sessions and ephemeral ownership are useful.
[ ] Ordered sequential contenders simplify the design.
[ ] Clients need watch-based change notification.
[ ] Losing quorum may stop coordination writes.
[ ] A mature recipe library is available.
[ ] The team can operate a stateful quorum service.
```

## 221. Avoid ZooKeeper When

```text
[ ] The data is large.
[ ] The workload is a queue or event stream.
[ ] Writes are extremely high.
[ ] The problem is entirely inside one transactional database.
[ ] Platform-native leader election is sufficient.
[ ] Service discovery requires integrated health checking and DNS.
[ ] The team cannot operate quorum, storage and session behavior safely.
```

## 222. Recipe Checklist

```text
[ ] What znode paths are used?
[ ] Which nodes are persistent, ephemeral or sequential?
[ ] What happens on connection loss?
[ ] What happens on session expiration?
[ ] Which operation outcomes are ambiguous?
[ ] Are retries idempotent?
[ ] Which znode is watched?
[ ] Is there a herd effect?
[ ] Is optimistic version checking used?
[ ] Is an external fencing token required?
[ ] What cleans stale state?
[ ] What is the maximum child count and payload size?
[ ] Is a mature library available?
```

## 223. Ensemble Checklist

```text
[ ] Three or five voters?
[ ] Which failures must be tolerated?
[ ] Are voters spread across failure domains?
[ ] Are observers needed for reads?
[ ] What is the measured fsync latency?
[ ] What are tickTime, initLimit and syncLimit assumptions?
[ ] What session timeout is used?
[ ] Is TLS enabled for clients and quorum?
[ ] Are ACLs least-privilege?
[ ] Is autopurge configured?
[ ] Are snapshots/logs backed up?
[ ] Can the ensemble recover with one voter unavailable?
[ ] Are rolling upgrades and reconfiguration tested?
```

<!-- IMAGE PLACEHOLDER
Title: ZooKeeper design decision tree
What to use: Flow from coordination requirement through znode mode, versions, watches, recipe library, fencing, ensemble size and operational controls.
Preferred source: Create an original diagram from this guide.
Search terms: ZooKeeper design decision tree leader lock membership configuration
Purpose: Provide a reusable HLD interview workflow.
Alt text: ZooKeeper design starts with coordination semantics and proceeds through znode layout, failure handling, fencing and quorum deployment.
Editorial note: Make “use a simpler platform/database primitive” an early exit branch.
-->

# Interview Questions and Answers

## 224. What Is ZooKeeper?

ZooKeeper is a replicated distributed coordination service exposing a hierarchical namespace, versions, sessions, ephemeral/sequential znodes and watches. Applications use these primitives to implement leader election, locks, membership and configuration.

## 225. Why Not Store Business Data in ZooKeeper?

ZooKeeper keeps its active data tree in memory, replicates every write through quorum and has small-value assumptions. Large or high-volume data increases heap, snapshot, recovery and write cost.

## 226. What Is an Ensemble?

The set of ZooKeeper servers forming one replicated service.

## 227. Why Are Three or Five Servers Common?

A majority quorum is required. Three servers tolerate one failure; five tolerate two. Four still tolerates only one and requires a quorum of three.

## 228. What Is the Leader's Role?

The leader orders writes, assigns transaction IDs, broadcasts proposals, waits for quorum acknowledgement and commits transactions.

## 229. Can Clients Connect Only to the Leader?

No. Clients connect to any server. Followers and observers serve reads locally and forward writes to the leader.

## 230. Follower vs Observer?

A follower votes in leader election and write quorum. An observer replicates state and serves reads but does not vote.

## 231. What Is a Znode?

A node in ZooKeeper's hierarchical namespace containing a small byte-array value, children, metadata and ACLs.

## 232. Persistent vs Ephemeral Znode?

Persistent nodes remain until deleted. Ephemeral nodes are removed when the owning session expires.

## 233. What Is a Sequential Znode?

A znode whose name receives an increasing sequence suffix, useful for ordered contenders.

## 234. Can an Ephemeral Znode Have Children?

No.

## 235. What Is a Session?

A logical client relationship with the ensemble containing session identity, timeout, ephemerals and watches. It can survive reconnecting to a different server before expiration.

## 236. Disconnect vs Expiration?

Disconnect is temporary loss of a server connection. Expiration is an ensemble decision that permanently invalidates the session and removes ephemerals.

## 237. What Happens to Watches After Session Expiration?

They are lost with the session. The client creates a new session and rebuilds recipe/cache state.

## 238. Are Watches Persistent?

Traditional watches are one-shot. Modern ZooKeeper also supports persistent and persistent-recursive watches, subject to version and client support.

## 239. Are Watch Events a Complete Change Log?

No. They notify clients to reread current state. They are not a durable replayable event stream.

## 240. What Is the Herd Effect?

Many clients watch the same znode and all wake on one change, causing a burst. Lock/election recipes avoid it by watching only the immediate predecessor.

## 241. How Does ZooKeeper Leader Election Work?

Candidates create ephemeral sequential nodes. The lowest sequence is leader. Others watch their predecessor and recheck when it disappears.

## 242. How Does a ZooKeeper Lock Work?

Contenders create ephemeral sequential nodes under a lock path. The smallest owns the lock; each later contender watches its predecessor.

## 243. Why Does a ZooKeeper Lock Need Fencing?

A paused process can resume after its session expired and another client acquired the lock. The protected resource must reject the old client's lower fencing token.

## 244. What Is a Fencing Token?

A monotonically increasing ownership number included with external operations. The resource remembers the highest token and rejects older owners.

## 245. What Is `zxid`?

The ordered transaction identifier assigned to ZooKeeper state changes, conceptually containing a leader epoch and transaction sequence.

## 246. What Is Zab?

ZooKeeper Atomic Broadcast is the protocol for leader establishment, replica synchronization and quorum-committed ordered transaction broadcast.

## 247. Does ZooKeeper Use Raft?

No. ZooKeeper uses Zab. The protocols have analogous leader/log/quorum concepts but are not identical.

## 248. What Are ZooKeeper's Guarantees?

The documented guarantees include sequential consistency for client operations, atomicity, a single system image, reliability and timeliness under normal operation.

## 249. Are ZooKeeper Reads Strongly Consistent?

Reads are normally served by the connected server and can be stale. Ordered writes go through leader and quorum. Use `sync` and application design when a fresher read is required.

## 250. What Does `sync` Do?

It causes the connected server to synchronize with the leader before subsequent work, reducing stale-read risk.

## 251. What Is Znode Versioning Used For?

Optimistic compare-and-set. A write or delete can require an expected version and fail if another client changed the node.

## 252. What Is `multi`?

An atomic list of ZooKeeper operations: all succeed or none are applied. It does not include external systems.

## 253. What Happens If a Client Times Out During a Write?

The result is ambiguous. The write may have committed. Recovery must inspect state and use operation-specific idempotency.

## 254. Why Is Sequential Create Retry Difficult?

The node may have been created even if the response was lost. A blind retry creates another sequential node. Use a unique GUID and search for the existing contender.

## 255. How Does ZooKeeper Replicate Writes?

The leader proposes an ordered transaction, voting followers persist and acknowledge it, and the leader commits after quorum acknowledgement.

## 256. Why Are ZooKeeper Reads Faster Than Writes?

Reads are normally local in-memory operations. Writes require leader ordering, durable log I/O and quorum communication.

## 257. What Happens If the Leader Fails?

The ensemble pauses writes, elects a new leader, synchronizes histories and resumes broadcasting transactions.

## 258. What Happens If Quorum Is Lost?

Normal writes stop because the remaining servers cannot safely commit a transaction or establish authoritative leadership.

## 259. Why Does a Network Partition Not Create Two Writable Leaders?

Only a majority partition can form a quorum. Two disjoint majorities cannot exist in the same ordinary voter configuration.

## 260. What Is Read-Only Mode?

An optional mode where compatible clients can read stale local state from a server isolated from quorum, while writes remain unavailable.

## 261. What Are Transaction Logs and Snapshots?

The transaction log durably records mutations. Snapshots periodically serialize the in-memory tree. Restart loads a snapshot and replays later log entries.

## 262. Why Use a Separate Transaction-Log Disk?

To prevent snapshot or other disk I/O from interfering with fsync latency on the quorum write path.

## 263. Why Is Autopurge Important?

Old snapshots and logs otherwise accumulate and can fill the disk.

## 264. Does Replication Replace Backups?

No. Logical mistakes replicate to every server. Backups or replay sources are needed for disaster recovery.

## 265. How Do You Scale ZooKeeper Reads?

Distribute clients across followers and, when appropriate, add observers. Do not add voters solely for read scale.

## 266. How Do You Scale ZooKeeper Writes?

Write scaling is limited because all writes are leader-ordered and quorum-replicated. Reduce write rate, batch atomic metadata changes where appropriate and move high-volume data elsewhere.

## 267. What Determines ZooKeeper Memory?

Znodes, path/data bytes, metadata, ACLs, watches, sessions, connections and JVM object overhead.

## 268. What Is the Maximum Znode Size?

The default client/server buffer limit is just under 1 MiB, but recommended coordination values should normally be far smaller.

## 269. What Is Dynamic Reconfiguration?

Changing ensemble membership through supported APIs while the service remains operational, such as adding, removing or changing server roles.

## 270. What Is `tickTime`?

The base timing unit used for heartbeats, session and quorum timing.

## 271. What Are `initLimit` and `syncLimit`?

`initLimit` bounds initial follower synchronization time. `syncLimit` bounds normal follower lag/communication delay relative to the leader.

## 272. Why Can GC Pauses Be Dangerous?

A client or server can miss heartbeats, causing session expiration, follower removal or leader election. A paused lock owner may later resume stale work.

## 273. How Should ZooKeeper Be Deployed Across Availability Zones?

Spread voters so loss of one zone leaves quorum, commonly one of three voters per zone across three zones.

## 274. Should Voters Span Distant Regions?

Only when the application accepts WAN write latency and instability risk. Remote observers or regional coordination designs are often better.

## 275. How Are ZooKeeper ACLs Different from File Permissions?

Permissions separately control read, write, create children, delete children and ACL administration. Deleting a node is authorized through the parent's delete permission.

## 276. ZooKeeper vs etcd?

Both coordinate distributed systems. ZooKeeper provides hierarchical znodes, sessions and sequential recipes using Zab. etcd provides a revisioned flat key-value API, leases, watches and Raft, with strong Kubernetes alignment.

## 277. ZooKeeper vs Consul?

Consul is more directly a service-discovery, health-check, DNS and service-mesh product. ZooKeeper is a lower-level coordination kernel for custom recipes.

## 278. ZooKeeper vs Redis Lock?

ZooKeeper offers quorum-backed session and sequential ordering; Redis offers lower latency and simpler leases. Both need fencing for safety-critical external resources.

## 279. ZooKeeper vs Database Lock?

If the protected state is in one database, a database transaction/advisory lock is often simpler and more atomic. ZooKeeper is useful for cross-service coordination.

## 280. Does Modern Kafka Still Require ZooKeeper?

No for modern Kafka 4.x KRaft deployments. ZooKeeper was historically used for Kafka metadata and remains relevant for older clusters and migrations.

## 281. What Is the Biggest ZooKeeper Design Mistake?

Treating ephemeral ownership or a watch callback as complete safety without handling session ambiguity, retries and external fencing.

# Thirty-Second Summary

```text
ZooKeeper is a replicated distributed coordination service.

It is best for:
- Leader election.
- Cluster membership.
- Small configuration metadata.
- Ordered locks and ownership.
- Shard assignment.
- Watch-based coordination.

Its core rules are:
- Store only small coordination state.
- Use three or five voters.
- Understand leader, follower and observer roles.
- Remember that writes are quorum ordered but local reads can be stale.
- Distinguish TCP disconnect from session expiration.
- Treat watches as notifications to reread state.
- Use ephemeral sequential nodes for elections and locks.
- Watch only the immediate predecessor.
- Handle ambiguous retries.
- Use expected znode versions.
- Add fencing tokens for external side effects.
- Use a mature recipe library such as Curator.
- Monitor fsync, elections, sessions, watches and disk.

Do not use ZooKeeper by default for:
- Business records.
- Large values.
- High-volume queues.
- Event streams.
- Caches and counters.
- Analytics.
```

<!--
EDITORIAL SOURCES TO VERIFY BEFORE PUBLISHING

Use current official Apache ZooKeeper documentation as the primary source:

- Apache ZooKeeper homepage and overview
- Releases page
- Programmer's Guide
- Guarantees
- Watches
- ACLs and authentication
- Administrator's Guide
- Deployment and configuration parameters
- Observers
- Dynamic Reconfiguration
- ZooKeeper Recipes and Solutions
- ZooKeeper Internals / Zab protocol material
- Metrics and monitoring
- Quotas
- SSL/TLS and SASL configuration
- Four-letter commands and AdminServer
- Apache Curator recipes

VERSION-SENSITIVE NOTES

- As of July 2026, Apache ZooKeeper lists 3.9.5 as the current release and 3.8.6 as the latest stable release.
- Persistent watches, TTL nodes, container nodes, multi-address support, TLS options, FIPS behavior and dynamic reconfiguration depend on ZooKeeper and client versions.
- ZooKeeper 3.9.x security defaults and TLS/SASL settings should be verified against the exact patch release.
- The default `jute.maxbuffer` is just under 1 MiB, but this is not a recommended znode payload target.
- Read-only mode is optional and disabled by default; verify production suitability.
- Apache Kafka 4.x uses KRaft rather than ZooKeeper; ZooKeeper-based Kafka architecture should be labeled historical or migration-related.
- Curator recipes and cache classes evolve; verify non-deprecated APIs for the chosen version.
- Throughput, latency, znode-memory and failover numbers in this guide are interview assumptions or examples, not Apache ZooKeeper guarantees.
-->
