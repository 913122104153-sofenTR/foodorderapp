package com.example.backend.services;

import com.example.backend.dtos.OrderDto;
import com.example.backend.models.Order;
import com.example.backend.repositories.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

	private final OrderRepository repo;

	public OrderService(OrderRepository repo) {
		this.repo = repo;
	}

	public Order placeOrder(OrderDto dto) {
		Order order = new Order();
		order.setCustomerName(dto.getName());
		order.setLocation(dto.getLocation());
		order.setFoodItem(dto.getFoodItem());
		order.setPrice(dto.getPrice());

		return repo.save(order);
	}

	public List<Order> getAllOrders() {
		return repo.findAll();
	}

	public Order getOrderById(Long id) {
		return repo.findById(id)
				.orElseThrow(() -> new RuntimeException("Order not found"));
	}

	public void deleteOrder(Long id) {
		repo.deleteById(id);
	}

	public List<Order> getOrdersByLocation(String location) {
		return repo.findByLocation(location);
	}

	public List<Order> getOrdersByMaxPrice(int price) {
		return repo.findByPriceLessThanEqual(price);
	}
}

