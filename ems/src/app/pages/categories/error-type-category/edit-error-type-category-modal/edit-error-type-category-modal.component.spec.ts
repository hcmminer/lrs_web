import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditErrorTypeCategoryModalComponent } from './edit-error-type-category-modal.component';

describe('EditErrorTypeCategoryModalComponent', () => {
  let component: EditErrorTypeCategoryModalComponent;
  let fixture: ComponentFixture<EditErrorTypeCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditErrorTypeCategoryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditErrorTypeCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
