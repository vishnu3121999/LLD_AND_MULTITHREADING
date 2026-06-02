package org.example.models;

import lombok.Data;

import java.util.List;

@Data
public class Theater {
    String id;
    String City;
    List<String> screenList;

    public Theater(String id,String city, List<String> screenList) {
        City = city;
        this.id = id;
        this.screenList = screenList;
    }
}
