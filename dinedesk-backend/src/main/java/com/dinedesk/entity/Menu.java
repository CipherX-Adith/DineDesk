package com.dinedesk.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemId;

    private String itemName;

    private String category;

    private String description;

    private Double price;

    private Integer availableQuantity;

    private String availability;

}