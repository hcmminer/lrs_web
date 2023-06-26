import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditServiceMapManagementModalComponent } from './edit-service-map-management-modal.component';

describe('EditServiceMapManagementModalComponent', () => {
  let component: EditServiceMapManagementModalComponent;
  let fixture: ComponentFixture<EditServiceMapManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditServiceMapManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditServiceMapManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
