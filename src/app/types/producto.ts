/* eslint-disable linebreak-style */

export type Producto = {
    name?: string,
    description: string | null,
    price: number | null,
    discount: number | null,
    reference: string | null,
    quantity: number | null,
    id: number | null,
    productKey: string | null,
    unit: string | null,
    tax: any[] | null,
    total: number
}
