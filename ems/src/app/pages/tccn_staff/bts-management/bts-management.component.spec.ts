import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtsManagementComponent } from './bts-management.component';

describe('BtsManagementComponent', () => {
  let component: BtsManagementComponent;
  let fixture: ComponentFixture<BtsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BtsManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BtsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
