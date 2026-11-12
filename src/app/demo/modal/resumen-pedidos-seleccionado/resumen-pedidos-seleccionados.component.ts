import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/services/pago/pago.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { Observable, of } from 'rxjs';
import { ObligacionService } from 'src/app/services/obligacion/obligacion.service';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-resumen-pedidos-seleccionados.',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskModule],
  templateUrl: './resumen-pedidos-seleccionados.component.html',
  styleUrl: './resumen-pedidos-seleccionados.component.scss'
})
export class ResumenPedidosSeleccionadosComponent {
  closeResult: WritableSignal<string> = signal('');
  @Input() public pedidos: any;

  activeModal = inject(NgbActiveModal);
  usarImagenLocal = false;

  constructor(private pedidoService: PedidosService) {
    let date = new Date();

    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    let year = date.getFullYear();

    let formattedDate = `${day}-${month}-${year}`;


  }

  ngOnInit() {
    console.log(this.pedidos);
    this.obtenerProductos()
  }

  ngAfterViewInit() {

  }

  obtenerProductos() {
    for (let pedido of this.pedidos) {
      this.pedidoService.obtenerDetalleProducto(pedido.pedido.items[0].id).subscribe(resp => {
        console.log(resp)
        pedido.infoProducto = resp.data
      })
    }
    console.log(this.pedidos);
  }



  // solo traera pedidos sin consolidar, con fecha mayor a 01 de diciembre del 2025 y ya comprado

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  //obligaciones mensuales
  crearObjetoTipoObligacion() {
  }


  getFechaActual(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }



  async generarPDF() {
    const element = document.getElementById('printcontent');
    if (!element) return;

    try {
      // 1️⃣ Cambiar imágenes externas → locales
      this.usarImagenLocal = true;

      // 2️⃣ Esperar a que Angular renderice el cambio
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3️⃣ Forzar repaint y evitar parpadeo
      element.classList.add('generando-pdf');

      // 4️⃣ Capturar el div
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      // 5️⃣ Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('resumen_pedidos.pdf');
pdf.autoPrint();
    } catch (err) {
      console.error('Error generando PDF', err);

    } finally {
      // 6️⃣ Restaurar estado visual
      element.classList.remove('generando-pdf');
      this.usarImagenLocal = false;
    }
  }


}






