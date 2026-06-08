package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Directory;
import A_basic.model.File;
import A_basic.model.FileSystem;

import java.util.ArrayList;
import java.util.List;

public class FileSystemFacade {
    private final DataStore dataStore;
    public FileSystemFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public void createDirectory(String parentDirectoryId, String directoryId, String name) {
        Directory directory = new Directory(directoryId, name);
        dataStore.putDirectory(directory.getDirectoryId(), directory);
        dataStore.getDirectory(parentDirectoryId).addDirectory(directoryId);
    }

    public void createFile(String parentDirectoryId, String fileId, String name, String content) {
        File file = new File(fileId, name, content);
        dataStore.putFile(file.getFileId(), file);
        dataStore.getDirectory(parentDirectoryId).addFile(fileId);
    }

    public void writeFile(String fileId, String content) { dataStore.getFile(fileId).write(content); }
    public String readFile(String fileId) { return dataStore.getFile(fileId).read(); }

    public List<String> listDirectory(String directoryId) {
        Directory directory = dataStore.getDirectory(directoryId);
        List<String> result = new ArrayList<>();
        result.addAll(directory.getDirectoryList());
        result.addAll(directory.getFileList());
        return result;
    }

    // System methods

    // Admin methods

    public void createFileSystem(String fileSystemId, String name, String rootDirectoryId, String rootName) {
        Directory rootDirectory = new Directory(rootDirectoryId, rootName);
        dataStore.putDirectory(rootDirectory.getDirectoryId(), rootDirectory);
        FileSystem fileSystem = new FileSystem(fileSystemId, name, rootDirectoryId);
        dataStore.putFileSystem(fileSystem.getFileSystemId(), fileSystem);
    }

    // Util/helper methods
}
