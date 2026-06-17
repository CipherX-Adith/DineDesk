package com.dinedesk.controller;

import com.dinedesk.dto.OrderRequest;
import com.dinedesk.entity.Order;
import com.dinedesk.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    OrderService orderService;

    @PostMapping
    public Order createOrder(
            @RequestBody OrderRequest request){

        return orderService
                .createOrder(request);
    }

    @GetMapping
    public List<Order> getAllOrders(){

        return orderService
                .getAllOrders();
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> getOrdersByCustomer(

            @PathVariable String customerId){

        return orderService
                .getOrdersByCustomer(
                        customerId
                );
    }

    @PutMapping("/{id}/{status}")
    public Order updateOrderStatus(

            @PathVariable String id,

            @PathVariable String status){

        return orderService
                .updateOrderStatus(
                        id,
                        status
                );
    }

    @DeleteMapping("/{id}")
    public String deleteOrder(
            @PathVariable String id){

        return orderService
                .deleteOrder(id);
    }
}