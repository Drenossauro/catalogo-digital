export interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date | null
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string | null
  imageUrl: string | null
  active: boolean
  createdAt: Date | null
}

export interface CartItem {
  product: Product
  quantity: number
}
