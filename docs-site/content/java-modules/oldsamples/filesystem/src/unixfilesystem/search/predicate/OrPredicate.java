package unixfilesystem.search.predicate;

import unixfilesystem.model.FSNode;

import java.util.List;

public class OrPredicate extends CompositePredicate {
    public OrPredicate(List<Predicate> predicates) {
        super(predicates);
    }

    @Override
    public boolean isMatch(FSNode node) {
        return getPredicates().stream().anyMatch(predicate -> predicate.isMatch(node));
    }
}
