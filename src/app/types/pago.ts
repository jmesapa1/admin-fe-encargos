/* eslint-disable linebreak-style */

export type Pago = {
    id: string,
    prefix:number | null,
    number:string,
    date:string,
    amount:number,
    paymentMethod?:string,
    observations:string | null,
    anotation:string | null,
    status:string
}
