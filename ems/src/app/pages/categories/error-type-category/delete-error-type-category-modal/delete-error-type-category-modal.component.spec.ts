import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteErrorTypeCategoryModalComponent } from './delete-error-type-category-modal.component';

describe('DeleteErrorTypeCategoryModalComponent', () => {
  let component: DeleteErrorTypeCategoryModalComponent;
  let fixture: ComponentFixture<DeleteErrorTypeCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteErrorTypeCategoryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteErrorTypeCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
