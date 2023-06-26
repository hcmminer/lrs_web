import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioManagementComponent } from './audio-management.component';

describe('AudioManagementComponent', () => {
  let component: AudioManagementComponent;
  let fixture: ComponentFixture<AudioManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
