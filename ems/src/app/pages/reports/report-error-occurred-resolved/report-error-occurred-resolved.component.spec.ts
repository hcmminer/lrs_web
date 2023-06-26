import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportErrorOccurredResolvedComponent } from './report-error-occurred-resolved.component';

describe('DashboardOnlineComponent', () => {
  let component: ReportErrorOccurredResolvedComponent;
  let fixture: ComponentFixture<ReportErrorOccurredResolvedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportErrorOccurredResolvedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportErrorOccurredResolvedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
