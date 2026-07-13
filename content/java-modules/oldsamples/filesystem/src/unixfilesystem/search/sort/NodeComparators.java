package unixfilesystem.search.sort;

import unixfilesystem.model.FSNode;

import java.util.Comparator;

public final class NodeComparators {
    private NodeComparators() {
    }

    public static Comparator<FSNode> byName() {
        return Comparator.comparing(FSNode::getName);
    }

    public static Comparator<FSNode> bySize() {
        return Comparator.comparingLong(FSNode::getSize);
    }

    public static Comparator<FSNode> byCreatedAt() {
        return Comparator.comparing(FSNode::getCreatedTs);
    }

}
