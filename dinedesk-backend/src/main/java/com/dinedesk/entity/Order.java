package com.dinedesk.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

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

    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "orderId", referencedColumnName = "orderId", insertable = false, updatable = false)
    private List<OrderItem> items;

}