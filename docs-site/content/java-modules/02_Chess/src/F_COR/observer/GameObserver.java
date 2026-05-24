package F_COR.observer;

import F_COR.model.Move;
import F_COR.service.ChessGame;

public interface GameObserver {
    void onGameStarted(String gameId, ChessGame game);

    void onMoveCompleted(String gameId, Move move, ChessGame game);

    void onMoveUndone(String gameId, ChessGame game);
}


