package com.dinedesk.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Order {

    @Id
    private String orderId;

    private String customerId;

    private Double subtotal;

    private Double gst;

    private Double totalAmount;

    private String orderStatus;

    private String paymentStatus;

    private LocalDateTime orderTime;

}