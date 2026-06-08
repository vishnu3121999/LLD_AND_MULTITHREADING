# Approach Comparison

## Existing Packages

`A_basic` demonstrates a simple in-memory file system with a root directory, nested directories, files, reads, writes, and directory listing.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- A file system has one root directory.
- Directories can contain child directories and files.
- Files contain readable and writable text content.

Action based points:
- Admin creates the file system and root directory.
- User creates directories and files.
- User writes and reads file content.
- User lists a directory.

Misc:
- A_basic uses IDs instead of path parsing.
- Permissions, path resolution, deletes, moves, and validations are deferred.

#### Common Misc

Offline or online:
- This can be offline, but it is still facade/datastore shaped for consistency.

Extensibility:
- Node permissions, metadata, storage backends, path parsing, and search are later features.

History and undo:
- Version history is not needed in A_basic.

Notifications:
- Not needed.

Exception handling:
- Missing paths, duplicate names, invalid writes, and permissions are later validations.

Concurrency:
- Concurrent writes to a file are deferred.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- createFileSystem(Admin) -> create root Directory(System) -> create FileSystem(System)
- createDirectory(User) -> create Directory(System) -> add directory id to parent Directory(System)
- createFile(User) -> create File(System) -> add file id to parent Directory(System)
- writeFile(User) -> update File content(System)
- readFile(User) -> return File content(System)
- listDirectory(User) -> combine child directory ids and file ids(System)

### Class Diagram

Layers:
- `Main` creates IDs and runs the file flow.
- `FileSystemFacade` owns creation, read, write, and listing workflows.
- `DataStore` stores maps only.
- Models own their simple state.

Core entities:
- `FileSystem(fileSystemId, name, rootDirectoryId)` points to root.
- `Directory(directoryId, name, directoryList, fileList)` stores child IDs.
- `File(fileId, name, content)` owns content reads and writes.

Method placement:
- Creation and listing belong in the facade because they coordinate datastore and parent-child relationships.
- `write` and `read` belong in `File` because they only use file state.
