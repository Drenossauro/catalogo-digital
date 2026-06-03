export interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date | null
}

export interface ProductVariantOption {
  value: string
  price_modifier: number
}

export interface ProductVariant {
  id: string
  productId: string
  label: string
  options: ProductVariantOption[]
  required: boolean
  position: number
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
  variants?: ProductVariant[]
}

export interface CartItem {
  product: Product
  quantity: number
  variantLabel?: string  // ex: "Tamanho: M / Cor: Azul"
}
