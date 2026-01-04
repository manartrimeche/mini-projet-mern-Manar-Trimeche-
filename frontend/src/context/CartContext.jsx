import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.productId === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
        return copy;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image || product.imageUrl || product.images?.[0] || null,
          brand: product.brand,
          quantity
        }
      ];
    });
  };

  const updateQty = (productId, quantity) => {
    setItems(prev => prev.map(it => it.productId === productId ? { ...it, quantity: Math.max(1, quantity) } : it));
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(it => it.productId !== productId));
  };

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const count = items.reduce((s, it) => s + it.quantity, 0);
    const amount = items.reduce((s, it) => s + it.quantity * (it.price || 0), 0);
    return { count, amount };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, totals }}>
      {children}
    </CartContext.Provider>
  );
};
