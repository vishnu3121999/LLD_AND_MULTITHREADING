package F_COR.memento;

import java.util.ArrayDeque;
import java.util.Deque;

public class GameCaretaker {
    private final String gameId;
    private final Deque<GameMemento> history;

    public GameCaretaker(String gameId) {
        this.gameId = gameId;
        this.history = new ArrayDeque<>();
    }

    public String getGameId() {
        return gameId;
    }

    public void save(GameMemento memento) {
        history.push(memento);
    }

    public GameMemento undo() {
        if (history.isEmpty()) {
            return null;
        }
        return history.pop();
    }
}


