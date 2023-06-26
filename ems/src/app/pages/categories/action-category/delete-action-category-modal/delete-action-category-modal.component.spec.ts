import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteActionCategoryModalComponent } from './delete-action-category-modal.component';

describe('DeleteActionCategoryModalComponent', () => {
  let component: DeleteActionCategoryModalComponent;
  let fixture: ComponentFixture<DeleteActionCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteActionCategoryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteActionCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
