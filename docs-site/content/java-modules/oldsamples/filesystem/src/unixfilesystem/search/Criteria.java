package unixfilesystem.search;

import unixfilesystem.model.FSNode;
import unixfilesystem.search.predicate.Predicate;

import java.util.Comparator;

public class Criteria {
    private final Predicate predicate;
    private final Comparator<FSNode> sorter;
    private final int limit;

    private Criteria(Builder builder) {
        this.predicate = builder.predicate;
        this.sorter = builder.sorter;
        this.limit = builder.limit;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Predicate getPredicate() {
        return predicate;
    }

    public Comparator<FSNode> getSorter() {
        return sorter;
    }

    public int getLimit() {
        return limit;
    }

    public static class Builder {
        private Predicate predicate;
        private Comparator<FSNode> sorter;
        private int limit;

        public Builder predicate(Predicate predicate) {
            this.predicate = predicate;
            return this;
        }

        public Builder sorter(Comparator<FSNode> sorter) {
            this.sorter = sorter;
            return this;
        }

        public Builder limit(int limit) {
            this.limit = limit;
            return this;
        }

        public Criteria build() {
            return new Criteria(this);
        }
    }
}
