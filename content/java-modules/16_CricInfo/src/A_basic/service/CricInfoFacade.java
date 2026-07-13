package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.BallEvent;
import A_basic.model.Innings;
import A_basic.model.Match;
import A_basic.model.Player;
import A_basic.model.Team;

public class CricInfoFacade {
    private final DataStore dataStore;
    public CricInfoFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public Innings getScore(String inningsId) { return dataStore.getInnings(inningsId); }

    // System methods

    public void recordBall(String inningsId, String ballEventId, String batsmanId, String bowlerId, int runs, boolean wicket) {
        BallEvent ballEvent = new BallEvent(ballEventId, batsmanId, bowlerId, runs, wicket);
        dataStore.putBallEvent(ballEvent.getBallEventId(), ballEvent);
        dataStore.getInnings(inningsId).recordBall(runs, wicket);
    }

    // Admin methods

    public void addTeam(String teamId, String name) { Team team = new Team(teamId, name); dataStore.putTeam(team.getTeamId(), team); }
    public void addPlayer(String teamId, String playerId, String name) { Player player = new Player(playerId, name); dataStore.putPlayer(player.getPlayerId(), player); dataStore.getTeam(teamId).addPlayer(playerId); }
    public void addMatch(String matchId, String teamOneId, String teamTwoId) { Match match = new Match(matchId, teamOneId, teamTwoId); dataStore.putMatch(match.getMatchId(), match); }
    public void startMatch(String matchId) { dataStore.getMatch(matchId).start(); }
    public void startInnings(String matchId, String inningsId, String battingTeamId) { Innings innings = new Innings(inningsId, battingTeamId); dataStore.putInnings(innings.getInningsId(), innings); dataStore.getMatch(matchId).addInnings(inningsId); }

    // Util/helper methods
}
