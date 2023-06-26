import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFileAudioModalComponent } from './choose-file-audio-modal.component';

describe('ChooseFileAudioModalComponent', () => {
  let component: ChooseFileAudioModalComponent;
  let fixture: ComponentFixture<ChooseFileAudioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseFileAudioModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseFileAudioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
