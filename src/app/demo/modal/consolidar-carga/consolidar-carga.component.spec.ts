import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidarCargaComponent } from './consolidar-carga.component';

describe('AgregarGastoComponent', () => {
  let component: ConsolidarCargaComponent;
  let fixture: ComponentFixture<ConsolidarCargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsolidarCargaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsolidarCargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
