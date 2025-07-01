import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorinvoicesComponent } from './vendorinvoices.component';

describe('VendorinvoicesComponent', () => {
  let component: VendorinvoicesComponent;
  let fixture: ComponentFixture<VendorinvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorinvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorinvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
