package C_Factory;

import C_Factory.datastore.IDatastore;
import C_Factory.datastore.InmemoryDatastore;
import C_Factory.model.Player;
import C_Factory.model.Position;
import C_Factory.service.ChessGameServiceFacade;

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

        play(service, gameId, whitePlayer, Position.of(6, 2), Position.of(4, 2)); // white pawn c2 -> c4
        play(service, gameId, blackPlayer, Position.of(1, 2), Position.of(3, 2)); // black pawn c7 -> c5
        play(service, gameId, whitePlayer, Position.of(7, 3), Position.of(5, 1)); // white queen d1 -> b3
        play(service, gameId, blackPlayer, Position.of(0, 6), Position.of(2, 5)); // black knight g8 -> f6
    }

    private static void play(ChessGameServiceFacade service, String gameId, Player player, Position from, Position to) {
        boolean success = service.move(gameId, player, from, to);
        System.out.println(player.getName() + " moved " + from + " -> " + to + " = " + success);
    }
}
