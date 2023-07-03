import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAddEditVillageComponent } from './form-add-edit-village.component';

describe('FormAddEditVillageComponent', () => {
  let component: FormAddEditVillageComponent;
  let fixture: ComponentFixture<FormAddEditVillageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormAddEditVillageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAddEditVillageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
