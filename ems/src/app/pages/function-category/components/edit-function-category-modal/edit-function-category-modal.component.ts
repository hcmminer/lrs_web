import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FunctionCategoryModel} from '../../../_models/function-category.model';
import {catchError, first, tap} from 'rxjs/operators';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FunctionCategoriesService} from '../../../_services/function-categories.service';
import {NgbActiveModal, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {ResponseModel} from '../../../_models/response.model';
import {ToastrService} from 'ngx-toastr';
import {convertStringToNGDate, getDateInput} from '../../../../utils/functions';
import { CONFIG } from '../../../../utils/constants';

const EMPTY_FUNCTION_CATEGORY: FunctionCategoryModel = {
  categoryId: null,
  categoryCode: '',
  categoryName: '',
  validToDate: '',
  validTo: undefined,
  validFromDate: '',
  validFrom: undefined,
  description: null,
  parentId: null,
  status: 'O',
};

@Component({
  selector: 'app-edit-function-category-modal',
  templateUrl: './edit-function-category-modal.component.html',
  styleUrls: ['./edit-function-category-modal.component.scss'],
})
export class EditFunctionCategoryModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  functionCategory: FunctionCategoryModel;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    private functionCategoriesService: FunctionCategoriesService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public modal: NgbActiveModal
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.functionCategoriesService.isLoading$;
    this.loadFunctionCategory();
  }

  loadFunctionCategory() {
    if (!this.id) {
      this.functionCategory = {
        ...EMPTY_FUNCTION_CATEGORY
      };
      this.loadForm();
    } else {
      const sb = this.functionCategoriesService.getItemById(this.id).pipe(
        first(),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of({
            ...EMPTY_FUNCTION_CATEGORY
          });
        })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.functionCategory = res.data as FunctionCategoryModel;
          this.functionCategory.validFrom = convertStringToNGDate(this.functionCategory.validFromDate);
          this.functionCategory.validTo = convertStringToNGDate(this.functionCategory.validToDate);
        } else if (res.message) {
          this.toastrService.error(res.message, 'Error');
        }
        this.loadForm();
      });
      this.subscriptions.push(sb);
    }
  }

  loadForm() {
    this.formGroup = this.fb.group({
      categoryCode: [this.functionCategory.categoryCode,
        Validators.compose([Validators.required, Validators.maxLength(50)])],
      categoryName: [this.functionCategory.categoryName,
        Validators.compose([Validators.required, Validators.maxLength(200)])],
      validFrom: [this.functionCategory.validFromDate, Validators.compose([Validators.nullValidator])],
      validTo: [this.functionCategory.validToDate, Validators.compose([Validators.nullValidator])],
      description: [this.functionCategory.description],
      status: [this.functionCategory.status]
    });
  }

  save() {
    this.prepareFunctionCategory();
    if (this.functionCategory.categoryId) {
      this.edit();
    } else {
      this.create();
    }
  }

  edit() {
    const sbUpdate = this.functionCategoriesService.update(this.functionCategory).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.functionCategory);
      }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(res.message, 'Success');
        this.functionCategoriesService.getList(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbUpdate);
  }

  create() {
    const sbCreate = this.functionCategoriesService.create(this.functionCategory).pipe(
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.functionCategory);
      }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.functionCategory = res.data as FunctionCategoryModel;
        this.modal.close();
        this.toastrService.success(res.message, 'Success');
        this.functionCategoriesService.getList(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  changeStatus(status) {
    this.functionCategory.status = (status == CONFIG.STATUS.ACTIVE) ? CONFIG.STATUS.INACTIVE : CONFIG.STATUS.ACTIVE;
  }

  private prepareFunctionCategory() {
    const validFrom = this.functionCategory.validFrom;
    const validTo = this.functionCategory.validTo;
    this.functionCategory.validFromDate = getDateInput(validFrom);
    this.functionCategory.validToDate = getDateInput(validTo);
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
