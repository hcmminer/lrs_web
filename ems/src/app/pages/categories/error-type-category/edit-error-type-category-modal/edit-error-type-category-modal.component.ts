import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ErrorCategoriesModel} from '../../../_models/error-categories.model';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorCategoriesService} from '../../../_services/error-categories.service';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {TranslateService} from '@ngx-translate/core';
import { CONFIG } from '../../../../utils/constants';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_ERROR_TYPE_CATEGORY: ErrorCategoriesModel = {
  id: null,
  code: '',
  name: '',
  status: 'O',
  description: ''
};

@Component({
  selector: 'app-edit-error-type-category-modal',
  templateUrl: './edit-error-type-category-modal.component.html',
  styleUrls: ['./edit-error-type-category-modal.component.scss']
})
export class EditErrorTypeCategoryModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  errorCategoriesModel: ErrorCategoriesModel;
  listStatus = CONFIG.LIST_STATUS_EDIT;

  constructor(
      private modalService: NgbModal,
      public toastrService: ToastrService,
      private fb: FormBuilder,
      public modal: NgbActiveModal,
      private errorCategoriesService: ErrorCategoriesService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.errorCategoriesService.isLoading$;
    this.loadErrorTypeCategory();
  }

  loadErrorTypeCategory() {
    if (!this.id) {
      this.errorCategoriesModel = {
        ...EMPTY_ERROR_TYPE_CATEGORY
      };
      this.loadForm();
    }else {
      const sb = this.errorCategoriesService.getItemErrorTypeById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_ERROR_TYPE_CATEGORY
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.errorCategoriesModel = res.data as ErrorCategoriesModel;
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
      errorTypeCode: [this.errorCategoriesModel.code, Validators.compose([Validators.required, Validators.maxLength(50)])],
      errorTypeName: [this.errorCategoriesModel.name, Validators.compose([Validators.required, Validators.maxLength(200)])],
      description: [this.errorCategoriesModel.description, Validators.compose([Validators.maxLength(200)])],
      status: [this.errorCategoriesModel.status]
    });
  }

  changeStatus(status) {
    this.errorCategoriesModel.status = (status == CONFIG.STATUS.ACTIVE) ? CONFIG.STATUS.INACTIVE : CONFIG.STATUS.ACTIVE;
  }

  save() {
    const vali = this.prepareErrorCategoriesModel();
    if (vali){
      if (this.errorCategoriesModel.id) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareErrorCategoriesModel(){
    if (this.errorCategoriesModel.code == null || this.errorCategoriesModel.code === ''){
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          { name: this.translateService.instant('CATEGORY.ERROR_TYPE_CATEGORY.TABLE_TITLE.ERROR_TYPE_CODE') }), 'Error');
      return false;
    }else{
      this.errorCategoriesModel.code = this.errorCategoriesModel.code.trim();
      if (this.errorCategoriesModel.code.length > 50){
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            { name: this.translateService.instant('CATEGORY.ERROR_TYPE_CATEGORY.TABLE_TITLE.ERROR_TYPE_CODE'), max: 50 }), 'Error');
        return false;
      }
      const checkCode = this.errorCategoriesModel.code.match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.ERROR_TYPE_CATEGORY.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.errorCategoriesModel.name == null || this.errorCategoriesModel.name === ''){
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          { name: this.translateService.instant('CATEGORY.ERROR_TYPE_CATEGORY.TABLE_TITLE.ERROR_TYPE_NAME') }), 'Error');
      return false;
    }else{
      this.errorCategoriesModel.name = this.errorCategoriesModel.name.trim();
      if (this.errorCategoriesModel.name.length > 200){
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            { name: this.translateService.instant('CATEGORY.ERROR_TYPE_CATEGORY.TABLE_TITLE.ERROR_TYPE_NAME'), max: 200 }), 'Error');
        return false;
      }
    }
    if (this.errorCategoriesModel.description  != null && this.errorCategoriesModel.description  !== ''){
      this.errorCategoriesModel.description = this.errorCategoriesModel.description.trim();
      if (this.errorCategoriesModel.description.length > 200){
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            { name: this.translateService.instant('COMMON.DESCRIPTION'), max: 200 }), 'Error');
        return false;
      }
    }
    return true;
  }
  create() {
    const sbCreate = this.errorCategoriesService.createErrorType(this.errorCategoriesModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.errorCategoriesModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.errorCategoriesModel = res.data as ErrorCategoriesModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.errorCategoriesService.getListErrorType(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.errorCategoriesService.updateErrorType(this.errorCategoriesModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.errorCategoriesModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.errorCategoriesService.getListErrorType(this.query);
        this.modal.close();
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbUpdate);
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty);
  }

  eConfirmClose() {
    if (this.checkEnterInput()) {
      this.openConfirmClose();
    } else {
      this.modal.close();
    }
  }

  checkEnterInput() {
    if (this.errorCategoriesModel.code !== null
        && this.errorCategoriesModel.code !== '' && this.errorCategoriesModel.code.trim() !== '') {
      return true;
    }
    if (this.errorCategoriesModel.name !== null
        && this.errorCategoriesModel.name !== '' && this.errorCategoriesModel.name.trim() !== '') {
      return true;
    }
    if (this.errorCategoriesModel.description !== null
        && this.errorCategoriesModel.description !== '' && this.errorCategoriesModel.description.trim() !== '') {
      return true;
    }
    return false;
  }

  openConfirmClose() {
    const modalRef = this.modalService.open(ConfirmCloseModalComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.closeSuccess.subscribe((status) => {
      if (status){
        this.modal.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
