import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAlarmDictionaryModalComponent } from './edit-alarm-dictionary-modal.component';

describe('EditAlarmDictionaryModalComponent', () => {
  let component: EditAlarmDictionaryModalComponent;
  let fixture: ComponentFixture<EditAlarmDictionaryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAlarmDictionaryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAlarmDictionaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
