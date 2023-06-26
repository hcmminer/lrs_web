import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteServiceManagementModalComponent } from './delete-service-management-modal.component';

describe('DeleteServiceManagementModalComponent', () => {
  let component: DeleteServiceManagementModalComponent;
  let fixture: ComponentFixture<DeleteServiceManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteServiceManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteServiceManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
