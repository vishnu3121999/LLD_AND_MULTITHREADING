package H_persistance;

import H_persistance.datastore.FileDataStore;
import H_persistance.datastore.IDatastore;
import H_persistance.model.Player;
import H_persistance.model.board.ClassicBoard;
import H_persistance.model.board.TicTacToeBoard;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.ClassicGame1v1;
import H_persistance.model.game.TicTacToeGame;
import H_persistance.model.game.winstrategy.ClassicWinStrategy;
import H_persistance.observer.ConsoleGameObserver;
import H_persistance.service.TicTacToeFacade;

import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) {
        try {
            Player playerX = new Player("Player-1", Symbol.X);
            Player playerO = new Player("Player-2", Symbol.O);

            TicTacToeBoard board = new ClassicBoard(3);
            TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
            IDatastore datastore = new FileDataStore(game, Paths.get("tic-tac-toe-game-state.txt"));
            TicTacToeFacade facade = new TicTacToeFacade(datastore);
            facade.addObserver(new ConsoleGameObserver("observer-1"));

            facade.startGame();
            game.getBoard().print();
            System.out.println();

            play(facade, game, playerX, 0, 0);
            play(facade, game, playerO, 1, 1);
            play(facade, game, playerX, 0, 1);
            play(facade, game, playerO, 2, 2);
            play(facade, game, playerX, 0, 2);

            System.out.println("Final state: " + game.getGameState());
        } catch (RuntimeException ex) {
            System.out.println(ex.getMessage());
        }
    }

    private static void play(TicTacToeFacade facade, TicTacToeGame game, Player player, int row, int col) {
        boolean success = facade.makeMove(player, row, col);
        System.out.println(player.getName() + " played (" + row + ", " + col + ") => " + success);
        game.getBoard().print();
        System.out.println();
    }
}


