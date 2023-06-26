import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAlarmColorModalComponent } from './update-alarm-color-modal.component';

describe('UpdateAlarmColorModalComponent', () => {
  let component: UpdateAlarmColorModalComponent;
  let fixture: ComponentFixture<UpdateAlarmColorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateAlarmColorModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateAlarmColorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
