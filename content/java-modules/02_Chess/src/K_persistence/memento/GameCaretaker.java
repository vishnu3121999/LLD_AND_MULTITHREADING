package K_persistence.memento;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class GameCaretaker {
    private final String gameId;
    private final Deque<GameMemento> history;

    public GameCaretaker(String gameId) {
        this.gameId = gameId;
        this.history = new ArrayDeque<>();
    }

    public GameCaretaker(String gameId, List<GameMemento> history) {
        this.gameId = gameId;
        this.history = new ArrayDeque<>(history);
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

    public List<GameMemento> getHistory() {
        return new ArrayList<>(history);
    }
}





