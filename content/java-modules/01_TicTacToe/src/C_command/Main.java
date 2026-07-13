package C_command;

import C_command.datastore.IDatastore;
import C_command.datastore.InMemoryDatastore;
import C_command.model.Player;
import C_command.model.board.ClassicBoard;
import C_command.model.board.TicTacToeBoard;
import C_command.model.enums.Symbol;
import C_command.model.game.ClassicGame1v1;
import C_command.model.game.TicTacToeGame;
import C_command.model.game.winstrategy.ClassicWinStrategy;
import C_command.service.TicTacToeFacade;

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
