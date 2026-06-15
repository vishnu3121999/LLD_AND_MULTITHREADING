package unixfilesystem.model;

public enum NodeAttribute {
    NAME {
        @Override
        public Object extract(FSNode node) {
            return node.getName();
        }
    },
    OWNER {
        @Override
        public Object extract(FSNode node) {
            return node.getOwner();
        }
    },
    SIZE {
        @Override
        public Object extract(FSNode node) {
            return node.getSize();
        }
    },
    CREATED_AT {
        @Override
        public Object extract(FSNode node) {
            return node.getCreatedTs();
        }
    };

    public abstract Object extract(FSNode node);
}
