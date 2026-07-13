package A_basicV1;

import A_basicV1.datastore.IDatastore;
import A_basicV1.datastore.InmemoryDatastore;
import A_basicV1.model.Player;
import A_basicV1.model.Position;
import A_basicV1.service.ChessGameServiceFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        IDatastore datastore = new InmemoryDatastore();
        ChessGameServiceFacade service = new ChessGameServiceFacade(datastore);
        Player whitePlayer = new Player("player-1", "Player-1");
        Player blackPlayer = new Player("player-2", "Player-2");
        String gameId = UUID.randomUUID().toString();
        service.createGame(gameId, whitePlayer, blackPlayer);

        service.startGame(gameId);

        play(service, gameId, whitePlayer, Position.of(6, 3), Position.of(4, 3)); // white pawn d2 -> d4
        play(service, gameId, blackPlayer, Position.of(1, 3), Position.of(3, 3)); // black pawn d7 -> d5
        play(service, gameId, whitePlayer, Position.of(7, 2), Position.of(4, 5)); // white bishop c1 -> f4
        play(service, gameId, blackPlayer, Position.of(0, 6), Position.of(2, 5)); // black knight g8 -> f6
    }

    private static void play(ChessGameServiceFacade service, String gameId, Player player, Position from, Position to) {
        boolean success = service.move(gameId, player, from, to);
        System.out.println(player.getName() + " moved " + from + " -> " + to + " = " + success);
    }
}
