import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAlarmSeverityModalComponent } from './edit-alarm-severity-modal.component';

describe('EditAlarmSeverityModalComponent', () => {
  let component: EditAlarmSeverityModalComponent;
  let fixture: ComponentFixture<EditAlarmSeverityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAlarmSeverityModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAlarmSeverityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
