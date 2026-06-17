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

    public Order createOrder(OrderRequest request){

        Order order = new Order();

        order.setOrderId(
                "ORD-" + System.currentTimeMillis()
        );

        order.setCustomerId(
                request.getCustomerId()
        );

        double subtotal = 0;

        for(OrderItemRequest itemRequest :
                request.getItems()){

            Menu menu =
                    menuRepository.findById(
                            itemRequest.getItemId()
                    ).orElse(null);

            if(menu != null){

                if(menu.getAvailableQuantity()
                        < itemRequest.getQuantity()){

                    throw new RuntimeException(
                            menu.getItemName()
                                    + " Out Of Stock"
                    );
                }

                double itemTotal =
                        menu.getPrice()
                                * itemRequest.getQuantity();

                subtotal += itemTotal;

                menu.setAvailableQuantity(
                        menu.getAvailableQuantity()
                                - itemRequest.getQuantity()
                );

                if(menu.getAvailableQuantity() == 0){

                    menu.setAvailability(
                            "Out Of Stock"
                    );
                }

                menuRepository.save(menu);

                OrderItem orderItem =
                        new OrderItem();

                orderItem.setOrderId(
                        order.getOrderId()
                );

                orderItem.setItemId(
                        menu.getItemId()
                );

                orderItem.setQuantity(
                        itemRequest.getQuantity()
                );

                orderItem.setSellingPrice(
                        menu.getPrice()
                );

                orderItem.setItemTotal(
                        itemTotal
                );

                orderItemRepository.save(
                        orderItem
                );
            }
        }

        double gstRate = 0.18;

        double gst =
                subtotal * gstRate;

        double totalAmount =
                subtotal + gst;

        order.setSubtotal(
                subtotal
        );

        order.setGst(
                gst
        );

        order.setTotalAmount(
                totalAmount
        );

        order.setOrderStatus(
                "Pending"
        );

        order.setPaymentStatus(
                "Unpaid"
        );

        order.setOrderTime(
                LocalDateTime.now()
        );

        orderRepository.save(
                order
        );

        return order;
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

    public String deleteOrder(
            String orderId){

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