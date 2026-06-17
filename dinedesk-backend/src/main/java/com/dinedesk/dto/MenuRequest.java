package com.dinedesk.dto;

import lombok.Data;

@Data
public class MenuRequest {

    private String itemName;

    private String category;

    private String description;

    private Double price;

    private Integer availableQuantity;

    private String availability;

}