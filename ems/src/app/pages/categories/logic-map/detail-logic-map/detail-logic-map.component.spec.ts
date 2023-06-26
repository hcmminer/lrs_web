import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailLogicMapComponent } from './detail-logic-map.component';

describe('DetailLogicMapComponent', () => {
  let component: DetailLogicMapComponent;
  let fixture: ComponentFixture<DetailLogicMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailLogicMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailLogicMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
