import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorfinancialsheetComponent } from './vendorfinancialsheet.component';

describe('VendorfinancialsheetComponent', () => {
  let component: VendorfinancialsheetComponent;
  let fixture: ComponentFixture<VendorfinancialsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorfinancialsheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorfinancialsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
