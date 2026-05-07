package basic_strategy_command;

import basic_strategy_command.model.Move;
import basic_strategy_command.model.Player;
import basic_strategy_command.model.board.ClassicBoard;
import basic_strategy_command.model.board.TicTacToeBoard;
import basic_strategy_command.model.board.winstrategy.ClassicWinStrategy;
import basic_strategy_command.model.enums.Symbol;
import basic_strategy_command.model.game.ClassicGame1v1;
import basic_strategy_command.model.game.TicTacToeGame;
import basic_strategy_command.service.TicTacToeFacade;

public class Main {
    public static void main(String[] args) {
        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3, new ClassicWinStrategy());
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO);
        TicTacToeFacade facade = new TicTacToeFacade(game);

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
