package com.dinedesk.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String fullName;

    @Column(unique = true)
    private String username;

    private String password;

    private String role;

    private String status;

}