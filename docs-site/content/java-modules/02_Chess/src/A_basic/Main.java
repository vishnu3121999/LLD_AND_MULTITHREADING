package src;

import database.Datastore;
import model.Move;
import model.Player;
import model.board.Board;
import model.enums.BoardType;
import model.game.Game;
import model.game.factory.GameFactory;
import service.Facade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        Datastore datastore = new Datastore();
        Facade facade = new Facade(datastore);
        GameFactory gameFactory = new GameFactory();

        Player player1 = new Player("1","virat");
        Player player2 = new Player("2","anushka");
        facade.registerPlayer(player1);
        facade.registerPlayer(player2);

        Game game = gameFactory.getClassicGame(getRandomID(), BoardType.CLASSIC,player1,player2);
        Board board = facade.startGame(game);
        System.out.println("Initial board:");
        board.print();

        playMove(facade, game.getId(), player1.getId(), new Move(6, 4, 4, 4));
        playMove(facade, game.getId(), player2.getId(), new Move(1, 4, 3, 4));
        playMove(facade, game.getId(), player1.getId(), new Move(7, 6, 5, 5));

        System.out.println("Current status: " + facade.getGame(game.getId()).getGameStatus());
    }

    static String getRandomID(){
        return UUID.randomUUID().toString();
    }

    private static void playMove(Facade facade, String gameId, String playerId, Move move) {
        boolean success = facade.makeMove(gameId, playerId, move);
        System.out.println("Move " + formatMove(move) + " by player " + playerId + " -> " + (success ? "SUCCESS" : "FAILED"));
        facade.displayBoard(gameId);
    }

    private static String formatMove(Move move) {
        return "(" + move.getSrcRow() + "," + move.getSrcCol() + ") to (" + move.getDestRow() + "," + move.getDestCol() + ")";
    }
}
