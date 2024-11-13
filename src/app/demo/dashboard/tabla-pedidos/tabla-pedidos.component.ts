// angular import
import { Component, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Factura } from 'src/app/types/factura';
import { Compra } from 'src/app/types/compra';

interface ProgressBarItem {
  value: string;
  color: string;
  percentage: number;
}

@Component({
  selector: 'app-product-sale',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './tabla-pedidos.component.html',
  styleUrls: ['./tabla-pedidos.component.scss']
})
export class ProductSaleComponent implements AfterViewInit {
  @Input() pedidos: any[] | undefined;
  @Input() compras: any[] | undefined;
  @Input() pendiente: boolean | undefined;

  estadosCompraPedidos=[  {color:"bg-c-blue",name:"En camino a MED"},{color:"bg-c-blue",name:"En camino USA"}, {color:"bg-c-purple",name:"Entregado a USA"} ,{color:"bg-c-yellow",name:"Espera de despacho"},{color:"bg-c-green",name:"Entregado cliente"}]

  elementosCargados = false
  constructor(private cdr: ChangeDetectorRef) {
  }
  ngAfterViewInit() {
    if (this.pendiente) {
      this.pedidos = this.pedidos?.filter(pedido => (!pedido.compra))
    } else {
      if(this.pedidos) {
       this.pedidos = this.pedidos.map((pedido) => {
         return {...pedido,compra:this.obtenerCompraPedido(pedido.id),} 
        })
      }
    }
    this.elementosCargados = true
    this.cdr.detectChanges();

  }
  // public method
  pedidosLbl = [
    {
      title: 'Fecha pedido'
    },
    {
      title: 'Producto',
      icon: 'icon-help-circle'
    },
    {
      title: '$ venta',
      icon: 'icon-help-circle'
    },
    {
      title: 'Cliente',
      icon: 'icon-help-circle'
    },
    {
      title: '$ compra',
      icon: 'icon-help-circle'
    },

    {
      title: 'F.compra',
      icon: 'icon-help-circle'
    },
    {
      title: 'F. Entrega',
      icon: 'icon-help-circle'
    },
    {
      title: 'Abono',
      icon: 'icon-help-circle'
    },
    {
      title: 'Saldo',
      icon: 'icon-help-circle'
    },
    {
      title: 'Estado Compra',
      icon: 'icon-help-circle'
    },
    {
      title: 'Estado Venta',
      icon: 'icon-help-circle'
    }
  ];

  progressBar: ProgressBarItem[] = [
    {
      value: '786',
      color: 'danger',
      percentage: 60
    },
    {
      value: '485',
      color: 'primary',
      percentage: 50
    },
    {
      value: '769',
      color: 'warning',
      percentage: 70
    },
    {
      value: '45,3%',
      color: 'success',
      percentage: 60
    },
    {
      value: '6,7%',
      color: 'info',
      percentage: 30
    },
    {
      value: '8,56',
      color: 'danger',
      percentage: 40
    },
    {
      value: '10:55',
      color: 'warning',
      percentage: 70
    },
    {
      value: '33.8%',
      color: 'success',
      percentage: 40
    }
  ];

  progressBar2: ProgressBarItem[] = [
    {
      value: '786',
      color: 'danger',
      percentage: 65
    },
    {
      value: '523',
      color: 'primary',
      percentage: 80
    },
    {
      value: '736',
      color: 'warning',
      percentage: 80
    },
    {
      value: '78,3%',
      color: 'success',
      percentage: 70
    },
    {
      value: '6,6%',
      color: 'info',
      percentage: 70
    },
    {
      value: '7,56',
      color: 'danger',
      percentage: 44
    },
    {
      value: '4:30',
      color: 'warning',
      percentage: 68
    },
    {
      value: '76.8%',
      color: 'success',
      percentage: 90
    }
  ];

