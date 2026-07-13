package G_exceptionhandling;

import G_exceptionhandling.datastore.IDatastore;
import G_exceptionhandling.datastore.InmemoryDatastore;
import G_exceptionhandling.exception.IlligalMoveException;
import G_exceptionhandling.model.Player;
import G_exceptionhandling.model.Position;
import G_exceptionhandling.observer.BoardPrintObserver;
import G_exceptionhandling.service.ChessGameServiceFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        IDatastore datastore = new InmemoryDatastore();
        ChessGameServiceFacade service = new ChessGameServiceFacade(datastore);
        service.addObserver(new BoardPrintObserver());
        Player whitePlayer = new Player("player-1", "Player-1");
        Player blackPlayer = new Player("player-2", "Player-2");
        String gameId = UUID.randomUUID().toString();
        service.createGame(gameId, whitePlayer, blackPlayer);

        service.startGame(gameId);

        play(service, gameId, blackPlayer, Position.of(1, 0), Position.of(2, 0)); // rejected: black tries first
        play(service, gameId, whitePlayer, Position.of(6, 2), Position.of(4, 2)); // white pawn c2 -> c4
        play(service, gameId, blackPlayer, Position.of(1, 2), Position.of(3, 2)); // black pawn c7 -> c5
        play(service, gameId, whitePlayer, Position.of(7, 3), Position.of(5, 1)); // white queen d1 -> b3
        play(service, gameId, blackPlayer, Position.of(0, 6), Position.of(2, 5)); // black knight g8 -> f6

        boolean undone = service.undoLastMove(gameId);
        System.out.println("Undo last move = " + undone);
    }

    private static void play(ChessGameServiceFacade service, String gameId, Player player, Position from, Position to) {
        try {
            boolean success = service.move(gameId, player, from, to);
            System.out.println(player.getName() + " moved " + from + " -> " + to + " = " + success);
        } catch (IlligalMoveException exception) {
            System.out.println(player.getName() + " move rejected: " + exception.getMessage());
        }
    }
}



