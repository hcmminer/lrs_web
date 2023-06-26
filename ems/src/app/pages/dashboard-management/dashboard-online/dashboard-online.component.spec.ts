import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOnlineComponent } from './dashboard-online.component';

describe('DashboardOnlineComponent', () => {
  let component: DashboardOnlineComponent;
  let fixture: ComponentFixture<DashboardOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardOnlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
