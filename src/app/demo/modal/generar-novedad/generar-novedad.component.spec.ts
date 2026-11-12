import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarNovedadComponent } from './generar-novedad.component';

describe('GenerarNovedadComponent', () => {
  let component: GenerarNovedadComponent;
  let fixture: ComponentFixture<GenerarNovedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarNovedadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarNovedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
