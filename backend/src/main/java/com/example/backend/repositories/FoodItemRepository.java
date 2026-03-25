package com.example.backend.repositories;

import com.example.backend.models.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByRestaurant_Id(Long restaurantId);
}