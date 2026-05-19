package H_persistance;

import H_persistance.datastore.FileDataStore;
import H_persistance.datastore.IDatastore;
import H_persistance.model.Player;
import H_persistance.model.board.ClassicBoard;
import H_persistance.model.board.TicTacToeBoard;
import H_persistance.model.enums.GameState;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.ClassicGame1v1;
import H_persistance.model.game.TicTacToeGame;
import H_persistance.model.game.winstrategy.ClassicWinStrategy;
import H_persistance.observer.ConsoleGameObserver;
import H_persistance.service.TicTacToeFacade;

import java.nio.file.Paths;
import java.util.Scanner;

public class Main_Interactive {

    public static void main(String[] args) {
        try {
            Player playerX = new Player("Player-1", Symbol.X);
            Player playerO = new Player("Player-2", Symbol.O);

            TicTacToeBoard board = new ClassicBoard(3);
            TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
            IDatastore datastore = new FileDataStore(game, Paths.get("tic-tac-toe-game-state.txt"));
            TicTacToeFacade facade = new TicTacToeFacade(datastore);
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
