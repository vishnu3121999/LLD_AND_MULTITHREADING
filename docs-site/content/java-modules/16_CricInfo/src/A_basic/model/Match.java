package A_basic.model;

import A_basic.model.enums.MatchStatus;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Match {
    private final String matchId;
    private final String teamOneId;
    private final String teamTwoId;
    private final List<String> inningsList;
    private MatchStatus matchStatus;
    public Match(String matchId, String teamOneId, String teamTwoId) { this.matchId = matchId; this.teamOneId = teamOneId; this.teamTwoId = teamTwoId; this.inningsList = new ArrayList<>(); this.matchStatus = MatchStatus.SCHEDULED; }
    public void start() { matchStatus = MatchStatus.LIVE; }
    public void addInnings(String inningsId) { inningsList.add(inningsId); }
    @Override public String toString() { return "Match{" + "matchId='" + matchId + "'" + ", teamOneId='" + teamOneId + "'" + ", teamTwoId='" + teamTwoId + "'" + ", inningsList=" + inningsList + ", matchStatus=" + matchStatus + '}'; }
    public String getMatchId() { return matchId; }
    public String getTeamOneId() { return teamOneId; }
    public String getTeamTwoId() { return teamTwoId; }
    public List<String> getInningsList() { return Collections.unmodifiableList(inningsList); }
    public MatchStatus getMatchStatus() { return matchStatus; }
}
