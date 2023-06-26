import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmDictionaryComponent } from './alarm-dictionary.component';

describe('AlarmDictionaryComponent', () => {
  let component: AlarmDictionaryComponent;
  let fixture: ComponentFixture<AlarmDictionaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlarmDictionaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmDictionaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
