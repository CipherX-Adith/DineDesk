package com.dinedesk.controller;

import com.dinedesk.dto.MenuRequest;
import com.dinedesk.dto.MenuResponse;
import com.dinedesk.entity.Menu;
import com.dinedesk.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin("*")
public class MenuController {

    @Autowired
    MenuService menuService;

    @PostMapping
    public MenuResponse addMenuItem(
            @RequestBody MenuRequest request){

        return menuService
                .addMenuItem(request);
    }
    @GetMapping
    public List<Menu> getAllMenuItems(){

        return menuService.getAllMenuItems();
    }
    @PutMapping("/{id}/{quantity}")
    public Menu updateQuantity(

            @PathVariable Integer id,

            @PathVariable Integer quantity){

        return menuService
                .updateQuantity(
                        id,
                        quantity
                );
    }
    @PutMapping("/{id}")
    public Menu updateMenuItem(
            @PathVariable Integer id,
            @RequestBody MenuRequest request){

        return menuService.updateMenuItem(id, request);
    }
    @DeleteMapping("/{id}")
    public String deleteMenuItem(
            @PathVariable Integer id){

        return menuService
                .deleteMenuItem(id);
    }
}