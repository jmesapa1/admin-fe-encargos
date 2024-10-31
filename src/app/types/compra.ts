/* eslint-disable linebreak-style */

import {Pago} from "./pago";
import {Proovedor} from "./proovedor";

export type Compra = {
    id:string,
    date:string,
    dueDate: string,
    observations:string | null,
    termsConditions:string,
    status:string,
    provider:Proovedor,
    numberTemplate:any,
    total:number,
    totalPaid:number,
    balance:number,
    decimalPrecision:number,
    calculationScale:number
    warehouse:any,
    type:string,
    payments:Pago[],
    purchases:any
}
