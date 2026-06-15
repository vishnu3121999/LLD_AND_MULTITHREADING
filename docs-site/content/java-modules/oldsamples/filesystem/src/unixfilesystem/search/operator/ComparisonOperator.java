package unixfilesystem.search.operator;

public interface ComparisonOperator {
    boolean matches(Object actualValue, Object expectedValue);
}
