package com.example.backend.services;

import com.example.backend.dtos.RestaurantDto;
import com.example.backend.models.Restaurant;
import com.example.backend.repositories.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepository repo;

    public RestaurantService(RestaurantRepository repo) {
        this.repo = repo;
    }

   
    public Restaurant addRestaurant(RestaurantDto dto) {
        Restaurant restaurant = new Restaurant();
        restaurant.setName(dto.getName());
        restaurant.setLocation(dto.getLocation());

        return repo.save(restaurant);
    }


    public List<Restaurant> getAllRestaurants() {
        return repo.findAll();
    }

    
    public Restaurant getRestaurantById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    
    public void deleteRestaurant(Long id) {
        repo.deleteById(id);
    }
}