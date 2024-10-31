/* eslint-disable linebreak-style */
import {Direccion} from "./direccion";

export type cliente = {
    id: string,
    name: string,
    identification: string,
    phonePrimary: string | null,
    phoneSecondary: string | null,
    fax: string | null,
    mobile: string | null,
    email: string | null,
    address: Direccion | null,
    kindOfPerson?: string | null,
    regime: string | null,
    identificationObject: any
}
