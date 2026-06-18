package com.dinedesk.service;

import com.dinedesk.dto.OrderItemRequest;
import com.dinedesk.dto.OrderRequest;
import com.dinedesk.entity.Menu;
import com.dinedesk.entity.Order;
import com.dinedesk.entity.OrderItem;
import com.dinedesk.repository.MenuRepository;
import com.dinedesk.repository.OrderItemRepository;
import com.dinedesk.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    MenuRepository menuRepository;

    @org.springframework.transaction.annotation.Transactional
    public Order createOrder(OrderRequest request){
        List<Order> existingOrders = orderRepository.findByCustomerId(request.getCustomerId());
        Order activeOrder = null;
        for (Order o : existingOrders) {
            if (!"Paid".equalsIgnoreCase(o.getOrderStatus())) {
                activeOrder = o;
                break;
            }
        }

        if (activeOrder != null) {
            double addedSubtotal = 0;
            List<OrderItem> itemsToSave = new java.util.ArrayList<>();
            List<OrderItem> existingItems = activeOrder.getItems();

            for (OrderItemRequest itemRequest : request.getItems()) {
                Menu menu = menuRepository.findById(itemRequest.getItemId()).orElse(null);
                if (menu != null) {
                    if (menu.getAvailableQuantity() < itemRequest.getQuantity()) {
                        throw new RuntimeException(menu.getItemName() + " Out Of Stock");
                    }

                    double itemTotal = menu.getPrice() * itemRequest.getQuantity();
                    addedSubtotal += itemTotal;

                    // Deduct stock
                    menu.setAvailableQuantity(menu.getAvailableQuantity() - itemRequest.getQuantity());
                    if (menu.getAvailableQuantity() == 0) {
                        menu.setAvailability("Out Of Stock");
                    }
                    menuRepository.save(menu);

                    // Check if item already exists in this order to merge
                    OrderItem existingItem = null;
                    if (existingItems != null) {
                        for (OrderItem oi : existingItems) {
                            if (oi.getItemId().equals(menu.getItemId())) {
                                existingItem = oi;
                                break;
                            }
                        }
                    }

                    if (existingItem != null) {
                        existingItem.setQuantity(existingItem.getQuantity() + itemRequest.getQuantity());
                        existingItem.setItemTotal(existingItem.getItemTotal() + itemTotal);
                        itemsToSave.add(existingItem);
                    } else {
                        OrderItem orderItem = new OrderItem();
                        orderItem.setOrderId(activeOrder.getOrderId());
                        orderItem.setItemId(menu.getItemId());
                        orderItem.setQuantity(itemRequest.getQuantity());
                        orderItem.setSellingPrice(menu.getPrice());
                        orderItem.setItemTotal(itemTotal);
                        itemsToSave.add(orderItem);
                    }
                }
            }

            double newSubtotal = activeOrder.getSubtotal() + addedSubtotal;
            double newGst = newSubtotal * 0.18;
            double newTotalAmount = newSubtotal + newGst;

            activeOrder.setSubtotal(newSubtotal);
            activeOrder.setGst(newGst);
            activeOrder.setTotalAmount(newTotalAmount);
            activeOrder.setOrderStatus("Pending");
            activeOrder.setOrderTime(LocalDateTime.now());

            orderRepository.save(activeOrder);

            for (OrderItem orderItem : itemsToSave) {
                orderItemRepository.save(orderItem);
            }

            return activeOrder;
        } else {
            // Normal creation of a new order
            Order order = new Order();
            order.setOrderId("ORD-" + System.currentTimeMillis());
            order.setCustomerId(request.getCustomerId());

            double subtotal = 0;
            List<OrderItem> orderItems = new java.util.ArrayList<>();

            for (OrderItemRequest itemRequest : request.getItems()) {
                Menu menu = menuRepository.findById(itemRequest.getItemId()).orElse(null);
                if (menu != null) {
                    if (menu.getAvailableQuantity() < itemRequest.getQuantity()) {
                        throw new RuntimeException(menu.getItemName() + " Out Of Stock");
                    }

                    double itemTotal = menu.getPrice() * itemRequest.getQuantity();
                    subtotal += itemTotal;

                    menu.setAvailableQuantity(menu.getAvailableQuantity() - itemRequest.getQuantity());
                    if (menu.getAvailableQuantity() == 0) {
                        menu.setAvailability("Out Of Stock");
                    }
                    menuRepository.save(menu);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrderId(order.getOrderId());
                    orderItem.setItemId(menu.getItemId());
                    orderItem.setQuantity(itemRequest.getQuantity());
                    orderItem.setSellingPrice(menu.getPrice());
                    orderItem.setItemTotal(itemTotal);
                    orderItems.add(orderItem);
                }
            }

            double gstRate = 0.18;
            double gst = subtotal * gstRate;
            double totalAmount = subtotal + gst;

            order.setSubtotal(subtotal);
            order.setGst(gst);
            order.setTotalAmount(totalAmount);
            order.setOrderStatus("Pending");
            order.setPaymentStatus("Unpaid");
            order.setOrderTime(LocalDateTime.now());

            orderRepository.save(order);

            for (OrderItem orderItem : orderItems) {
                orderItemRepository.save(orderItem);
            }

            return order;
        }
    }

    public List<Order> getAllOrders(){

        return orderRepository.findAll();
    }

    public Order updateOrderStatus(
            String orderId,
            String status){

        Order order =
                orderRepository.findById(orderId)
                        .orElse(null);

        if(order != null){

            order.setOrderStatus(
                    status
            );

            return orderRepository.save(
                    order
            );
        }

        return null;
    }

    @org.springframework.transaction.annotation.Transactional
    public String deleteOrder(
            String orderId){

        orderItemRepository.deleteByOrderId(
                orderId
        );

        orderRepository.deleteById(
                orderId
        );

        return "Order Deleted Successfully";
    }

    public List<Order> getOrdersByCustomer(
            String customerId){

        return orderRepository
                .findByCustomerId(
                        customerId
                );
    }
}