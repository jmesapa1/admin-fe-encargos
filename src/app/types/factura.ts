/* eslint-disable linebreak-style */
import {cliente} from "./cliente";
import {Pago} from "./pago";
import {Producto} from "./producto";

export type Factura={
        id:string,
        date:string,
        dueDate:string
        datetime:string,
        observations:string | null,
        anotation:string | null,
        termsConditions:string,
        status:string,
        client: cliente,
        numberTemplate: any,
        subtotal:number,
        discount:number,
        tax:number,
        total:number,
        totalPaid:number,
        balance:number,
        decimalPrecision:string,
        warehouse: any,
        term:string,
        type:string,
        paymentForm:string,
        paymentMethod?:string,
        barCodeContent:string,
        seller:string | null,
        priceList? : any,
        payments?: Pago[],
        items: Producto[],
        costCenter:string | null,
        printingTemplate: any
}


export type FacturaExcluida = Omit<Factura, "client" | "items" | "payments" >
