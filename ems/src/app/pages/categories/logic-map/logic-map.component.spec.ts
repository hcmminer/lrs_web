import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicMapComponent } from './logic-map.component';

describe('LogicMapComponent', () => {
  let component: LogicMapComponent;
  let fixture: ComponentFixture<LogicMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogicMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
