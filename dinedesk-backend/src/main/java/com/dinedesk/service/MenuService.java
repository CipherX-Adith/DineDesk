package com.dinedesk.service;

import com.dinedesk.dto.MenuRequest;
import com.dinedesk.dto.MenuResponse;
import com.dinedesk.entity.Menu;
import com.dinedesk.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {

    @Autowired
    MenuRepository menuRepository;

    public MenuResponse addMenuItem(MenuRequest request){

        Menu menu = new Menu();

        menu.setItemName(
                request.getItemName()
        );

        menu.setCategory(
                request.getCategory()
        );

        menu.setDescription(
                request.getDescription()
        );

        menu.setPrice(
                request.getPrice()
        );

        menu.setAvailableQuantity(
                request.getAvailableQuantity()
        );

        menu.setAvailability(
                request.getAvailability()
        );

        menuRepository.save(menu);

        MenuResponse response =
                new MenuResponse();

        response.setItemId(
                menu.getItemId()
        );

        response.setItemName(
                menu.getItemName()
        );

        response.setCategory(
                menu.getCategory()
        );

        response.setDescription(
                menu.getDescription()
        );

        response.setPrice(
                menu.getPrice()
        );

        response.setAvailableQuantity(
                menu.getAvailableQuantity()
        );

        response.setAvailability(
                menu.getAvailability()
        );

        return response;
    }
    public List<Menu> getAllMenuItems(){

        return menuRepository.findAll();

    }
    public Menu updateQuantity(
            Integer itemId,
            Integer quantity){

        Menu menu =
                menuRepository.findById(itemId)
                        .orElse(null);

        if(menu != null){

            menu.setAvailableQuantity(
                    quantity
            );

            menuRepository.save(menu);
        }

        return menu;
    }
    public Menu updateMenuItem(
            Integer itemId,
            MenuRequest request){

        Menu menu =
                menuRepository.findById(itemId)
                        .orElse(null);

        if(menu != null){
            if(request.getItemName() != null) menu.setItemName(request.getItemName());
            if(request.getCategory() != null) menu.setCategory(request.getCategory());
            if(request.getDescription() != null) menu.setDescription(request.getDescription());
            if(request.getPrice() != null) menu.setPrice(request.getPrice());
            if(request.getAvailableQuantity() != null) {
                menu.setAvailableQuantity(request.getAvailableQuantity());
                // Update availability based on quantity
                if (request.getAvailableQuantity() > 0) {
                    menu.setAvailability("Available");
                } else {
                    menu.setAvailability("OutOfStock");
                }
            }
            if(request.getAvailability() != null) menu.setAvailability(request.getAvailability());

            menuRepository.save(menu);
        }

        return menu;
    }
    public String deleteMenuItem(
            Integer itemId){

        menuRepository.deleteById(itemId);

        return "Menu Item Deleted Successfully";
    }
}