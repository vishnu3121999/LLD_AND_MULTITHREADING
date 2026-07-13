package E_ExceptionHandling.observer;

import E_ExceptionHandling.model.game.TicTacToeGame;

public interface GameObserver {
    void onGameUpdated(String event, TicTacToeGame game);
}
