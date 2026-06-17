package com.dinedesk.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customers")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Customer {

    @Id
    private String customerId;

    private String customerName;

    private int partySize;

    private LocalDateTime createdAt;

    private String status;

}