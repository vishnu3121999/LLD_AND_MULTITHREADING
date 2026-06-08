package A_basic.datastore;

        import A_basic.model.Team;
import A_basic.model.Player;
import A_basic.model.Match;
import A_basic.model.Innings;
import A_basic.model.BallEvent;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Team> teamMap;
    private final Map<String, Player> playerMap;
    private final Map<String, Match> matchMap;
    private final Map<String, Innings> inningsMap;
    private final Map<String, BallEvent> ballEventMap;

            public InMemoryDataStore() {
                this.teamMap = new HashMap<>();
        this.playerMap = new HashMap<>();
        this.matchMap = new HashMap<>();
        this.inningsMap = new HashMap<>();
        this.ballEventMap = new HashMap<>();
            }


            @Override
            public Team getTeam(String key) {
                return teamMap.get(key);
            }

            @Override
            public void putTeam(String key, Team value) {
                teamMap.put(key, value);
            }

            @Override
            public boolean containsTeam(String key) {
                return teamMap.containsKey(key);
            }

            @Override
            public Team removeTeam(String key) {
                return teamMap.remove(key);
            }
            @Override
            public Player getPlayer(String key) {
                return playerMap.get(key);
            }

            @Override
            public void putPlayer(String key, Player value) {
                playerMap.put(key, value);
            }

            @Override
            public boolean containsPlayer(String key) {
                return playerMap.containsKey(key);
            }

            @Override
            public Player removePlayer(String key) {
                return playerMap.remove(key);
            }
            @Override
            public Match getMatch(String key) {
                return matchMap.get(key);
            }

            @Override
            public void putMatch(String key, Match value) {
                matchMap.put(key, value);
            }

            @Override
            public boolean containsMatch(String key) {
                return matchMap.containsKey(key);
            }

            @Override
            public Match removeMatch(String key) {
                return matchMap.remove(key);
            }
            @Override
            public Innings getInnings(String key) {
                return inningsMap.get(key);
            }

            @Override
            public void putInnings(String key, Innings value) {
                inningsMap.put(key, value);
            }

            @Override
            public boolean containsInnings(String key) {
                return inningsMap.containsKey(key);
            }

            @Override
            public Innings removeInnings(String key) {
                return inningsMap.remove(key);
            }
            @Override
            public BallEvent getBallEvent(String key) {
                return ballEventMap.get(key);
            }

            @Override
            public void putBallEvent(String key, BallEvent value) {
                ballEventMap.put(key, value);
            }

            @Override
            public boolean containsBallEvent(String key) {
                return ballEventMap.containsKey(key);
            }

            @Override
            public BallEvent removeBallEvent(String key) {
                return ballEventMap.remove(key);
            }
        }
