package unixfilesystem.core;

import unixfilesystem.model.Directory;
import unixfilesystem.model.FSNode;
import unixfilesystem.model.File;
import unixfilesystem.search.Criteria;

import java.util.List;

public class FSFacade {
    private final FileSystem fileSystem;

    public FSFacade(FileSystem fileSystem) {
        this.fileSystem = fileSystem;
    }

    public Directory createDirectory(String parentPath, String directoryName) {
        return fileSystem.createDirectory(parentPath, directoryName);
    }

    public File createFile(String parentPath, String fileName, String content) {
        return fileSystem.createFile(parentPath, fileName, content);
    }

    public FSNode read(String path) {
        return fileSystem.getNode(path);
    }


    public List<FSNode> search(String path, Criteria criteria) {
        return fileSystem.search(path, criteria);
    }
}
