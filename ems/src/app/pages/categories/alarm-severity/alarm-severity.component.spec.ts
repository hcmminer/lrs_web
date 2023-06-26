import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmSeverityComponent } from './alarm-severity.component';

describe('AlarmSeverityComponent', () => {
  let component: AlarmSeverityComponent;
  let fixture: ComponentFixture<AlarmSeverityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlarmSeverityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmSeverityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
