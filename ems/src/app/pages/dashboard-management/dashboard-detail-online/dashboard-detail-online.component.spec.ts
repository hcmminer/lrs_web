import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDetailOnlineComponent } from './dashboard-detail-online.component';

describe('DashboardDetailOnlineComponent', () => {
  let component: DashboardDetailOnlineComponent;
  let fixture: ComponentFixture<DashboardDetailOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardDetailOnlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDetailOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
