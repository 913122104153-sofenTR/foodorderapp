package com.example.backend.services;

import com.example.backend.models.FoodItem;
import com.example.backend.repositories.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodItemService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    public FoodItem addFoodItem(FoodItem item) {
        return foodItemRepository.save(item);
    }

    public List<FoodItem> getMenuByRestaurant(Long restaurantId) {
        return foodItemRepository.findByRestaurant_Id(restaurantId);
    }

    public void deleteItem(Long id) {
        foodItemRepository.deleteById(id);
    }
}
