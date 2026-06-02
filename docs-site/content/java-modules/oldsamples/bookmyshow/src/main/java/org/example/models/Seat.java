package org.example.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.enums.SeatStatus;

import java.time.LocalDateTime;


public class Seat {
    String id;
    SeatStatus seatStatus;
    // can have a seperate object called SeatLock to store below 2 fields, if feel not relavent here
    LocalDateTime lockedTime;
    long timeOutSeconds;

    public Seat(String id, SeatStatus seatStatus, long timeOutSeconds) {
        this.id = id;
        this.seatStatus = seatStatus;
        this.timeOutSeconds = timeOutSeconds;
    }

    public void changeSeatStatus(SeatStatus seatStatus){
        if(seatStatus==SeatStatus.LOCKED)
            lockedTime = LocalDateTime.now();
        this.seatStatus = seatStatus;
    }

    public boolean isSeatFree(){
        if(seatStatus==SeatStatus.FREE || (seatStatus==SeatStatus.LOCKED && isLockExpired())){
            return true;
        }
        return false;
    }

    private boolean isLockExpired() {
        if(lockedTime.plusSeconds(timeOutSeconds).isBefore(LocalDateTime.now())){
            seatStatus = SeatStatus.FREE;
            return true;
        }
        return false;
    }


}