  progressBar3: ProgressBarItem[] = [
    {
      value: '624',
      color: 'danger',
      percentage: 45
    },
    {
      value: '436',
      color: 'primary',
      percentage: 55
    },
    {
      value: '756',
      color: 'warning',
      percentage: 95
    },
    {
      value: '78,3%',
      color: 'success',
      percentage: 38
    },
    {
      value: '6,4%',
      color: 'info',
      percentage: 38
    },
    {
      value: '9,45',
      color: 'danger',
      percentage: 38
    },
    {
      value: '9:05',
      color: 'warning',
      percentage: 38
    },
    {
      value: '8.63%',
      color: 'success',
      percentage: 38
    }
  ];

  progressBar4: ProgressBarItem[] = [
    {
      value: '423',
      color: 'danger',
      percentage: 54
    },
    {
      value: '123',
      color: 'primary',
      percentage: 70
    },
    {
      value: '756',
      color: 'warning',
      percentage: 75
    },
    {
      value: '78,6%',
      color: 'success',
      percentage: 60
    },
    {
      value: '45,6%',
      color: 'info',
      percentage: 90
    },
    {
      value: '6,85',
      color: 'danger',
      percentage: 38
    },
    {
      value: '7:45',
      color: 'warning',
      percentage: 40
    },
    {
      value: '33.8%',
      color: 'success',
      percentage: 80
    }
  ];

  progressBar5: ProgressBarItem[] = [
    {
      value: '465',
      color: 'danger',
      percentage: 66
    },
    {
      value: '463',
      color: 'primary',
      percentage: 66
    },
    {
      value: '456',
      color: 'warning',
      percentage: 38
    },
    {
      value: '68,6%',
      color: 'success',
      percentage: 38
    },
    {
      value: '76,6%',
      color: 'info',
      percentage: 32
    },
    {
      value: '7,56',
      color: 'danger',
      percentage: 70
    },
    {
      value: '8:45',
      color: 'warning',
      percentage: 71
    },
    {
      value: '39.8%',
      color: 'success',
      percentage: 38
    }
  ];

  progressBar6: ProgressBarItem[] = [
    {
      value: '786',
      color: 'danger',
      percentage: 43
    },
    {
      value: '485',
      color: 'primary',
      percentage: 70
    },
    {
      value: '769',
      color: 'warning',
      percentage: 69
    },
    {
      value: '45,3%',
      color: 'success',
      percentage: 90
    },
    {
      value: '6,7%',
      color: 'info',
      percentage: 80
    },
    {
      value: '8,56',
      color: 'danger',
      percentage: 38
    },
    {
      value: '10:55',
      color: 'warning',
      percentage: 55
    },
    {
      value: '33.8%',
      color: 'success',
      percentage: 70
    }
  ];

  progressBar7: ProgressBarItem[] = [
    {
      value: '786',
      color: 'danger',
      percentage: 61
    },
    {
      value: '523',
      color: 'primary',
      percentage: 45
    },
    {
      value: '736',
      color: 'warning',
      percentage: 70
    },
    {
      value: '78,3%',
      color: 'success',
      percentage: 60
    },
    {
      value: '6,6%',
      color: 'info',
      percentage: 38
    },
    {
      value: '7,56',
      color: 'danger',
      percentage: 40
    },
    {
      value: '4:30',
      color: 'warning',
      percentage: 70
    },
    {
      value: '76.8%',
      color: 'success',
      percentage: 40
    }
  ];

  obtenerFechaEntregaEstimada(date: string) {
    const fechaEstimada = new Date(date)
    fechaEstimada.setDate(fechaEstimada.getDate() + 15)

    return fechaEstimada
  }

  obtenerCompraPedido(idPedido: any) {
    return this.compras?.find(x => x.pedido === "facturas/" + idPedido)
  }

  obtenerColor(tracking:string){
    const color=this.estadosCompraPedidos.find(x=>x.name===tracking)?.color
    if(color){
      return  color
    }else{
     return "bg-c-red"
    }
  }

  

}
