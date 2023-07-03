import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VillageManagementComponent } from './village-management.component';

describe('VillageManagementComponent', () => {
  let component: VillageManagementComponent;
  let fixture: ComponentFixture<VillageManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VillageManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VillageManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
