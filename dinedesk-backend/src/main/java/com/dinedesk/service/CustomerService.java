package com.dinedesk.service;

import com.dinedesk.dto.CustomerRequest;
import com.dinedesk.dto.CustomerResponse;
import com.dinedesk.entity.Customer;
import com.dinedesk.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CustomerService {

    @Autowired
    CustomerRepository customerRepository;

    public CustomerResponse createCustomer(
            CustomerRequest request){

        Customer customer = new Customer();

        customer.setCustomerId(
                "CUST-" + System.currentTimeMillis()
        );

        customer.setCustomerName(
                request.getCustomerName()
        );

        customer.setPartySize(
                request.getAccompanyingPeople() + 1
        );

        customer.setCreatedAt(
                LocalDateTime.now()
        );

        customerRepository.save(customer);

        CustomerResponse response =
                new CustomerResponse();

        response.setCustomerId(
                customer.getCustomerId()
        );

        response.setCustomerName(
                customer.getCustomerName()
        );

        response.setPartySize(
                customer.getPartySize()
        );

        return response;
    }
}