package unixfilesystem.core;

import unixfilesystem.model.Directory;
import unixfilesystem.model.FSNode;
import unixfilesystem.model.File;
import unixfilesystem.search.Criteria;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FileSystem {
    private final Directory root;
    private final String defaultOwner;

    public FileSystem(Directory root) {
        this(root, "system");
    }

    public FileSystem(Directory root, String defaultOwner) {
        this.root = Objects.requireNonNull(root, "root cannot be null");
        this.defaultOwner = Objects.requireNonNull(defaultOwner, "defaultOwner cannot be null");
    }

    public Directory createDirectory(String parentPath, String directoryName) {
        Directory parent = (Directory) getNode(parentPath);
        Directory directory = new Directory(directoryName, defaultOwner);
        parent.addChild(directory);
        directory.setParent(parent);
        return directory;
    }

    public File createFile(String parentPath, String fileName, String content) {
        Directory parent = (Directory) getNode(parentPath);
        File file = new File(fileName, defaultOwner, content);
        parent.addChild(file);
        file.setParent(parent);
        return file;
    }

    public FSNode getNode(String path) {
        if ("/".equals(path)) {
            return root;
        }

        String[] segments = path.substring(1).split("/");
        FSNode current = root;
        for (String segment : segments) {
            if (segment.isEmpty()) {
                continue;
            }

            if (!(current instanceof Directory)) {
                throw new IllegalArgumentException("Path points inside a file: " + path);
            }

            current = ((Directory) current).getChild(segment);
            if (current == null) {
                throw new IllegalArgumentException("Path not found: " + path);
            }
        }
        return current;
    }



    public List<FSNode> search(String path, Criteria criteria) {
        FSNode startNode = getNode(path);
        Stream<FSNode> stream = traverse(startNode).stream();

        if (criteria.getPredicate() != null) {
            stream = stream.filter(criteria.getPredicate()::isMatch);
        }
        if (criteria.getSorter() != null) {
            stream = stream.sorted(criteria.getSorter());
        }
        if (criteria.getLimit() > 0) {
            stream = stream.limit(criteria.getLimit());
        }

        return stream.collect(Collectors.toList());
    }


    private List<FSNode> traverse(FSNode node) {
        List<FSNode> nodes = new ArrayList<>();
        nodes.add(node);
        if (node instanceof Directory) {
            for (FSNode child : ((Directory) node).getChildren()) {
                nodes.addAll(traverse(child));
            }
        }
        return nodes;
    }


}
