package com.dinedesk.service;

import com.dinedesk.dto.LoginRequest;
import com.dinedesk.dto.LoginResponse;
import com.dinedesk.dto.UserRequest;
import com.dinedesk.entity.User;
import com.dinedesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    public User createUser(
            UserRequest request){

        User user = new User();

        user.setFullName(
                request.getFullName()
        );

        user.setUsername(
                request.getUsername()
        );

        user.setPassword(
                request.getPassword()
        );

        user.setRole(
                request.getRole()
        );

        user.setStatus(
                "Active"
        );

        return userRepository.save(user);
    }

    public LoginResponse login(
            LoginRequest request){

        User user =
                userRepository.findByUsername(
                        request.getUsername()
                );

        if(user == null){

            return null;
        }

        if(!user.getPassword()
                .equals(request.getPassword())){

            return null;
        }

        LoginResponse response =
                new LoginResponse();

        response.setUserId(
                user.getUserId()
        );

        response.setFullName(
                user.getFullName()
        );

        response.setUsername(
                user.getUsername()
        );

        response.setRole(
                user.getRole()
        );

        response.setStatus(
                user.getStatus()
        );

        return response;
    }

    public List<User> getAllUsers(){

        return userRepository.findAll();
    }

    public User updateUser(
            Integer userId,
            UserRequest request){

        User user =
                userRepository.findById(userId)
                        .orElse(null);

        if(user != null){

            user.setFullName(
                    request.getFullName()
            );

            user.setUsername(
                    request.getUsername()
            );

            user.setPassword(
                    request.getPassword()
            );

            user.setRole(
                    request.getRole()
            );

            return userRepository.save(user);
        }

        return null;
    }

    public String deleteUser(
            Integer userId){

        userRepository.deleteById(userId);

        return "User Deleted Successfully";
    }
}