package A_basic.model;

import A_basic.model.enums.NodeType;

public abstract class FileSystemNode {
    private final String nodeId;
    private final String name;
    private final String owner;
    private final NodeType nodeType;

    protected FileSystemNode(String nodeId, String name, String owner, NodeType nodeType) {
        this.nodeId = nodeId;
        this.name = name;
        this.owner = owner;
        this.nodeType = nodeType;
    }

    public String getNodeId() {
        return nodeId;
    }

    public String getName() {
        return name;
    }

    public String getOwner() {
        return owner;
    }

    public NodeType getNodeType() {
        return nodeType;
    }
}
