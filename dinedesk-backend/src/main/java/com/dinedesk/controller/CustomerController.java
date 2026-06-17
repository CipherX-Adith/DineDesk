package com.dinedesk.controller;

import com.dinedesk.dto.CustomerRequest;
import com.dinedesk.dto.CustomerResponse;
import com.dinedesk.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin("*")
public class CustomerController {

    @Autowired
    CustomerService customerService;

    @PostMapping
    public CustomerResponse createCustomer(
            @RequestBody CustomerRequest request){

        return customerService
                .createCustomer(request);
    }
}