package com.dinedesk.dto;

import lombok.Data;

@Data
public class LoginResponse {

    private Integer userId;

    private String fullName;

    private String username;

    private String role;

    private String status;

}