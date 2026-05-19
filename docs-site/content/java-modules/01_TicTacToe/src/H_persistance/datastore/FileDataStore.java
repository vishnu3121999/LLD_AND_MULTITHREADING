package H_persistance.datastore;

import H_persistance.command.CommandInvoker;
import H_persistance.model.Move;
import H_persistance.model.Player;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.TicTacToeGame;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class FileDataStore implements IDatastore {
    private final TicTacToeGame game;
    private final CommandInvoker commandInvoker;
    private final Path filePath;

    public FileDataStore(TicTacToeGame game, Path filePath) {
        this.game = game;
        this.commandInvoker = new CommandInvoker();
        this.filePath = filePath;
    }

    @Override
    public TicTacToeGame getGame() {
        return game;
    }

    @Override
    public CommandInvoker getCommandInvoker() {
        return commandInvoker;
    }

    @Override
    public void save() {
        try {
            Path parent = filePath.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            Files.write(filePath, buildSnapshot().getBytes(StandardCharsets.UTF_8));
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to save game state", ex);
        }
    }

    private String buildSnapshot() {
        StringBuilder snapshot = new StringBuilder();
        snapshot.append("gameState=").append(game.getGameState()).append(System.lineSeparator());
        snapshot.append("currentPlayer=").append(formatPlayer(game.getCurrentPlayer())).append(System.lineSeparator());
        snapshot.append("winner=").append(formatPlayer(game.getWinner())).append(System.lineSeparator());
        snapshot.append("board=").append(System.lineSeparator());
        appendBoard(snapshot);
        snapshot.append("commandHistory=").append(System.lineSeparator());
        appendCommandHistory(snapshot);
        return snapshot.toString();
    }

    private void appendBoard(StringBuilder snapshot) {
        Symbol[][] grid = game.getBoard().getGrid();
        for (Symbol[] row : grid) {
            for (int col = 0; col < row.length; col++) {
                if (col > 0) {
                    snapshot.append(",");
                }
                snapshot.append(row[col]);
            }
            snapshot.append(System.lineSeparator());
        }
    }

    private void appendCommandHistory(StringBuilder snapshot) {
        List<Move> moveHistory = commandInvoker.getMoveHistory();
        for (int index = 0; index < moveHistory.size(); index++) {
            Move move = moveHistory.get(index);
            snapshot
                    .append(index + 1)
                    .append(". MOVE ")
                    .append(move.getSymbol())
                    .append(" ")
                    .append(move.getRow())
                    .append(",")
                    .append(move.getCol())
                    .append(System.lineSeparator());
        }
    }

    private String formatPlayer(Player player) {
        if (player == null) {
            return "null";
        }
        return player.getName() + "(" + player.getSymbol() + ")";
    }
}
