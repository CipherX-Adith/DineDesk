package com.dinedesk.dto;

import lombok.Data;

@Data
public class OrderItemRequest {

    private Integer itemId;

    private Integer quantity;

}