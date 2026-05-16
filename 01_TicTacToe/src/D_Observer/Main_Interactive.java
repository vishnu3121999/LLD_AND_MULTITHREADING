package D_Observer;

import D_Observer.model.Player;
import D_Observer.model.board.ClassicBoard;
import D_Observer.model.board.TicTacToeBoard;
import D_Observer.model.enums.GameState;
import D_Observer.model.enums.Symbol;
import D_Observer.model.game.ClassicGame1v1;
import D_Observer.model.game.TicTacToeGame;
import D_Observer.model.game.winstrategy.ClassicWinStrategy;
import D_Observer.service.TicTacToeFacade;
import D_Observer.observer.ConsoleGameObserver;

import java.util.Scanner;

public class Main_Interactive {

    public static void main(String[] args) {

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

            boolean success = facade.makeMove(currentPlayer, row, col);

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

