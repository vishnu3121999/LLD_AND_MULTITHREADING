package G_exceptionhandling.observer;

import G_exceptionhandling.model.Move;
import G_exceptionhandling.service.ChessGame;

public interface GameObserver {
    void onGameStarted(String gameId, ChessGame game);

    void onMoveCompleted(String gameId, Move move, ChessGame game);

    void onMoveUndone(String gameId, ChessGame game);
}



