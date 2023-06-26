import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSystemErrorComponent } from './report-system-error.component';

describe('DashboardOnlineComponent', () => {
  let component: ReportSystemErrorComponent;
  let fixture: ComponentFixture<ReportSystemErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSystemErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSystemErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
