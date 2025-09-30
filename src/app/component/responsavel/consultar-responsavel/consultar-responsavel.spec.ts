import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarResponsavel } from './consultar-responsavel';

describe('ConsultarResponsavel', () => {
  let component: ConsultarResponsavel;
  let fixture: ComponentFixture<ConsultarResponsavel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarResponsavel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarResponsavel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
