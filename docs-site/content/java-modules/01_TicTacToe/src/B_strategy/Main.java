package B_strategy;

import B_strategy.datastore.IDatastore;
import B_strategy.datastore.InMemoryDatastore;
import B_strategy.model.Player;
import B_strategy.model.board.ClassicBoard;
import B_strategy.model.board.TicTacToeBoard;
import B_strategy.model.enums.Symbol;
import B_strategy.model.game.ClassicGame1v1;
import B_strategy.model.game.TicTacToeGame;
import B_strategy.model.game.winstrategy.ClassicWinStrategy;
import B_strategy.service.TicTacToeFacade;

public class Main {
    public static void main(String[] args) {
        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3);
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
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
