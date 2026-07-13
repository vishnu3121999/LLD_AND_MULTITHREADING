package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Directory;
import A_basic.model.File;
import A_basic.model.FileSystemNode;
import A_basic.model.enums.NodeType;

import java.util.ArrayList;
import java.util.List;

public class FileSystemFacade {
    private final DataStore dataStore;

    public FileSystemFacade(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    // User methods

    public Directory createDirectory(String parentDirectoryId, String directoryId, String name, String owner) {
        Directory directory = new Directory(directoryId, name, owner);
        dataStore.putDirectory(directory.getDirectoryId(), directory);
        dataStore.getDirectory(parentDirectoryId).addChild(directoryId);
        return directory;
    }

    public File createFile(String parentDirectoryId, String fileId, String name, String owner, String content) {
        File file = new File(fileId, name, owner, content);
        dataStore.putFile(file.getFileId(), file);
        dataStore.getDirectory(parentDirectoryId).addChild(fileId);
        return file;
    }

    public String readFile(String fileId) {
        return dataStore.getFile(fileId).getContent();
    }

    public void writeFile(String fileId, String content) {
        dataStore.getFile(fileId).write(content);
    }

    public List<FileSystemNode> listDirectory(String directoryId) {
        List<FileSystemNode> nodeList = new ArrayList<>();
        for (String childId : dataStore.getDirectory(directoryId).getChildList()) {
            nodeList.add(getNode(childId));
        }
        return nodeList;
    }

    public List<FileSystemNode> searchByName(String directoryId, String name) {
        List<FileSystemNode> nodeList = new ArrayList<>();
        searchNode(dataStore.getDirectory(directoryId), name, nodeList);
        return nodeList;
    }

    public FileSystemNode resolvePath(String rootDirectoryId, String path) {
        if ("/".equals(path)) {
            return dataStore.getDirectory(rootDirectoryId);
        }

        Directory currentDirectory = dataStore.getDirectory(rootDirectoryId);
        FileSystemNode currentNode = currentDirectory;
        String[] pathParts = path.substring(1).split("/");

        for (String pathPart : pathParts) {
            currentNode = findChildByName(currentDirectory, pathPart);
            if (currentNode.getNodeType() == NodeType.DIRECTORY) {
                currentDirectory = dataStore.getDirectory(currentNode.getNodeId());
            }
        }
        return currentNode;
    }

    public String getPath(String rootDirectoryId, String nodeId) {
        return buildPath(dataStore.getDirectory(rootDirectoryId), nodeId, "/");
    }

    // System methods

    public long getSize(String nodeId) {
        FileSystemNode node = getNode(nodeId);
        if (node.getNodeType() == NodeType.FILE) {
            return dataStore.getFile(nodeId).getSize();
        }

        long totalSize = 0;
        Directory directory = dataStore.getDirectory(nodeId);
        for (String childId : directory.getChildList()) {
            totalSize += getSize(childId);
        }
        return totalSize;
    }

    // Admin methods

    public Directory addRootDirectory(String directoryId, String name, String owner) {
        Directory directory = new Directory(directoryId, name, owner);
        dataStore.putDirectory(directory.getDirectoryId(), directory);
        return directory;
    }

    // Util/helper methods

    private FileSystemNode getNode(String nodeId) {
        if (dataStore.containsDirectory(nodeId)) {
            return dataStore.getDirectory(nodeId);
        }
        return dataStore.getFile(nodeId);
    }

    private FileSystemNode findChildByName(Directory directory, String name) {
        for (String childId : directory.getChildList()) {
            FileSystemNode child = getNode(childId);
            if (child.getName().equals(name)) {
                return child;
            }
        }
        return null;
    }

    private void searchNode(FileSystemNode node, String name, List<FileSystemNode> nodeList) {
        if (node.getName().equals(name)) {
            nodeList.add(node);
        }

        if (node.getNodeType() == NodeType.DIRECTORY) {
            Directory directory = dataStore.getDirectory(node.getNodeId());
            for (String childId : directory.getChildList()) {
                searchNode(getNode(childId), name, nodeList);
            }
        }
    }

    private String buildPath(Directory directory, String nodeId, String currentPath) {
        if (directory.getDirectoryId().equals(nodeId)) {
            return currentPath;
        }

        for (String childId : directory.getChildList()) {
            FileSystemNode child = getNode(childId);
            String childPath = "/".equals(currentPath) ? currentPath + child.getName() : currentPath + "/" + child.getName();
            if (child.getNodeId().equals(nodeId)) {
                return childPath;
            }
            if (child.getNodeType() == NodeType.DIRECTORY) {
                String path = buildPath(dataStore.getDirectory(child.getNodeId()), nodeId, childPath);
                if (path != null) {
                    return path;
                }
            }
        }
        return null;
    }
}
