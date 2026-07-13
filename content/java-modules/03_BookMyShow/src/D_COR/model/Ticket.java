package D_COR.model;

import D_COR.model.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Ticket {
    private final String ticketId;
    private final String userId;
    private final String showId;
    private final List<String> showSeatList;
    private final LocalDateTime createdAt;
    private final LocalDateTime expiresAt;
    private int price;
    private TicketStatus ticketStatus;

    public Ticket(String ticketId, String userId, String showId, List<String> showSeatList,
                  TicketStatus ticketStatus, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.ticketId = ticketId;
        this.userId = userId;
        this.showId = showId;
        this.showSeatList = new ArrayList<>(showSeatList);
        this.ticketStatus = ticketStatus;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.price = 0;
    }

    public boolean isExpired(LocalDateTime now) {
        return ticketStatus == TicketStatus.PENDING_PAYMENT && !expiresAt.isAfter(now);
    }

    public void confirm() {
        this.ticketStatus = TicketStatus.CONFIRMED;
    }

    public void expire() {
        this.ticketStatus = TicketStatus.EXPIRED;
    }

    public void updatePrice(int price) {
        this.price = price;
    }

    @Override
    public String toString() {
        return "Ticket{" +
                "ticketId='" + ticketId + '\'' +
                ", userId='" + userId + '\'' +
                ", showSeats=" + showSeatList +
                ", price=" + price +
                ", status=" + ticketStatus +
                ", expiresAt=" + expiresAt +
                '}';
    }

    public String getTicketId() {
        return ticketId;
    }

    public String getUserId() {
        return userId;
    }

    public String getShowId() {
        return showId;
    }

    public List<String> getShowSeatList() {
        return Collections.unmodifiableList(showSeatList);
    }

    public TicketStatus getTicketStatus() {
        return ticketStatus;
    }

    public int getPrice() {
        return price;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
