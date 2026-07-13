package org.example.database;

import lombok.Data;
import org.example.models.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class State {

    // Tables
    Map<String, Movie> movies;
    Map<String, Theater> theaters;
    Map<String, Ticket> tickets;
    Map<String, Show> shows;
    Map<String, Screen> screens;
    Map<String, Seat> seats;


    // Note - use concurrent collections for multi-threaded app to prevent concurrentModificationException
    //                                                                      at runtime
    public State(){
        movies = new ConcurrentHashMap<>();
        theaters = new ConcurrentHashMap<>();
        tickets = new ConcurrentHashMap<>();
        shows = new ConcurrentHashMap<>();
        screens = new ConcurrentHashMap<>();
        seats = new ConcurrentHashMap<>();
    }

}
