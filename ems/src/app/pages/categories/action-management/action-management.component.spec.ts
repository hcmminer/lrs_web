import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionManagementComponent } from './action-management.component';

describe('ActionManagementComponent', () => {
  let component: ActionManagementComponent;
  let fixture: ComponentFixture<ActionManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
