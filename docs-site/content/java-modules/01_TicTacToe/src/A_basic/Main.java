package A_basic;

import A_basic.datastore.IDatastore;
import A_basic.datastore.InMemoryDatastore;
import A_basic.model.Player;
import A_basic.model.board.ClassicBoard;
import A_basic.model.board.TicTacToeBoard;
import A_basic.model.enums.Symbol;
import A_basic.model.game.ClassicGame1v1;
import A_basic.model.game.TicTacToeGame;
import A_basic.service.TicTacToeFacade;

public class Main {
    public static void main(String[] args) {
        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3);
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO);
        IDatastore datastore = new InMemoryDatastore(game);
        TicTacToeFacade facade = new TicTacToeFacade(datastore);

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
