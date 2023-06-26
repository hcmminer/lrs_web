import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSystemManagementModalComponent } from './edit-system-management-modal.component';

describe('EditSystemManagementModalComponent', () => {
  let component: EditSystemManagementModalComponent;
  let fixture: ComponentFixture<EditSystemManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSystemManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSystemManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
