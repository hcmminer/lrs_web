import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAlarmAudioModalComponent } from './update-alarm-audio-modal.component';

describe('UpdateAlarmAudioModalComponent', () => {
  let component: UpdateAlarmAudioModalComponent;
  let fixture: ComponentFixture<UpdateAlarmAudioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateAlarmAudioModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateAlarmAudioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
