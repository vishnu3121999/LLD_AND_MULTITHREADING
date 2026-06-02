package H_persistance.entity;

import H_persistance.command.CommandInvoker;
import H_persistance.model.Move;
import H_persistance.model.Player;
import H_persistance.model.board.ClassicBoard;
import H_persistance.model.enums.GameState;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.ClassicGame1v1;
import H_persistance.model.game.TicTacToeGame;
import H_persistance.model.game.winstrategy.ClassicWinStrategy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tic_tac_toe_game_snapshots")
public class TicTacToeGameSnapshot {
    @Id
    private String gameId;

    @Column(nullable = false)
    private String gameState;

    @Column(nullable = false)
    private String playerXName;

    @Column(nullable = false)
    private String playerOName;

    private String currentPlayerSymbol;
    private String winnerSymbol;
    private int boardSize;

    @Lob
    @Column(nullable = false)
    private String boardSnapshot;

    @Lob
    @Column(nullable = false)
    private String moveHistorySnapshot;

    protected TicTacToeGameSnapshot() {
    }

    public static TicTacToeGameSnapshot fromDomain(String gameId, TicTacToeGame game, CommandInvoker commandInvoker) {
        if (!(game instanceof ClassicGame1v1)) {
            throw new IllegalArgumentException("Only ClassicGame1v1 is supported by this snapshot example.");
        }

        ClassicGame1v1 classicGame = (ClassicGame1v1) game;
        TicTacToeGameSnapshot snapshot = new TicTacToeGameSnapshot();
        snapshot.gameId = gameId;
        snapshot.gameState = game.getGameState().name();
        snapshot.playerXName = classicGame.getPlayerX().getName();
        snapshot.playerOName = classicGame.getPlayerO().getName();
        snapshot.currentPlayerSymbol = symbolName(game.getCurrentPlayer());
        snapshot.winnerSymbol = symbolName(game.getWinner());
        snapshot.boardSize = game.getBoard().getGrid().length;
        snapshot.boardSnapshot = encodeBoard(game.getBoard().getGrid());
        snapshot.moveHistorySnapshot = encodeMoves(commandInvoker.getMoveHistory());
        return snapshot;
    }

    public TicTacToeGame toGame() {
        Player playerX = new Player(playerXName, Symbol.X);
        Player playerO = new Player(playerOName, Symbol.O);
        ClassicBoard board = new ClassicBoard(boardSize);
        restoreBoard(board.getGrid(), boardSnapshot);

        TicTacToeGame game = new ClassicGame1v1(board, playerX, playerO, new ClassicWinStrategy());
        game.setGameState(GameState.valueOf(gameState));
        game.setCurrentPlayer(playerForSymbol(currentPlayerSymbol, playerX, playerO));
        game.setWinner(playerForSymbol(winnerSymbol, playerX, playerO));
        return game;
    }

    public List<Move> toMoveHistory() {
        List<Move> moves = new ArrayList<>();
        if (moveHistorySnapshot == null || moveHistorySnapshot.trim().isEmpty()) {
            return moves;
        }

        for (String encodedMove : moveHistorySnapshot.split(";")) {
            String[] fields = encodedMove.split(":");
            moves.add(new Move(
                    Integer.parseInt(fields[0]),
                    Integer.parseInt(fields[1]),
                    Symbol.valueOf(fields[2])
            ));
        }
        return moves;
    }

    private static String encodeBoard(Symbol[][] grid) {
        List<String> rows = new ArrayList<>();
        for (Symbol[] row : grid) {
            List<String> cells = new ArrayList<>();
            for (Symbol symbol : row) {
                cells.add(symbol.name());
            }
            rows.add(String.join(",", cells));
        }
        return String.join(";", rows);
    }

    private static void restoreBoard(Symbol[][] grid, String snapshot) {
        String[] rows = snapshot.split(";");
        for (int row = 0; row < rows.length; row++) {
            String[] cells = rows[row].split(",");
            for (int col = 0; col < cells.length; col++) {
                grid[row][col] = Symbol.valueOf(cells[col]);
            }
        }
    }

    private static String encodeMoves(List<Move> moves) {
        List<String> encodedMoves = new ArrayList<>();
        for (Move move : moves) {
            encodedMoves.add(move.getRow() + ":" + move.getCol() + ":" + move.getSymbol().name());
        }
        return String.join(";", encodedMoves);
    }

    private static Player playerForSymbol(String symbolName, Player playerX, Player playerO) {
        if (symbolName == null || symbolName.isEmpty()) {
            return null;
        }
        return Symbol.X.name().equals(symbolName) ? playerX : playerO;
    }

    private static String symbolName(Player player) {
        return player == null ? null : player.getSymbol().name();
    }
}
