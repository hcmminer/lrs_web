import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDashboardOnlineComponent } from './report-dashboard-online.component';

describe('DashboardOnlineComponent', () => {
  let component: ReportDashboardOnlineComponent;
  let fixture: ComponentFixture<ReportDashboardOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportDashboardOnlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDashboardOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
