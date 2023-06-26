import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {TranslateService} from '@ngx-translate/core';
import {SystemCategoriesModel} from '../../../_models/system-categories.model';
import {SystemCategoriesService} from '../../../_services/system-categories.service';
import { CONFIG } from '../../../../utils/constants';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_SYSTEM_CATEGORY: SystemCategoriesModel = {
  id: null,
  code: '',
  name: '',
  status: 'O',
  description: ''
};

@Component({
  selector: 'app-edit-system-category-modal',
  templateUrl: './edit-system-category-modal.component.html',
  styleUrls: ['./edit-system-category-modal.component.scss']
})
export class EditSystemCategoryModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  systemCategoriesModel: SystemCategoriesModel;
  listStatus = CONFIG.LIST_STATUS_EDIT;

  constructor(
      private modalService: NgbModal,
      public toastrService: ToastrService,
      private fb: FormBuilder,
      public modal: NgbActiveModal,
      private systemCategoriesService: SystemCategoriesService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.systemCategoriesService.isLoading$;
    this.loadSystemCategory();
  }

  loadSystemCategory() {
    if (!this.id) {
      this.systemCategoriesModel = {
        ...EMPTY_SYSTEM_CATEGORY
      };
      this.loadForm();
    } else {
      const sb = this.systemCategoriesService.getItemSystemCategoryById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_SYSTEM_CATEGORY
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.systemCategoriesModel = res.data as SystemCategoriesModel;
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
      systemCategoryCode: [this.systemCategoriesModel.code, Validators.compose([Validators.required, Validators.maxLength(50)])],
      systemCategoryName: [this.systemCategoriesModel.name, Validators.compose([Validators.required, Validators.maxLength(100)])],
      description: [this.systemCategoriesModel.description, Validators.compose([Validators.maxLength(200)])],
      status: [this.systemCategoriesModel.status]
    });
  }

  changeStatus(status) {
    this.systemCategoriesModel.status = (status == CONFIG.STATUS.ACTIVE) ? CONFIG.STATUS.INACTIVE : CONFIG.STATUS.ACTIVE;
  }

  save() {
    const vali = this.prepareSystemCategoryModel();
    if (vali) {
      if (this.systemCategoriesModel.id) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareSystemCategoryModel() {
    if (this.systemCategoriesModel.code == null || this.systemCategoriesModel.code === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SYSTEM_CATEGORY.TABLE_TITLE.SYSTEM_CATEGORY_CODE')}), 'Error');
      return false;
    } else {
      this.systemCategoriesModel.code = this.systemCategoriesModel.code.trim();
      if (this.systemCategoriesModel.code.length > 50) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.SYSTEM_CATEGORY.TABLE_TITLE.SYSTEM_CATEGORY_CODE'), max: 50}), 'Error');
        return false;
      }
      const checkCode = this.systemCategoriesModel.code.match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.SYSTEM_CATEGORY.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.systemCategoriesModel.name == null || this.systemCategoriesModel.name === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SYSTEM_CATEGORY.TABLE_TITLE.SYSTEM_CATEGORY_NAME')}), 'Error');
      return false;
    } else {
      this.systemCategoriesModel.name = this.systemCategoriesModel.name.trim();
      if (this.systemCategoriesModel.name.length > 100) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.SYSTEM_CATEGORY.TABLE_TITLE.SYSTEM_CATEGORY_NAME'), max: 100}), 'Error');
        return false;
      }
    }
    if (this.systemCategoriesModel.description  != null && this.systemCategoriesModel.description  !== ''){
      this.systemCategoriesModel.description = this.systemCategoriesModel.description.trim();
      if (this.systemCategoriesModel.description.length > 200){
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            { name: this.translateService.instant('COMMON.DESCRIPTION'), max: 200 }), 'Error');
        return false;
      }
    }
    return true;
  }

  create() {
    const sbCreate = this.systemCategoriesService.createSystemCategory(this.systemCategoriesModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.systemCategoriesModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.systemCategoriesModel = res.data as SystemCategoriesModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.systemCategoriesService.getListSystemCategory(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.systemCategoriesService.updateSystemCategory(this.systemCategoriesModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.systemCategoriesModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.systemCategoriesService.getListSystemCategory(this.query);
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
    if (this.systemCategoriesModel.code !== null
        && this.systemCategoriesModel.code !== '' && this.systemCategoriesModel.code.trim() !== '') {
      return true;
    }
    if (this.systemCategoriesModel.name !== null
        && this.systemCategoriesModel.name !== '' && this.systemCategoriesModel.name.trim() !== '') {
      return true;
    }
    if (this.systemCategoriesModel.description !== null
        && this.systemCategoriesModel.description !== '' && this.systemCategoriesModel.description.trim() !== '') {
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
