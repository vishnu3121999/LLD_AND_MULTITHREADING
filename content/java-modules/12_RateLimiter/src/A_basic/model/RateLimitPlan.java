package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class RateLimitPlan {
    private final String rateLimitPlanId;
    private final String name;
    private final List<String> rateLimitRuleList;

    public RateLimitPlan(String rateLimitPlanId, String name) {
        this.rateLimitPlanId = rateLimitPlanId;
        this.name = name;
        this.rateLimitRuleList = new ArrayList<>();
    }

    public void addRateLimitRule(String rateLimitRuleId) {
        rateLimitRuleList.add(rateLimitRuleId);
    }

    public List<String> getRateLimitRuleList() {
        return Collections.unmodifiableList(rateLimitRuleList);
    }

    public String getRateLimitPlanId() {
        return rateLimitPlanId;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "RateLimitPlan{"
                + "rateLimitPlanId='" + rateLimitPlanId + '\''
                + ", name='" + name + '\''
                + ", rateLimitRuleList=" + rateLimitRuleList
                + '}';
    }
}
