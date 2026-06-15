# Approach Comparison

## Existing Packages

`A_basic` demonstrates a small in-memory file system with directories, files, path resolution, listing, search, file read/write, and recursive size calculation.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The file system starts from a root directory.
- A directory can contain child directories and files.
- A file stores mutable content and reports its size from that content.
- Directories and files share common node metadata such as ID, name, owner, and node type.
- Child relationships are stored as node IDs in `Directory.childList`.

Action based points:
- Admin creates the root directory.
- User creates directories under an existing parent directory.
- User creates files under an existing parent directory.
- User reads and writes file content.
- User lists directory children.
- User searches nodes by name from a directory.
- User resolves an absolute path from the root directory.
- System calculates file or directory size.

Misc:
- A_basic assumes valid parent IDs, node IDs, paths, and names.
- Duplicate names, permissions, deletes, moves, renames, symbolic links, quotas, and metadata updates are deferred.
- Path resolution and recursive search are intentionally simple and happy-path.

#### Common Misc

Offline or online:
- Treat this as an in-process file-system model with datastore-backed APIs.
- The package uses in-memory maps, so nodes are lost when the process exits.

Extensibility:
- File and directory are current node variants through `NodeType`.
- Permissions, ownership rules, path normalization, delete behavior, and storage backends are future extension points.
- Search can later support filters such as extension, owner, size, and timestamps.
- Storage can stay behind `DataStore` so persistent or remote implementations can be added later.

History and undo:
- Not needed in A_basic.
- Undo for writes, renames, moves, and deletes can be added later with Command or Memento-style history.

Notifications:
- Not needed in A_basic.
- File watchers or change notifications can be introduced later as an Observer-style extension.

Exception handling:
- Missing nodes, invalid paths, duplicate child names, unsupported operations, and permission failures are later validations.
- A_basic allows null pointer failures if callers break the happy-path contract.

Concurrency:
- Concurrent file writes, directory updates, and path traversal are deferred.
- A later package can add locks or thread-safe structures around node and datastore mutations.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addRootDirectory(Admin) -> create Directory(System) -> putDirectory(DataStore)
- createDirectory(User) -> create Directory(System) -> putDirectory(DataStore) -> add child ID to parent Directory(System)
- createFile(User) -> create File(System) -> putFile(DataStore) -> add child ID to parent Directory(System)
- readFile(User) -> get File(System) -> return content(System)
- writeFile(User) -> get File(System) -> update content(System)
- listDirectory(User) -> read child IDs(System) -> resolve nodes(System)
- searchByName(User) -> recursively scan nodes(System) -> return matching nodes(System)
- resolvePath(User) -> walk path parts from root(System) -> return final node(System)
- getSize(System) -> calculate file size or recursive directory size(System)

### Class Diagram

Layers:
- `Main` creates IDs and runs the file-system demo.
- `FileSystemFacade` owns user, admin, and system workflows.
- `DataStore` abstracts storage for independently stored directories and files.
- `InMemoryDataStore` implements storage using `HashMap`.
- Models own local node state and simple mutations.

Core entities:
- `FileSystemNode(nodeId, name, owner, nodeType)` stores common metadata for files and directories.
- `Directory(directoryId, name, owner, childList)` stores child node IDs.
- `File(fileId, name, owner, content)` stores file content and calculates size.
- `NodeType` identifies whether a node is a `DIRECTORY` or `FILE`.

Method placement:
- `addRootDirectory` belongs in the facade because it is an admin setup operation.
- `createDirectory` and `createFile` belong in the facade because they coordinate datastore writes and parent-child updates.
- `readFile` and `writeFile` belong in the facade because callers should use the public file-system API.
- `listDirectory`, `searchByName`, `resolvePath`, and `getPath` belong in the facade because they coordinate traversal across multiple nodes.
- `getSize` belongs in the facade in A_basic because directory size requires recursive datastore lookups.
- `Directory.addChild` belongs in `Directory` because it only mutates that directory's child list.
- `File.write` and `File.getSize` belong in `File` because they only use that file's content.
