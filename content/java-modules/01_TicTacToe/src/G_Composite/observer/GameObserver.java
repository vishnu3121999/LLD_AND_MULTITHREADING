package G_Composite.observer;

import G_Composite.model.game.TicTacToeGame;

public interface GameObserver {
    void onGameUpdated(String event, TicTacToeGame game);
}
