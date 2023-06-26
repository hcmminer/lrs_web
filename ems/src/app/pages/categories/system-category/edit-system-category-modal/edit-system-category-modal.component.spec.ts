import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSystemCategoryModalComponent } from './edit-system-category-modal.component';

describe('EditSystemCategoryModalComponent', () => {
  let component: EditSystemCategoryModalComponent;
  let fixture: ComponentFixture<EditSystemCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSystemCategoryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSystemCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
