import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorTypeCategoryComponent } from './error-type-category.component';

describe('ErrorTypeCategoryComponent', () => {
  let component: ErrorTypeCategoryComponent;
  let fixture: ComponentFixture<ErrorTypeCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorTypeCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorTypeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
