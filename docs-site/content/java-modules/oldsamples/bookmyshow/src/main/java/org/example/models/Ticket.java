package org.example.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.enums.TicketStatus;

import java.util.List;

@Data
@AllArgsConstructor
public class Ticket {
    String id;
    String showId;
    List<String> seatIds;
    String userId;
    TicketStatus ticketStatus;
}
