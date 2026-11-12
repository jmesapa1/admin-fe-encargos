import { AuthService } from 'src/app/auth/auth.service';
// Angular Import
import { Component, inject } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

// bootstrap
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ComprasService } from 'src/app/services/compras/compras.service';
import { PagoService } from 'src/app/services/pago/pago.service';
import { PedidosService } from 'src/app/services/pedidos/pedidos.service';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
    ])
  ]
})
export class NavRightComponent {
  private readonly auth = inject(AuthService);
  signingOut = false;
  logoutError = '';
  async logout(): Promise<void> {
    if (this.signingOut) return;
    this.signingOut = true;
    this.logoutError = '';
    try { await this.auth.signOut(); }
    catch { this.logoutError = 'No se pudo completar el cierre de sesión.'; }
    finally { this.signingOut = false; }
  }

  // public props
  visibleUserList: boolean;
  chatMessage: boolean;
  friendId!: number;

  // constructor
  constructor(public pedidoService: PedidosService, public pagoService: PagoService, public comprasService:ComprasService) {
    this.visibleUserList = false;
    this.chatMessage = false;
  }

  // public method
  onChatToggle(friendID: number) {
    this.friendId = friendID;
    this.chatMessage = !this.chatMessage;
  }

  refrescarInfo(){
    this.pedidoService.obtenerPedidos()
    this.comprasService.obtenerCompras()
    this.pagoService.obtenerPagos()

  }
}
