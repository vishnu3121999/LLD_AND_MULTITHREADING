package basic_strategy;

import basic_strategy.model.Move;
import basic_strategy.model.Player;
import basic_strategy.model.board.ClassicBoard;
import basic_strategy.model.board.TicTacToeBoard;
import basic_strategy.model.board.winstrategy.ClassicWinStrategy;
import basic_strategy.model.enums.Symbol;
import basic_strategy.model.game.ClassicGame1v1;
import basic_strategy.model.game.TicTacToeGame;

public class Main {
    public static void main(String[] args) {
        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3, new ClassicWinStrategy());
        TicTacToeGame game = new ClassicGame1v1(
                board,
                playerX,
                playerO
        );

        game.start();
        game.getBoard().print();
        System.out.println();

        play(game, playerX, 0, 0);
        play(game, playerO, 1, 1);
        play(game, playerX, 0, 1);
        play(game, playerO, 2, 2);
        play(game, playerX, 0, 2);

        System.out.println("Final state: " + game.getGameState());
    }

    private static void play(TicTacToeGame game, Player player, int row, int col) {
        boolean success = game.applyMove(new Move(row, col, player.getSymbol()));
        System.out.println(player.getName() + " played (" + row + ", " + col + ") => " + success);
        game.getBoard().print();
        System.out.println();
    }
}
