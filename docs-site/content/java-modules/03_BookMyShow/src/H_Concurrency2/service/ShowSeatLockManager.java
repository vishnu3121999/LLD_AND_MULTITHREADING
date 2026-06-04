package H_Concurrency2.service;

import H_Concurrency2.model.Show;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

public class ShowSeatLockManager {
    private final Map<String, ReentrantLock> showSeatLockMap;

    public ShowSeatLockManager() {
        this.showSeatLockMap = new HashMap<>();
    }

    public List<ReentrantLock> acquireLocks(Show show, List<String> showSeatList) {
        List<ReentrantLock> acquiredLocks = new ArrayList<>();
        synchronized (show) {
            for (String showSeatId : showSeatList) {
                ReentrantLock showSeatLock = getLock(showSeatId);
                showSeatLock.lock();
                acquiredLocks.add(showSeatLock);
            }
        }
        return acquiredLocks;
    }

    public void releaseLocks(List<ReentrantLock> showSeatLocks) {
        for (int index = showSeatLocks.size() - 1; index >= 0; index--) {
            showSeatLocks.get(index).unlock();
        }
    }

    private synchronized ReentrantLock getLock(String showSeatId) {
        ReentrantLock showSeatLock = showSeatLockMap.get(showSeatId);
        if (showSeatLock == null) {
            showSeatLock = new ReentrantLock();
            showSeatLockMap.put(showSeatId, showSeatLock);
        }
        return showSeatLock;
    }
}
