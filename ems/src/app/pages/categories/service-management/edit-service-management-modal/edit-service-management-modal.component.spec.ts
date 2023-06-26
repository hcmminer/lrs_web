import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditServiceManagementModalComponent } from './edit-service-management-modal.component';

describe('EditServiceManagementModalComponent', () => {
  let component: EditServiceManagementModalComponent;
  let fixture: ComponentFixture<EditServiceManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditServiceManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditServiceManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
