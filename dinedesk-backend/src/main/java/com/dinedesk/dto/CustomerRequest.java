package com.dinedesk.dto;

import lombok.Data;

@Data
public class CustomerRequest {

    private String customerName;

    private Integer accompanyingPeople;

}