package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.FileSystemNode;
import A_basic.service.FileSystemFacade;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== File System Basic Demo ===");

        DataStore dataStore = new InMemoryDataStore();
        FileSystemFacade facade = new FileSystemFacade(dataStore);

        String rootDirectoryId = id("dir");
        String documentsDirectoryId = id("dir");
        String projectsDirectoryId = id("dir");
        String imagesDirectoryId = id("dir");
        String designFileId = id("file");
        String notesFileId = id("file");
        String wallpaperFileId = id("file");

        facade.addRootDirectory(rootDirectoryId, "root", "system");
        facade.createDirectory(rootDirectoryId, documentsDirectoryId, "documents", "vishn");
        facade.createDirectory(documentsDirectoryId, projectsDirectoryId, "projects", "vishn");
        facade.createDirectory(documentsDirectoryId, imagesDirectoryId, "images", "vishn");

        facade.createFile(projectsDirectoryId, designFileId, "design.txt", "vishn", "unix filesystem design");
        facade.createFile(projectsDirectoryId, notesFileId, "notes.txt", "vishn", "lld notes");
        facade.createFile(imagesDirectoryId, wallpaperFileId, "wallpaper.png", "vishn", "binary-content");

        facade.writeFile(notesFileId, "lld notes for file system");

        System.out.println("Read notes.txt: " + facade.readFile(notesFileId));
        System.out.println("Documents size: " + facade.getSize(documentsDirectoryId));
        System.out.println("Path for design.txt: " + facade.getPath(rootDirectoryId, designFileId));
        System.out.println("Resolved path: " + facade.resolvePath(rootDirectoryId, "/documents/projects/design.txt"));

        List<FileSystemNode> projectFiles = facade.listDirectory(projectsDirectoryId);
        System.out.println("Project directory: " + projectFiles);

        List<FileSystemNode> searchResults = facade.searchByName(rootDirectoryId, "notes.txt");
        System.out.println("Search results: " + searchResults);
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
