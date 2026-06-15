package unixfilesystem.model;

import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

public class Directory extends FSNode {
    private final List<FSNode> children = new ArrayList<>();

    public Directory(String name, String owner) {
        super(name, owner);
    }

    public void addChild(FSNode node) {
        children.add(node);
        node.setParent(this);
    }

    public FSNode getChild(String name) {
        return children.stream()
                .filter(child -> child.getName().equals(name))
                .findFirst()
                .orElse(null);
    }

    public boolean containsChild(String name) {
        return getChild(name) != null;
    }

    public void removeChild(String name) {
        FSNode removedNode = getChild(name);
        if (removedNode == null) {
            throw new IllegalArgumentException("Node not found: " + name);
        }
        children.remove(removedNode);
        removedNode.setParent(null);
    }

    public List<FSNode> getChildren() {
        return Collections.unmodifiableList(children);
    }

    @Override
    public long getSize() {
        return children.stream()
                .mapToLong(FSNode::getSize)
                .sum();
    }

}
