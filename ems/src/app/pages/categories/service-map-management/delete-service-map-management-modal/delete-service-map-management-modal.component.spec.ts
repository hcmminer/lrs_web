import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteServiceMapManagementModalComponent } from './delete-service-map-management-modal.component';

describe('DeleteServiceMapManagementModalComponent', () => {
  let component: DeleteServiceMapManagementModalComponent;
  let fixture: ComponentFixture<DeleteServiceMapManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteServiceMapManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteServiceMapManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
