package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Team {
    private final String teamId;
    private final String name;
    private final List<String> playerList;
    public Team(String teamId, String name) { this.teamId = teamId; this.name = name; this.playerList = new ArrayList<>(); }
    public void addPlayer(String playerId) { playerList.add(playerId); }
    @Override public String toString() { return "Team{" + "teamId='" + teamId + "'" + ", name='" + name + "'" + ", playerList=" + playerList + '}'; }
    public String getTeamId() { return teamId; }
    public String getName() { return name; }
    public List<String> getPlayerList() { return Collections.unmodifiableList(playerList); }
}
