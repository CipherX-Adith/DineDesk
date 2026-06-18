package com.dinedesk;

import com.dinedesk.entity.Menu;
import com.dinedesk.entity.User;
import com.dinedesk.repository.MenuRepository;
import com.dinedesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DbInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed users
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setFullName("Admin Owner");
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            admin.setStatus("Active");
            userRepository.save(admin);

            User staff = new User();
            staff.setFullName("Staff Server");
            staff.setUsername("staff");
            staff.setPassword("staff123");
            staff.setRole("STAFF");
            staff.setStatus("Active");
            userRepository.save(staff);
            
            System.out.println("Default users seeded: admin/admin123 and staff/staff123");
        }

        // Seed menu
        if (menuRepository.count() == 0) {
            saveMenuItem("Royal Malabar Biryani", "Main Course", "Slow-cooked aromatic rice with premium spices", 350.0, 50, "Available");
            saveMenuItem("Grilled Herb Chicken", "Main Course", "Tender chicken infused with fresh herbs", 380.0, 40, "Available");
            saveMenuItem("Seafood Platter", "Main Course", "Fresh catch prepared with coastal flavors", 450.0, 30, "Available");
            saveMenuItem("Paneer Maharaja", "Main Course", "Rich and creamy royal cottage cheese specialty", 280.0, 60, "Available");
            saveMenuItem("Fresh Lime Juice", "Beverages", "Refreshing fresh lime juice with mint", 60.0, 100, "Available");
            saveMenuItem("Chocolate Brownie with Ice Cream", "Desserts", "Warm fudge brownie served with vanilla ice cream", 150.0, 20, "Available");
            System.out.println("Default menu items seeded.");
        }
    }

    private void saveMenuItem(String name, String category, String description, Double price, Integer qty, String status) {
        Menu item = new Menu();
        item.setItemName(name);
        item.setCategory(category);
        item.setDescription(description);
        item.setPrice(price);
        item.setAvailableQuantity(qty);
        item.setAvailability(status);
        menuRepository.save(item);
    }
}
