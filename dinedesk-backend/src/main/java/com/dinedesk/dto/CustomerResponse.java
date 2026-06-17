package com.dinedesk.dto;

import lombok.Data;

@Data
public class CustomerResponse {

    private String customerId;

    private String customerName;

    private Integer partySize;

}