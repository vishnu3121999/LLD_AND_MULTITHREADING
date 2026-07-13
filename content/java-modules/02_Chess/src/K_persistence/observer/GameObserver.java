package K_persistence.observer;

import K_persistence.model.Move;
import K_persistence.service.ChessGame;

public interface GameObserver {
    void onGameStarted(String gameId, ChessGame game);

    void onMoveCompleted(String gameId, Move move, ChessGame game);

    void onMoveUndone(String gameId, ChessGame game);
}





