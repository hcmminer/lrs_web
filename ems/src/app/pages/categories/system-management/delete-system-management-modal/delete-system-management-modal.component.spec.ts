import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSystemManagementModalComponent } from './delete-system-management-modal.component';

describe('DeleteSystemManagementModalComponent', () => {
  let component: DeleteSystemManagementModalComponent;
  let fixture: ComponentFixture<DeleteSystemManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteSystemManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSystemManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
