// Angular Import
import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbdSortableHeader } from './../../directives/sort-table.directive';

// project import
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CardComponent } from './components/card/card.component';
import { DataFilterPipe } from './filter/data-filter.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';

// third party
import { NgScrollbarModule } from 'ngx-scrollbar';
import 'hammerjs';
import 'mousetrap';

// bootstrap import
import { NgbDropdownModule, NgbNavModule, NgbModule, NgbDropdownConfig, NgbDatepickerModule, NgbCollapseModule, NgbAccordionModule, NgbHighlight, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DetallePedidoComponent } from 'src/app/demo/modal/detalle-pedido/detalle-pedido.component';
import { AgregarGastoComponent } from 'src/app/demo/modal/agregar-gasto/agregar-gasto.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    BreadcrumbComponent,
    NgbDropdownModule,
    NgbNavModule,
    NgbModule,
    NgScrollbarModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    NgbAccordionModule,
    AsyncPipe,
    NgbHighlight,
    NgbPaginationModule,
    DecimalPipe,
    NgbdSortableHeader,
    DetallePedidoComponent,
    AgregarGastoComponent,
    CurrencyMaskModule

  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    BreadcrumbComponent,
    DataFilterPipe,
    SpinnerComponent,
    NgbModule,
    NgbDropdownModule,
    NgbNavModule,
    NgScrollbarModule,
    NgbDropdownModule,
    NgbDatepickerModule,
    NgbCollapseModule,
    NgbAccordionModule,


  ],
  providers:[NgbDropdownConfig,NgbDatepickerModule,NgbAccordionModule,DecimalPipe],
  declarations: [DataFilterPipe, SpinnerComponent]
})
export class SharedModule {}
