package E_Observer.observer;

import E_Observer.model.Move;
import E_Observer.service.ChessGame;

public interface GameObserver {
    void onGameStarted(String gameId, ChessGame game);

    void onMoveCompleted(String gameId, Move move, ChessGame game);

    void onMoveUndone(String gameId, ChessGame game);
}

