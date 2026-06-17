package com.dinedesk.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "combos")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Combo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer comboId;

    private String comboName;

    private String comboItems;

    private Double comboPrice;

    private Double discountAmount;

    private String status;

}