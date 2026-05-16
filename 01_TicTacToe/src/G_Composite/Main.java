package G_Composite;

import G_Composite.model.Player;
import G_Composite.model.board.ClassicBoard;
import G_Composite.model.board.TicTacToeBoard;
import G_Composite.model.enums.Symbol;
import G_Composite.model.game.ClassicGame1v1;
import G_Composite.model.game.TicTacToeGame;
import G_Composite.model.game.winstrategy.ClassicWinStrategy;
import G_Composite.observer.ConsoleGameObserver;
import G_Composite.service.TicTacToeFacade;

public class Main {
    public static void main(String[] args) {
        try {
            Player playerX = new Player("Player-1", Symbol.X);
            Player playerO = new Player("Player-2", Symbol.O);

            TicTacToeBoard board = new ClassicBoard(3);
            TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
            TicTacToeFacade facade = new TicTacToeFacade(game);
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


