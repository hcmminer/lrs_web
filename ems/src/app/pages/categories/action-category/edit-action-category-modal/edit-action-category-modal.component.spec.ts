import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditActionCategoryModalComponent } from './edit-action-category-modal.component';

describe('EditActionCategoryModalComponent', () => {
  let component: EditActionCategoryModalComponent;
  let fixture: ComponentFixture<EditActionCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditActionCategoryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditActionCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
