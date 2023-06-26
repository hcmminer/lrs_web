import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCloseModalComponent } from './confirm-close-modal.component';

describe('ComfirmCloseModalComponent', () => {
  let component: ConfirmCloseModalComponent;
  let fixture: ComponentFixture<ConfirmCloseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmCloseModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmCloseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
