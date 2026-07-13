package org.example.services;

import org.example.database.State;
import org.example.enums.SeatStatus;
import org.example.enums.TicketStatus;
import org.example.locks.LockManager;
import org.example.models.Show;
import org.example.models.Ticket;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class BookingService {
    State state;

    public BookingService(State state) {
        this.state = state;
    }

    // Pessimistic locking - as conflicts are very frequent
    String bookTicket(String userId, String showId, List<String> seatIds){

        LockManager.getLockForShow(showId).lock();

        if(checkIfAllSeatsAreFree(seatIds)){
            changeSeatStatus(seatIds,SeatStatus.LOCKED);
        }
        else throw new IllegalStateException("one or more of selected seats are locked, pls try booking other seats");

        LockManager.getLockForShow(showId).unlock();



        // send req to user to pay

        Ticket ticket = new Ticket(UUID.randomUUID().toString(),showId,seatIds,userId, TicketStatus.PENDING_PAYMENT);
        state.getTickets().put(ticket.getId(),ticket);
        return ticket.getId();
    }

    private void changeSeatStatus(List<String> seatIds, SeatStatus seatStatus) {
        for(var id:seatIds){
            state.getSeats().get(id).changeSeatStatus(seatStatus);
        }
    }

    private boolean checkIfAllSeatsAreFree(List<String> seatIds) {
        for(String seatId:seatIds){
            if(!state.getSeats().get(seatId).isSeatFree())return false;
        }
        return true;
    }


}
