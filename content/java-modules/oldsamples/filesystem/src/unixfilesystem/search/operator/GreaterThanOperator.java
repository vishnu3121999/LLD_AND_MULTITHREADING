package unixfilesystem.search.operator;

@SuppressWarnings({"rawtypes", "unchecked"})
public class GreaterThanOperator implements ComparisonOperator {
    @Override
    public boolean matches(Object actualValue, Object expectedValue) {
        if (!(actualValue instanceof Comparable) || expectedValue == null) {
            return false;
        }
        return ((Comparable) actualValue).compareTo(expectedValue) > 0;
    }
}
