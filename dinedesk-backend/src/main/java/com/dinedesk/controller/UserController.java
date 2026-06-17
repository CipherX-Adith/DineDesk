package com.dinedesk.controller;

import com.dinedesk.dto.LoginRequest;
import com.dinedesk.dto.LoginResponse;
import com.dinedesk.dto.UserRequest;
import com.dinedesk.entity.User;
import com.dinedesk.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping
    public User createUser(
            @RequestBody UserRequest request){

        return userService
                .createUser(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request){

        return userService
                .login(request);
    }

    @GetMapping
    public List<User> getAllUsers(){

        return userService
                .getAllUsers();
    }

    @PutMapping("/{id}")
    public User updateUser(

            @PathVariable Integer id,

            @RequestBody UserRequest request){

        return userService
                .updateUser(
                        id,
                        request
                );
    }

    @DeleteMapping("/{id}")
    public String deleteUser(
            @PathVariable Integer id){

        return userService
                .deleteUser(id);
    }
}