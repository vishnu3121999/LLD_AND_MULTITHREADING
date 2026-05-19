package H_persistance.observer;

import H_persistance.model.game.TicTacToeGame;

public interface GameObserver {
    void onGameUpdated(String event, TicTacToeGame game);
}
