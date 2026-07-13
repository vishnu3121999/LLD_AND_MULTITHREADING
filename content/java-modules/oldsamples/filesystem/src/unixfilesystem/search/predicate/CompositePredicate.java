package unixfilesystem.search.predicate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class CompositePredicate implements Predicate {
    private final List<Predicate> predicates;

    protected CompositePredicate(List<Predicate> predicates) {
        this.predicates = new ArrayList<>(predicates);
    }

    protected List<Predicate> getPredicates() {
        return Collections.unmodifiableList(predicates);
    }
}
