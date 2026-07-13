package I_AdditionalFeatures.observer;

import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.service.ChessGame;

public class BoardPrintObserver implements GameObserver {
    @Override
    public void onGameStarted(String gameId, ChessGame game) {
        game.getBoard().print();
    }

    @Override
    public void onMoveCompleted(String gameId, Move move, ChessGame game) {
        game.getBoard().print();
    }

    @Override
    public void onMoveUndone(String gameId, ChessGame game) {
        game.getBoard().print();
    }
}





