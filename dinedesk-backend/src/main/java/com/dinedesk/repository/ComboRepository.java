package com.dinedesk.repository;

import com.dinedesk.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComboRepository
        extends JpaRepository<Combo,Integer> {
}