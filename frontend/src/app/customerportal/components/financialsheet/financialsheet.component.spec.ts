import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialsheetComponent } from './financialsheet.component';

describe('FinancialsheetComponent', () => {
  let component: FinancialsheetComponent;
  let fixture: ComponentFixture<FinancialsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialsheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
