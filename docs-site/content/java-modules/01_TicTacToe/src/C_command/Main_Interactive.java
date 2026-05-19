package C_command;

import C_command.datastore.IDatastore;
import C_command.datastore.InMemoryDatastore;
import C_command.model.Player;
import C_command.model.board.ClassicBoard;
import C_command.model.board.TicTacToeBoard;
import C_command.model.enums.GameState;
import C_command.model.enums.Symbol;
import C_command.model.game.ClassicGame1v1;
import C_command.model.game.TicTacToeGame;
import C_command.model.game.winstrategy.ClassicWinStrategy;
import C_command.service.TicTacToeFacade;

import java.util.Scanner;

public class Main_Interactive {

    public static void main(String[] args) {

        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);

        TicTacToeBoard board = new ClassicBoard(3);
        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
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
