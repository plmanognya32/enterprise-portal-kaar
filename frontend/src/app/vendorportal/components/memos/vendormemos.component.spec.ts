import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendormemosComponent } from './vendormemos.component';

describe('VendormemosComponent', () => {
  let component: VendormemosComponent;
  let fixture: ComponentFixture<VendormemosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendormemosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendormemosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
