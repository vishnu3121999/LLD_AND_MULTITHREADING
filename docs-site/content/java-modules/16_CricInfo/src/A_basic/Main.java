package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.CricInfoFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== CricInfo Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        CricInfoFacade facade = new CricInfoFacade(dataStore);
        String indiaId = id("team");
        String ausId = id("team");
        String batsmanId = id("player");
        String bowlerId = id("player");
        String matchId = id("match");
        String inningsId = id("innings");
        facade.addTeam(indiaId, "India");
        facade.addTeam(ausId, "Australia");
        facade.addPlayer(indiaId, batsmanId, "Batsman");
        facade.addPlayer(ausId, bowlerId, "Bowler");
        facade.addMatch(matchId, indiaId, ausId);
        facade.startMatch(matchId);
        facade.startInnings(matchId, inningsId, indiaId);
        facade.recordBall(inningsId, id("ball"), batsmanId, bowlerId, 4, false);
        facade.recordBall(inningsId, id("ball"), batsmanId, bowlerId, 0, true);
        System.out.println(dataStore.getMatch(matchId));
        System.out.println(facade.getScore(inningsId));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
