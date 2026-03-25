package com.example.backend.controllers;

import com.example.backend.models.FoodItem;
import com.example.backend.services.FoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin
public class FoodItemController {

    @Autowired
    private FoodItemService foodItemService;

    @PostMapping("/add")
    public FoodItem addFoodItem(@RequestBody FoodItem item) {
        return foodItemService.addFoodItem(item);
    }

    @GetMapping("/{restaurantId}")
    public List<FoodItem> getMenu(@PathVariable Long restaurantId) {
        return foodItemService.getMenuByRestaurant(restaurantId);
    }

    @DeleteMapping("/{id}")
    public String deleteItem(@PathVariable Long id) {
        foodItemService.deleteItem(id);
        return "Item Deleted";
    }
}