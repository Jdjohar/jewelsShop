import React, { useReducer, useContext, createContext,useEffect, useState } from 'react';

const CartStateContext = createContext();
const CartDispatchContext = createContext();

const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  };
  

  const reducer = (state, action) => {
    switch (action.type) {
        case "ADD":
            return [...state, { id: action.id, name: action.name, qty: action.qty, size: action.size, price: action.price, img: action.img }];

        case "REMOVE":
            let newArr = [...state];
            newArr.splice(action.index, 1);
            return newArr;

        case "DROP":
            return [];

        case "UPDATE":
            let arr = [...state];
            arr = arr.map((food) => {
                if (food.id === action.id && food.size === action.size) {
                    // Update the quantity and recalculate the price
                    return {
                        ...food,
                        qty: parseInt(action.qty),  
                        price: parseInt(action.qty) * (food.price / food.qty)  // Recalculate the price
                    };
                }
                return food;
            });
            return arr;

        default:
            console.log("Error in Reducer");
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, [], loadCartFromStorage);
    useEffect(() => {
        console.log(state,"State");
        
        localStorage.setItem('cart', JSON.stringify(state));
      }, [state]);
    return (
        <CartDispatchContext.Provider value={dispatch}>
            <CartStateContext.Provider value={state}>
                {children}
            </CartStateContext.Provider>
        </CartDispatchContext.Provider>
    )
};

export const useCart = () => useContext(CartStateContext);
export const useDispatchCart = () => useContext(CartDispatchContext);