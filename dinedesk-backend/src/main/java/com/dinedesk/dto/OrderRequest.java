package com.dinedesk.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    private String customerId;

    private List<OrderItemRequest> items;

}