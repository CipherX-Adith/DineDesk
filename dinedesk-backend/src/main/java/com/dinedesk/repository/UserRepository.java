package com.dinedesk.repository;

import com.dinedesk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository
        extends JpaRepository<User,Integer> {

    User findByUsername(String username);

}