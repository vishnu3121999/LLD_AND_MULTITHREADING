package org.example.services;

import org.example.database.State;
import org.example.enums.PaymentType;
import org.example.enums.SeatStatus;
import org.example.enums.TicketStatus;
import org.example.models.Seat;
import org.example.models.Ticket;
import org.example.services.payments.PaymentFactory;

import java.util.List;

public class PaymentService {
    State state;

    Ticket pay(PaymentType paymentType, String ticketId){
        boolean success = PaymentFactory.get(paymentType).processPayment();
        Ticket ticket =null;
        if(success){
            ticket = state.getTickets().get(ticketId);
            ticket.setTicketStatus(TicketStatus.CONFIRMED);
            List<String> seatIds = ticket.getSeatIds();
            for(var seatId: seatIds){
                Seat seat = state.getSeats().get(seatId);
                seat.changeSeatStatus(SeatStatus.BOOKED);
            }
        }
        return ticket;
    }
}


