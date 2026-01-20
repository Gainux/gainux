import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/types'

export interface CartItem extends Product {
    quantity: number
}

interface CartStore {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { items } = get()
                const existingItem = items.find((item) => item.id === product.id)

                if (existingItem) {
                    // If software is usually single-license, maybe prevent adding multiple?
                    // For now, let's treat it as quantity increase (e.g. multiple licenses)
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    })
                } else {
                    set({ items: [...items, { ...product, quantity: 1 }] })
                }
            },
            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                })
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
