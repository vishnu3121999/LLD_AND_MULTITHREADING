package I_AdditionalFeatures.memento;

import I_AdditionalFeatures.model.GameState;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.model.Player;

import java.util.HashSet;
import java.util.Set;

public class GameMemento {
    private final Piece[][] boardSnapshot;
    private final GameState gameState;
    private final Player currentPlayer;
    private final Player winner;
    private final Move lastMove;
    private final Set<String> movedPositionKeys;

    public GameMemento(Piece[][] boardSnapshot, GameState gameState, Player currentPlayer, Player winner,
                       Move lastMove, Set<String> movedPositionKeys) {
        this.boardSnapshot = copy(boardSnapshot);
        this.gameState = gameState;
        this.currentPlayer = currentPlayer;
        this.winner = winner;
        this.lastMove = lastMove;
        this.movedPositionKeys = new HashSet<>(movedPositionKeys);
    }

    public Piece[][] getBoardSnapshot() {
        return copy(boardSnapshot);
    }

    public GameState getGameState() {
        return gameState;
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    public Player getWinner() {
        return winner;
    }

    public Move getLastMove() {
        return lastMove;
    }

    public Set<String> getMovedPositionKeys() {
        return new HashSet<>(movedPositionKeys);
    }

    private Piece[][] copy(Piece[][] source) {
        Piece[][] copy = new Piece[source.length][source.length];
        for (int row = 0; row < source.length; row++) {
            System.arraycopy(source[row], 0, copy[row], 0, source[row].length);
        }
        return copy;
    }
}





