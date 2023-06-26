import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmGroupComponent } from './alarm-group.component';

describe('AlarmGroupComponent', () => {
  let component: AlarmGroupComponent;
  let fixture: ComponentFixture<AlarmGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlarmGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
