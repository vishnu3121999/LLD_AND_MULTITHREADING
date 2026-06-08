package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.FileSystemFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== File System Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        FileSystemFacade facade = new FileSystemFacade(dataStore);
        String fsId = id("fs");
        String rootId = id("dir");
        String docsId = id("dir");
        String fileId = id("file");
        facade.createFileSystem(fsId, "LocalFS", rootId, "/");
        facade.createDirectory(rootId, docsId, "docs");
        facade.createFile(docsId, fileId, "notes.txt", "first draft");
        facade.writeFile(fileId, "updated draft");
        System.out.println(dataStore.getFileSystem(fsId));
        System.out.println(dataStore.getDirectory(docsId));
        System.out.println(facade.readFile(fileId));
        System.out.println(facade.listDirectory(rootId));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
