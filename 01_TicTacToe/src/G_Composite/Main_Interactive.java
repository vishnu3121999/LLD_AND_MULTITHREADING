package G_Composite;

import G_Composite.model.Player;
import G_Composite.model.board.ClassicBoard;
import G_Composite.model.board.TicTacToeBoard;
import G_Composite.model.enums.GameState;
import G_Composite.model.enums.Symbol;
import G_Composite.model.game.ClassicGame1v1;
import G_Composite.model.game.TicTacToeGame;
import G_Composite.model.game.winstrategy.ClassicWinStrategy;
import G_Composite.observer.ConsoleGameObserver;
import G_Composite.service.TicTacToeFacade;

import java.util.Scanner;

public class Main_Interactive {

    public static void main(String[] args) {
        try {
            Player playerX = new Player("Player-1", Symbol.X);
            Player playerO = new Player("Player-2", Symbol.O);

            TicTacToeBoard board = new ClassicBoard(3);
            TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
            TicTacToeFacade facade = new TicTacToeFacade(game);
            facade.addObserver(new ConsoleGameObserver("observer-1"));

            Scanner scanner = new Scanner(System.in);

            facade.startGame();
            game.getBoard().print();
            System.out.println();

            while (game.getGameState().equals(GameState.IN_PROGRESS)) {
                Player currentPlayer = game.getCurrentPlayer();
                System.out.println(currentPlayer.getName() + " (" + currentPlayer.getSymbol() + ") turn");

                System.out.print("Enter row: ");
                int row = scanner.nextInt();

                System.out.print("Enter col: ");
                int col = scanner.nextInt();

                try {
                    boolean success = facade.makeMove(currentPlayer, row, col);
                    if (!success) {
                        System.out.println("Invalid move. Try again.");
                        continue;
                    }
                } catch (RuntimeException ex) {
                    System.out.println(ex.getMessage());
                    continue;
                }

                game.getBoard().print();
                System.out.println();
            }

            System.out.println("Final state: " + game.getGameState() + ", Winner: " + game.getWinner().getName());

            scanner.close();
        } catch (RuntimeException ex) {
            System.out.println(ex.getMessage());
        }
    }
}


