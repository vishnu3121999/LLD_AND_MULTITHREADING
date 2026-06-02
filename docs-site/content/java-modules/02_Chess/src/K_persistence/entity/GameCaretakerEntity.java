package K_persistence.entity;

import K_persistence.memento.GameCaretaker;
import K_persistence.memento.GameMemento;
import K_persistence.model.Color;
import K_persistence.model.GameState;
import K_persistence.model.Move;
import K_persistence.model.Player;
import K_persistence.model.Position;
import K_persistence.service.ChessGame;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chess_game_caretakers")
public class GameCaretakerEntity {
    private static final String FIELD_SEPARATOR = "\\|";

    @Id
    private String gameId;

    @Lob
    @Column(nullable = false)
    private String mementosSnapshot;

    protected GameCaretakerEntity() {
    }

    public static GameCaretakerEntity fromDomain(String gameId, GameCaretaker gameCaretaker, ChessGame game) {
        GameCaretakerEntity entity = new GameCaretakerEntity();
        entity.gameId = gameId;
        entity.mementosSnapshot = encodeMementos(gameCaretaker.getHistory(), game);
        return entity;
    }

    public GameCaretaker toDomain(ChessGame game) {
        return new GameCaretaker(gameId, decodeMementos(mementosSnapshot, game));
    }

    private static String encodeMementos(List<GameMemento> history, ChessGame game) {
        List<String> lines = new ArrayList<>();
        for (GameMemento memento : history) {
            Move lastMove = memento.getLastMove();
            lines.add(String.join("|",
                    memento.getGameState().name(),
                    colorName(game.getPlayerColor(memento.getCurrentPlayer())),
                    colorName(game.getPlayerColor(memento.getWinner())),
                    lastMove == null ? "" : colorName(game.getPlayerColor(lastMove.getPlayer())),
                    lastMove == null ? "" : String.valueOf(lastMove.getFrom().getRow()),
                    lastMove == null ? "" : String.valueOf(lastMove.getFrom().getCol()),
                    lastMove == null ? "" : String.valueOf(lastMove.getTo().getRow()),
                    lastMove == null ? "" : String.valueOf(lastMove.getTo().getCol()),
                    SnapshotCodec.encodeKeys(memento.getMovedPositionKeys()),
                    SnapshotCodec.encodeBoard(memento.getBoardSnapshot())
            ));
        }
        return String.join(System.lineSeparator(), lines);
    }

    private static List<GameMemento> decodeMementos(String value, ChessGame game) {
        List<GameMemento> history = new ArrayList<>();
        if (value == null || value.trim().isEmpty()) {
            return history;
        }

        for (String line : value.split("\\R")) {
            String[] fields = line.split(FIELD_SEPARATOR, -1);
            history.add(new GameMemento(
                    SnapshotCodec.decodeBoard(fields[9], game.getBoard().getSize()),
                    GameState.valueOf(fields[0]),
                    playerForColor(game, fields[1]),
                    playerForColor(game, fields[2]),
                    decodeMove(fields, game),
                    SnapshotCodec.decodeKeys(fields[8])
            ));
        }
        return history;
    }

    private static Move decodeMove(String[] fields, ChessGame game) {
        if (fields[3].isEmpty()) {
            return null;
        }
        Player player = playerForColor(game, fields[3]);
        return new Move(
                player,
                Position.of(Integer.parseInt(fields[4]), Integer.parseInt(fields[5])),
                Position.of(Integer.parseInt(fields[6]), Integer.parseInt(fields[7]))
        );
    }

    private static Player playerForColor(ChessGame game, String color) {
        return color == null || color.isEmpty() ? null : game.getPlayer(Color.valueOf(color));
    }

    private static String colorName(Color color) {
        return color == null ? "" : color.name();
    }
}
