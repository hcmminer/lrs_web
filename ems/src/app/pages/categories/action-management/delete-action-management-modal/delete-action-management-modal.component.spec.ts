import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteActionManagementModalComponent } from './delete-action-management-modal.component';

describe('DeleteActionManagementModalComponent', () => {
  let component: DeleteActionManagementModalComponent;
  let fixture: ComponentFixture<DeleteActionManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteActionManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteActionManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
