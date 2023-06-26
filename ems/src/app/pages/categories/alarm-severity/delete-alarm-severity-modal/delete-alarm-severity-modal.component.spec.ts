import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAlarmSeverityModalComponent } from './delete-alarm-severity-modal.component';

describe('DeleteAlarmSeverityModalComponent', () => {
  let component: DeleteAlarmSeverityModalComponent;
  let fixture: ComponentFixture<DeleteAlarmSeverityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteAlarmSeverityModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAlarmSeverityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
