package A_basic.datastore;

        import A_basic.model.Team;
import A_basic.model.Player;
import A_basic.model.Match;
import A_basic.model.Innings;
import A_basic.model.BallEvent;

        public interface DataStore {

            Team getTeam(String key);

            void putTeam(String key, Team value);

            boolean containsTeam(String key);

            Team removeTeam(String key);
            Player getPlayer(String key);

            void putPlayer(String key, Player value);

            boolean containsPlayer(String key);

            Player removePlayer(String key);
            Match getMatch(String key);

            void putMatch(String key, Match value);

            boolean containsMatch(String key);

            Match removeMatch(String key);
            Innings getInnings(String key);

            void putInnings(String key, Innings value);

            boolean containsInnings(String key);

            Innings removeInnings(String key);
            BallEvent getBallEvent(String key);

            void putBallEvent(String key, BallEvent value);

            boolean containsBallEvent(String key);

            BallEvent removeBallEvent(String key);
        }
