package A_basic;

import A_basic.datastore.IDatastore;
import A_basic.datastore.InMemoryDatastore;
import A_basic.model.Player;
import A_basic.model.board.ClassicBoard;
import A_basic.model.board.TicTacToeBoard;
import A_basic.model.enums.GameState;
import A_basic.model.enums.Symbol;
import A_basic.model.game.ClassicGame1v1;
import A_basic.model.game.TicTacToeGame;
import A_basic.service.TicTacToeFacade;

import java.util.Scanner;

public class Main_Interactive {

    public static void main(String[] args) {

        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3);
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO);
        IDatastore datastore = new InMemoryDatastore(game);
        TicTacToeFacade facade = new TicTacToeFacade(datastore);

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
