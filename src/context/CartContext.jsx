// contexts/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const SHIPPING_COST = 9;
  const TAX_RATE = 0;

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('wiqar_cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('wiqar_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wiqar_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Helper function to get product price for a specific size
  const getProductPriceForSize = (product, size) => {
    // Check prices object (new structure)
    if (product.prices && product.prices[size]) {
      return product.prices[size];
    }
    // Check currentPrices (from API response)
    if (product.currentPrices && product.currentPrices[size]) {
      return product.currentPrices[size];
    }
    // Fallback to discountedPrice or regular price
    if (product.discountedPrice) {
      return product.discountedPrice;
    }
    return product.price || 0;
  };

  const addToCart = (product, quantity = 1, selectedSize = '30ml', customPrice = null) => {
    if (!product?._id || !product?.name) {
      console.error('Invalid product structure:', product);
      throw new Error('Invalid product data');
    }

    // Get the correct price for the selected size
    let currentPrice = customPrice;
    if (!currentPrice) {
      currentPrice = getProductPriceForSize(product, selectedSize);
    }
    
    // If still no price, use discountedPrice or fallback
    if (!currentPrice || currentPrice <= 0) {
      currentPrice = product.discountedPrice || product.price || 0;
    }

    const originalPrice = product.prices?.[selectedSize] || product.price || currentPrice;

    setCart((prev) => {
      // Find existing item with same ID and same size
      const existingItemIndex = prev.findIndex(
        (item) => item._id === product._id && item.selectedSize === selectedSize
      );

      const variantKey = `${product._id}-${selectedSize}`;

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...prev];
        const existingItem = updatedCart[existingItemIndex];
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity
        };
        return updatedCart;
      } else {
        // Add new item with correct size and price
        const newItem = {
          _id: product._id,
          productId: product._id,
          name: product.name,
          price: currentPrice,
          originalPrice: originalPrice,
          mainImage: product.images?.[0]?.url || product.image || null,
          quantity: quantity,
          selectedSize: selectedSize,
          discount: product.discountedPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0,
          stock: product.stock,
          variantKey: variantKey,
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (productId, size = null) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item._id === productId && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item._id === productId && item.selectedSize === size
          ? { ...item, quantity: Math.min(quantity, item.stock || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('wiqar_cart');
  };

  // Calculate cart metrics
  const cartCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  
  // Free shipping on orders over 100 TND
  const shippingCost = useMemo(() => subtotal >= 200 ? 0 : SHIPPING_COST, [subtotal]);
  
  const total = useMemo(() => subtotal + shippingCost + tax, [subtotal, shippingCost, tax]);
  const totalNoTax = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  const isInCart = useCallback((productId, size = null) => {
    return cart.some(item => 
      item._id === productId && item.selectedSize === size
    );
  }, [cart]);

  const getItem = useCallback((productId, size = null) => {
    return cart.find(item => 
      item._id === productId && item.selectedSize === size
    );
  }, [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
    shippingCost,
    tax,
    total,
    totalNoTax,
    isCartOpen,
    setIsCartOpen,
    isInCart,
    getItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};