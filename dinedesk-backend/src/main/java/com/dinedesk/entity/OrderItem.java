package com.dinedesk.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderItemId;

    private String orderId;

    private Integer itemId;

    private Integer quantity;

    private Double sellingPrice;

    private Double itemTotal;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "itemId", referencedColumnName = "itemId", insertable = false, updatable = false)
    private Menu menuItem;

}