import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceMapManagementComponent } from './service-map-management.component';

describe('ServiceMapManagementComponent', () => {
  let component: ServiceMapManagementComponent;
  let fixture: ComponentFixture<ServiceMapManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceMapManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceMapManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
