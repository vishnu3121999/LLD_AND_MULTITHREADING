# Approach Comparison

## Existing Packages

`A_basic` demonstrates a simple logging system with applications, appenders, log levels, log entries, and direct in-facade publishing.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- A logging application has one or more appenders.
- An appender can represent console or file output.
- A log entry has level, message, and timestamp.

Action based points:
- Admin creates applications and appenders.
- User/system writes log entries.
- System publishes a log entry to appenders whose minimum level accepts it.

Misc:
- A_basic stores appended log entry IDs instead of writing to real console/file sinks.
- Async logging, formatters, appenders as strategies, and filters are deferred.

#### Common Misc

Offline or online:
- Treat as API-style because applications, appenders, and log entries are stored independently.

Extensibility:
- Appender behavior, formatting, and filtering are future extension points.
- LogLevel and AppenderType are enums in A_basic.

History and undo:
- Log history is retained as LogEntry records; undo is not needed.

Notifications:
- Not needed.

Exception handling:
- Missing app and invalid level are later validations.

Concurrency:
- Concurrent logging to the same appender is deferred to concurrency packages.

### UseCase Diagram

Actors:
- User/System
- Admin
- System

UseCases:
- addApplication(Admin) -> create LogApplication(System) -> putLogApplication(DataStore)
- addAppender(Admin) -> create Appender(System) -> putAppender(DataStore) -> add appender id to LogApplication(System)
- log(User/System) -> create LogEntry(System) -> putLogEntry(DataStore) -> publish(System)
- publish(System) -> check appender min level(System) -> append log entry id(System)

### Class Diagram

Layers:
- `Main` configures appenders and writes logs.
- `LoggerFacade` owns logging and appender publishing.
- `DataStore` stores maps only.
- Models own only simple state like appender log-entry lists.

Core entities:
- `LogApplication(logApplicationId, name, appenderList)` stores appender IDs.
- `Appender(appenderId, appenderType, minLevel, logEntryList)` records accepted entries.
- `LogEntry(logEntryId, logLevel, message, createdAt)` represents one log event.

Method placement:
- `log` belongs in the facade because it creates and publishes entries.
- `publish` is a facade system method in A_basic.
- `accepts` and `append` belong in `Appender` because they only use appender state.
