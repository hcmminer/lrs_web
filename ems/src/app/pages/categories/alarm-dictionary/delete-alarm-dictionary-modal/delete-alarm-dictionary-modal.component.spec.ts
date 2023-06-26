import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAlarmDictionaryModalComponent } from './delete-alarm-dictionary-modal.component';

describe('DeleteAlarmDictionaryModalComponent', () => {
  let component: DeleteAlarmDictionaryModalComponent;
  let fixture: ComponentFixture<DeleteAlarmDictionaryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteAlarmDictionaryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAlarmDictionaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
