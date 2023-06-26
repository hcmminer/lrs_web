import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditActionManagementModalComponent } from './edit-action-management-modal.component';

describe('EditActionManagementModalComponent', () => {
  let component: EditActionManagementModalComponent;
  let fixture: ComponentFixture<EditActionManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditActionManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditActionManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
