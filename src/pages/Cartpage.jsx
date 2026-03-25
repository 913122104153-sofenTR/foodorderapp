import React, { useState } from 'react';
import './CartPage.css';

export default function CartPage() {
    const [cartItems, setCartItems] = useState([
        { id: 1, name: 'Burger', price: 499, quantity: 2 },
        { id: 2, name: 'Pizza', price: 199, quantity: 1 },
        { id: 3, name: 'Fries', price: 399, quantity: 4 },
        { id: 4, name: 'Coco', price: 80, quantity: 5 },
        { id: 5, name: 'Noodles', price: 200, quantity: 3 },

    ]);

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            removeItem(id);
        } else {
            setCartItems(cartItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            ));
        }
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart-container">
            <h1>Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="item-info">
                                    <h3>{item.name}</h3>
                                    <p>${item.price.toFixed(2)}</p>
                                </div>
                                <div className="quantity-control">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>
                                <div className="item-total">
                                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <button className="remove-btn" onClick={() => removeItem(item.id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h2>Total: ${total.toFixed(2)}</h2>
                        <button className="checkout-btn">Proceed to Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
}