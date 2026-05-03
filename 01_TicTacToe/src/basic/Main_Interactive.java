package basic;
import basic.model.Move;
import basic.model.Player;
import basic.model.board.ClassicBoard;
import basic.model.board.TicTacToeBoard;
import basic.model.enums.GameState;
import basic.model.enums.Symbol;
import basic.model.game.ClassicGame1v1;
import basic.model.game.TicTacToeGame;

import java.util.Scanner;
public class Main_Interactive {

    public static void main(String[] args) {

        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3);
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO);

        Scanner scanner = new Scanner(System.in);

        game.start();
        game.getBoard().print();
        System.out.println();

        Player currentPlayer = playerX;

        while (game.getGameState().equals(GameState.IN_PROGRESS)) {
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
                continue; // same player retries
            }

            game.getBoard().print();
            System.out.println();

            // switch player
            currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
        }

        System.out.println("Final state: " + game.getGameState() + "Winner: " + game.getWinner());

        scanner.close();
    }
}