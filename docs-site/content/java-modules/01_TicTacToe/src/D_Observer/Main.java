package D_Observer;

import D_Observer.datastore.IDatastore;
import D_Observer.datastore.InMemoryDatastore;
import D_Observer.model.Player;
import D_Observer.model.board.ClassicBoard;
import D_Observer.model.board.TicTacToeBoard;
import D_Observer.model.enums.Symbol;
import D_Observer.model.game.ClassicGame1v1;
import D_Observer.model.game.TicTacToeGame;
import D_Observer.model.game.winstrategy.ClassicWinStrategy;
import D_Observer.service.TicTacToeFacade;
import D_Observer.observer.ConsoleGameObserver;

public class Main {
    public static void main(String[] args) {
        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3);
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
        IDatastore datastore = new InMemoryDatastore(game);
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
    }

    private static void play(TicTacToeFacade facade, TicTacToeGame game, Player player, int row, int col) {
        boolean success = facade.makeMove(player, row, col);
        System.out.println(player.getName() + " played (" + row + ", " + col + ") => " + success);
        game.getBoard().print();
        System.out.println();
    }
}

