'use client'

import { MAX_FILE_SIZE, TAX_RATE, DEFAULT_WAREHOUSE_ZIP } from '@/lib/constants'
import type { CartItem, CartState, CartContextType } from '@/lib/cart-types'

import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react'

// Shipping will be calculated dynamically at checkout based on FedEx rates
// This is just a placeholder for cart display before checkout
const ESTIMATED_SHIPPING = 0 // Set to 0 - actual shipping calculated at checkout

const initialState: CartState = {
  items: [],
  isOpen: false,
  lastUpdated: new Date().toISOString(),
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

function cartReducer(state: CartState, action: CartAction): CartState {
  const updatedState = (() => {
    switch (action.type) {
      case 'ADD_ITEM': {
        // SINGLE PRODUCT MODEL: Replace existing cart item with new one
        // Users can only order one product at a time
        return {
          ...state,
          items: [action.payload], // Replace entire cart with just this item
          isOpen: true,
          lastUpdated: new Date().toISOString(),
        }
      }

      case 'REMOVE_ITEM':
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload),
          lastUpdated: new Date().toISOString(),
        }

      case 'UPDATE_QUANTITY': {
        const { id, quantity } = action.payload
        if (quantity <= 0) {
          return {
            ...state,
            items: state.items.filter((item) => item.id !== id),
            lastUpdated: new Date().toISOString(),
          }
        }

        return {
          ...state,
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity, subtotal: item.price * quantity } : item
          ),
          lastUpdated: new Date().toISOString(),
        }
      }

      case 'CLEAR_CART':
        return {
          ...state,
          items: [],
          lastUpdated: new Date().toISOString(),
        }

      case 'OPEN_CART':
        return { ...state, isOpen: true }

      case 'CLOSE_CART':
        return { ...state, isOpen: false }

      case 'TOGGLE_CART':
        return { ...state, isOpen: !state.isOpen }

      case 'LOAD_CART':
        return action.payload

      default:
        return state
    }
  })()

  if (typeof window !== 'undefined') {
    localStorage.setItem('gangrun_cart', JSON.stringify(updatedState))
  }

  return updatedState
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isLoading, setIsLoading] = React.useState(true)

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('gangrun_cart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart) as CartState

          // Ensure items is an array (critical defensive check)
          if (!parsedCart.items || !Array.isArray(parsedCart.items)) {
            console.warn('⚠️ Cart items is not an array. Resetting cart.')
            localStorage.removeItem('gangrun_cart')
            dispatch({ type: 'CLEAR_CART' })
            setIsLoading(false)
            return
          }

          // Validate cart items have required shipping fields (only if cart has items)
          if (parsedCart.items.length > 0) {
            const invalidItems = parsedCart.items.filter((item: any) => {
              // Check for missing critical shipping data
              if (!item.dimensions || !item.paperStockWeight) {
                return true
              }
              // Check for invalid paper weight (must be positive number)
              if (typeof item.paperStockWeight !== 'number' || item.paperStockWeight <= 0) {
                console.warn('⚠️ Item has invalid paper weight:', item.paperStockWeight)
                return true
              }
              return false
            })

            if (invalidItems.length > 0) {
              console.warn('⚠️ Cart has items with invalid shipping data. Resetting cart.')
              console.warn('Invalid items:', invalidItems)
              localStorage.removeItem('gangrun_cart')
              dispatch({ type: 'CLEAR_CART' }) // CRITICAL: Reset state, not just localStorage
              setIsLoading(false)
              return
            }
          }

          // All validation passed - load the cart
          dispatch({ type: 'LOAD_CART', payload: parsedCart })
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        // On any error, reset to empty cart to prevent crashes
        dispatch({ type: 'CLEAR_CART' })
        localStorage.removeItem('gangrun_cart')
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'subtotal'>) => {
    const id = `${item.productId}-${JSON.stringify(item.options)}-${Date.now()}`
    const subtotal = item.price * item.quantity

    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, id, subtotal },
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const openCart = useCallback(() => {
    dispatch({ type: 'OPEN_CART' })
  }, [])

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' })
  }, [])

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' })
  }, [])

  // CRITICAL: Always ensure items is an array to prevent .filter() errors
  const safeItems = Array.isArray(state.items) ? state.items : []

  const itemCount = safeItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = safeItems.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * TAX_RATE
  // Shipping is calculated dynamically at checkout - using placeholder for cart display
  const shipping = safeItems.length > 0 ? ESTIMATED_SHIPPING : 0
  const total = subtotal + tax + shipping

  const value: CartContextType = {
    items: safeItems, // Always an array
    isOpen: state.isOpen,
    itemCount,
    subtotal,
    tax,
    shipping,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    isLoading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
