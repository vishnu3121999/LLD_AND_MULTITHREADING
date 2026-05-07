package basic_strategy;

import basic_strategy.model.Move;
import basic_strategy.model.Player;
import basic_strategy.model.board.ClassicBoard;
import basic_strategy.model.board.TicTacToeBoard;
import basic_strategy.model.board.winstrategy.ClassicWinStrategy;
import basic_strategy.model.enums.GameState;
import basic_strategy.model.enums.Symbol;
import basic_strategy.model.game.ClassicGame1v1;
import basic_strategy.model.game.TicTacToeGame;

import java.util.Scanner;

public class Main_Interactive {

    public static void main(String[] args) {

        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3, new ClassicWinStrategy());
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO);

        Scanner scanner = new Scanner(System.in);

        game.start();
        game.getBoard().print();
        System.out.println();

        while (game.getGameState().equals(GameState.IN_PROGRESS)) {
            Player currentPlayer = game.getCurrentPlayer();
            System.out.println(currentPlayer.getName() + " (" + currentPlayer.getSymbol() + ") turn");

            System.out.print("Enter row: ");
            int row = scanner.nextInt();

            System.out.print("Enter col: ");
            int col = scanner.nextInt();

            boolean success = game.applyMove(
                    new Move(row, col, currentPlayer.getSymbol())
            );

            if (!success) {
                System.out.println("Invalid move. Try again.");
                continue;
            }

            game.getBoard().print();
            System.out.println();
        }

        System.out.println("Final state: " + game.getGameState() + ", Winner: " + game.getWinner().getName());

        scanner.close();
    }
}
