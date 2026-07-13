# Approach Comparison

## Existing Packages

`A_basic` demonstrates the first runnable in-memory logger design with logger configuration, log levels, log sinks, log events, facade APIs, and a simple console sink flow.

Later packages can add appender abstractions, formatter strategies, asynchronous logging, file/network sinks, rotation, filtering rules, persistence, exception handling, and concurrency-safe writes.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports multiple logger configurations.
- Each logger has a name, minimum log level, attached sink IDs, and stored log event IDs.
- Each sink has a sink type and stores the log event IDs written to it.
- Each log event stores level, logger name, message, and creation time.

Action based points:
- Admin Actions:
  - Admin creates logger configurations.
  - Admin creates log sinks.
  - Admin attaches sinks to loggers.
  - Admin updates the minimum log level for a logger.
- User Actions:
  - User writes debug, info, warn, error, or direct level-based logs.
  - User reads stored logs for a logger.
- System Actions:
  - Compare the requested log level with the logger's minimum level.
  - Create and store accepted log events.
  - Attach accepted log events to the logger and its sinks.
  - Print accepted events when the sink type is `CONSOLE`.

Misc:
- A_basic includes only a simple severity threshold and console printing.
- The `MEMORY` sink type is modeled as a sink label; it stores event IDs but does not need a separate writer implementation yet.
- Advanced formatting, appenders, file output, rolling policies, structured logs, async queues, fallback sinks, and validation are deferred.

#### Common Misc

Offline or online:
- Treat as an in-process logging library/API because the demo creates loggers and sinks inside one JVM process.
- The package still uses datastore maps so logger configs, sinks, and events are stored independently and can be extended later.

Extensibility:
- Core entities:
  - `LogLevel` can grow with levels such as `TRACE` or `FATAL`.
  - `SinkType` can grow with sinks such as `FILE`, `DATABASE`, `HTTP`, or `QUEUE`.
- Behaviour:
  - Formatting can later become a Strategy.
  - Sink writing can later become an Appender or Writer abstraction.
  - Sink creation can later use Factory if sink setup becomes type-specific.
  - Filtering can later move beyond a single minimum severity threshold.

History and undo:
- Undo is not needed for logging.
- Stored log events provide basic history for the demo.
- A production logger would likely persist history externally instead of relying on in-memory process state.

Notifications:
- Not needed in A_basic.
- Later packages can broadcast log events to subscribers, monitoring hooks, or alerting systems.

Exception handling:
- Missing logger IDs, missing sink IDs, duplicate IDs, null messages, unsupported sink types, and failed sink writes are later-package validations.

Edge cases:
- Empty sink lists, duplicate sink attachments, log volume growth, timestamp formatting, sink failures, and log ordering across threads are deferred.

Concurrency:
- Real logging is naturally concurrent because many threads can write logs at the same time.
- A_basic intentionally uses `HashMap`, `ArrayList`, and no locks.
- Later packages should make event creation, sink writes, and per-logger event lists thread-safe.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addLogger(Admin) -> create LoggerConfig(System) -> putLoggerConfig(DataStore)
- addLogSink(Admin) -> create LogSink(System) -> putLogSink(DataStore)
- attachSinkToLogger(Admin) -> get LoggerConfig(System) -> add sink ID(System)
- updateMinimumLogLevel(Admin) -> get LoggerConfig(System) -> update level(System)
- log(User) -> compare severity(System) -> createLogEvent(System) -> writeToSinks(System)
- debug/info/warn/error(User) -> call log(System)
- getLogs(User) -> read logger event IDs(System) -> resolve LogEvents(DataStore)

### Class Diagram

Layers:
- `Main` creates direct admin IDs, configures one logger and one console sink, and writes sample logs through the facade.
- `LoggerFacade` owns user, admin, system, and helper workflows.
- `DataStore` and `InMemoryDataStore` store maps only.
- Models own simple local state such as logger sink/event lists and minimum level updates.

Identify Core Entities and Cardinality:
- LoggerConfig -> LogSink
- LoggerConfig -> LogEvent
- LogSink -> LogEvent

Core entities:
- `LoggerConfig(loggerId, name, minimumLogLevel, logSinkList, logEventList)` represents one named logger and its attached sink/event IDs.
- `LogSink(logSinkId, name, sinkType, logEventList)` represents one output destination and the event IDs written to it.
- `LogEvent(logEventId, logLevel, loggerName, message, createdAt)` represents one accepted log message.

Enums:
- `LogLevel`: `DEBUG`, `INFO`, `WARN`, `ERROR`, with numeric severity for threshold comparison.
- `SinkType`: `CONSOLE`, `MEMORY`.

Method placement:
- `LoggerFacade.debug`, `info`, `warn`, `error`, and `log` belong in the facade because callers should use one API surface for logging.
- `LoggerFacade.createLogEvent` belongs in the facade because it creates the system-owned event ID and coordinates datastore writes.
- `LoggerFacade.writeToSinks` belongs in the facade in A_basic because sink writer strategies are intentionally deferred.
- `LoggerFacade.addLogger`, `addLogSink`, `attachSinkToLogger`, and `updateMinimumLogLevel` are admin workflows.
- `LoggerConfig.addLogSink`, `addLogEvent`, and `updateMinimumLogLevel` belong in `LoggerConfig` because they mutate logger-owned state.
- `LogSink.addLogEvent` belongs in `LogSink` because it only records that a sink received an event.
- `DataStore` methods only get, put, contains, and remove entities; no business logic belongs in datastore.
