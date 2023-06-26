import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSystemCategoryModalComponent } from './delete-system-category-modal.component';

describe('DeleteSystemCategoryModalComponent', () => {
  let component: DeleteSystemCategoryModalComponent;
  let fixture: ComponentFixture<DeleteSystemCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteSystemCategoryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSystemCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
