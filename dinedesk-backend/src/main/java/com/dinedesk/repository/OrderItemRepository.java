package com.dinedesk.repository;

import com.dinedesk.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository
        extends JpaRepository<OrderItem,Integer> {
}