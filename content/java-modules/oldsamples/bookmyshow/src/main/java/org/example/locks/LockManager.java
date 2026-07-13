package org.example.locks;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class LockManager {
    static Map<String, Lock> locksForShows = new ConcurrentHashMap<>();
    // Note - concurrentHashMap - as this is multi-threaded system

    public static Lock getLockForShow(String showId){
        return locksForShows.get(showId);
    }

    public static void addLockForShow(String showId){
        locksForShows.put(showId,new ReentrantLock());
    }
}
