import { CommonModule, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { BancoService } from 'src/app/services/banco/banco.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [CardComponent,DecimalPipe, CommonModule,],
  templateUrl: './bancos.component.html',
  styleUrl: './bancos.component.scss'
})
export class BancosComponent {

  bancos:any[]=[]

  constructor(private bancosService:BancoService) {
    this.obtenerBancos()
   }
  ngOnInit() {
    this.obtenerBancos()

  }

  obtenerBancos(){
    this.bancosService.obtenerBancos().subscribe({
      next: (resp: any) => {
        this.bancos = resp.data.map((banco: any) => ({
          ...banco,
          class: banco.name === 'ADDI' ? 'bg-c-blue-addi' : banco.name === 'SISTECREDITO'? 'bg-c-yellow-siste': banco.balance > 0 ? 'bg-c-green order-card' :  'bg-c-red order-card'
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

}
