package I_AdditionalFeatures.observer;

import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.service.ChessGame;

public interface GameObserver {
    void onGameStarted(String gameId, ChessGame game);

    void onMoveCompleted(String gameId, Move move, ChessGame game);

    void onMoveUndone(String gameId, ChessGame game);
}





