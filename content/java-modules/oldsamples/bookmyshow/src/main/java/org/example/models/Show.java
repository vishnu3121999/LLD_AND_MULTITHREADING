package org.example.models;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.*;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class Show {
    String id;
    String movieId;
    String theaterId;
    LocalDateTime dateTime;
    List<String> seats;
}
