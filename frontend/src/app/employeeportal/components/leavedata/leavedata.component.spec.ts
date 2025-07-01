import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveDataComponent } from './leavedata.component';

describe('LeavedataComponent', () => {
  let component: LeaveDataComponent;
  let fixture: ComponentFixture<LeaveDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveDataComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LeaveDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
