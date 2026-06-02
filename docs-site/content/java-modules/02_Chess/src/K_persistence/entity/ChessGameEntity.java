package K_persistence.entity;

import K_persistence.board.ClassicBoard;
import K_persistence.memento.GameMemento;
import K_persistence.model.Color;
import K_persistence.model.GameState;
import K_persistence.model.Move;
import K_persistence.model.Player;
import K_persistence.model.Position;
import K_persistence.service.ChessGame;
import K_persistence.service.ClassicGame;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "chess_games")
public class ChessGameEntity {
    @Id
    private String gameId;

    @Column(nullable = false)
    private String gameState;

    @Column(nullable = false)
    private String whitePlayerId;

    @Column(nullable = false)
    private String whitePlayerName;

    @Column(nullable = false)
    private String blackPlayerId;

    @Column(nullable = false)
    private String blackPlayerName;

    private String currentPlayerColor;
    private String winnerColor;
    private String lastMovePlayerColor;
    private Integer lastFromRow;
    private Integer lastFromCol;
    private Integer lastToRow;
    private Integer lastToCol;
    private String movedPositionKeys;
    private int boardSize;

    @Lob
    @Column(nullable = false)
    private String boardSnapshot;

    protected ChessGameEntity() {
    }

    public static ChessGameEntity fromDomain(String gameId, ChessGame game) {
        ChessGameEntity entity = new ChessGameEntity();
        Player whitePlayer = game.getPlayer(Color.WHITE);
        Player blackPlayer = game.getPlayer(Color.BLACK);
        Move lastMove = game.getLastMove();

        entity.gameId = gameId;
        entity.gameState = game.getGameState().name();
        entity.whitePlayerId = whitePlayer.getPlayerId();
        entity.whitePlayerName = whitePlayer.getName();
        entity.blackPlayerId = blackPlayer.getPlayerId();
        entity.blackPlayerName = blackPlayer.getName();
        entity.currentPlayerColor = colorName(game.getPlayerColor(game.getCurrentPlayer()));
        entity.winnerColor = colorName(game.getPlayerColor(game.getWinner()));
        entity.movedPositionKeys = SnapshotCodec.encodeKeys(game.createMemento().getMovedPositionKeys());
        entity.boardSize = game.getBoard().getSize();
        entity.boardSnapshot = SnapshotCodec.encodeBoard(game.getBoard().createSnapshot());

        if (lastMove != null) {
            entity.lastMovePlayerColor = colorName(game.getPlayerColor(lastMove.getPlayer()));
            entity.lastFromRow = lastMove.getFrom().getRow();
            entity.lastFromCol = lastMove.getFrom().getCol();
            entity.lastToRow = lastMove.getTo().getRow();
            entity.lastToCol = lastMove.getTo().getCol();
        }
        return entity;
    }

    public ChessGame toDomain() {
        Player whitePlayer = new Player(whitePlayerId, whitePlayerName);
        Player blackPlayer = new Player(blackPlayerId, blackPlayerName);
        ChessGame game = new ClassicGame(gameId, new ClassicBoard(), whitePlayer, blackPlayer);
        game.restore(new GameMemento(
                SnapshotCodec.decodeBoard(boardSnapshot, boardSize),
                GameState.valueOf(gameState),
                playerForColor(game, currentPlayerColor),
                playerForColor(game, winnerColor),
                buildLastMove(game),
                SnapshotCodec.decodeKeys(movedPositionKeys)
        ));
        return game;
    }

    private Move buildLastMove(ChessGame game) {
        if (lastMovePlayerColor == null || lastFromRow == null || lastFromCol == null || lastToRow == null || lastToCol == null) {
            return null;
        }
        return new Move(
                playerForColor(game, lastMovePlayerColor),
                Position.of(lastFromRow, lastFromCol),
                Position.of(lastToRow, lastToCol)
        );
    }

    private static Player playerForColor(ChessGame game, String color) {
        return color == null ? null : game.getPlayer(Color.valueOf(color));
    }

    private static String colorName(Color color) {
        return color == null ? null : color.name();
    }
}
