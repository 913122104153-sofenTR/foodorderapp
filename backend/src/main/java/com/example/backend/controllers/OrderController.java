package com.example.backend.controllers;

import com.example.backend.dtos.OrderDto;
import com.example.backend.models.Order;
import com.example.backend.services.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public Order placeOrder(@RequestBody OrderDto dto) {
        return service.placeOrder(dto);
    }

    @GetMapping
    public List<Order> getAll() {
        return service.getAllOrders();
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Long id) {
        return service.getOrderById(id);
    }

    @GetMapping("/location/{location}")
    public List<Order> getByLocation(@PathVariable String location) {
        return service.getOrdersByLocation(location);
    }

    @GetMapping("/price")
    public List<Order> getByMaxPrice(@RequestParam int maxPrice) {
        return service.getOrdersByMaxPrice(maxPrice);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteOrder(id);
        return "Order deleted successfully";
    }
}
