package D_Memento.memento;

import D_Memento.model.GameState;
import D_Memento.model.Piece;
import D_Memento.model.Player;

public class GameMemento {
    private final Piece[][] boardSnapshot;
    private final GameState gameState;
    private final Player currentPlayer;
    private final Player winner;

    public GameMemento(Piece[][] boardSnapshot, GameState gameState, Player currentPlayer, Player winner) {
        this.boardSnapshot = copy(boardSnapshot);
        this.gameState = gameState;
        this.currentPlayer = currentPlayer;
        this.winner = winner;
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

    private Piece[][] copy(Piece[][] source) {
        Piece[][] copy = new Piece[source.length][source.length];
        for (int row = 0; row < source.length; row++) {
            System.arraycopy(source[row], 0, copy[row], 0, source[row].length);
        }
        return copy;
    }
}


