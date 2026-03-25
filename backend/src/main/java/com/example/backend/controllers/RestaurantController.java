package com.example.backend.controllers;

import com.example.backend.dtos.RestaurantDto;
import com.example.backend.models.Restaurant;
import com.example.backend.services.RestaurantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService service;

    public RestaurantController(RestaurantService service) {
        this.service = service;
    }


    @PostMapping
    public Restaurant addRestaurant(@RequestBody RestaurantDto dto) {
        return service.addRestaurant(dto);
    }


    @GetMapping
    public List<Restaurant> getAll() {
        return service.getAllRestaurants();
    }


    @GetMapping("/{id}")
    public Restaurant getById(@PathVariable Long id) {
        return service.getRestaurantById(id);
    }


    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteRestaurant(id);
        return "Restaurant deleted successfully";
    }
}