import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendornavbarComponent } from './vendornavbar.component';

describe('VendornavbarComponent', () => {
  let component: VendornavbarComponent;
  let fixture: ComponentFixture<VendornavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendornavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendornavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
