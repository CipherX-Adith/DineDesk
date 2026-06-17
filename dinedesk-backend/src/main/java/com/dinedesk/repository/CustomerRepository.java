package com.dinedesk.repository;

import com.dinedesk.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository
        extends JpaRepository<Customer,String> {
}