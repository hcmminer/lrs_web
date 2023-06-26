import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {ActionCategoriesService} from '../../../_services/action-categories.service';
import {ActionCategoriesModel} from '../../../_models/action-categories.model';
import {CONFIG} from '../../../../utils/constants';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_ACTION_CATEGORY: ActionCategoriesModel = {
  categoryId: null,
  categoryCode: '',
  categoryName: '',
  status: 'O',
  description: ''
};

@Component({
  selector: 'app-edit-action-category-modal',
  templateUrl: './edit-action-category-modal.component.html',
  styleUrls: ['./edit-action-category-modal.component.scss']
})
export class EditActionCategoryModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  actionCategoriesModel: ActionCategoriesModel;
  listStatus = CONFIG.LIST_STATUS_EDIT;

  constructor(
      private modalService: NgbModal,
      public toastrService: ToastrService,
      private fb: FormBuilder,
      public modal: NgbActiveModal,
      public actionCategoriesService: ActionCategoriesService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.actionCategoriesService.isLoading$;
    this.loadActionCategory();
  }

  loadActionCategory() {
    if (!this.id) {
      this.actionCategoriesModel = {
        ...EMPTY_ACTION_CATEGORY
      };
      this.loadForm();
    } else {
      const sb = this.actionCategoriesService.getItemActionCategoryById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_ACTION_CATEGORY
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.actionCategoriesModel = res.data as ActionCategoriesModel;
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
      actionCategoryCode: [this.actionCategoriesModel.categoryCode, Validators.compose([Validators.required, Validators.maxLength(50)])],
      actionCategoryName: [this.actionCategoriesModel.categoryName, Validators.compose([Validators.required, Validators.maxLength(100)])],
      description: [this.actionCategoriesModel.description, Validators.compose([Validators.maxLength(200)])],
      status: [this.actionCategoriesModel.status]
    });
  }

  changeStatus(status) {
    this.actionCategoriesModel.status = (status == CONFIG.STATUS.ACTIVE) ? CONFIG.STATUS.INACTIVE : CONFIG.STATUS.ACTIVE;
  }

  save() {
    const vali = this.prepareActionCategoryModel();
    if (vali) {
      if (this.actionCategoriesModel.categoryId) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareActionCategoryModel() {
    if (this.actionCategoriesModel.categoryCode == null || this.actionCategoriesModel.categoryCode === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ACTION_CATEGORY.TABLE_TITLE.ACTION_CATEGORY_CODE')}), 'Error');
      return false;
    } else {
      this.actionCategoriesModel.categoryCode = this.actionCategoriesModel.categoryCode.trim();
      if (this.actionCategoriesModel.categoryCode.length > 50) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ACTION_CATEGORY.TABLE_TITLE.ACTION_CATEGORY_CODE'), max: 50}), 'Error');
        return false;
      }
      const checkCode = this.actionCategoriesModel.categoryCode.match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.ACTION_CATEGORY.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.actionCategoriesModel.categoryName == null || this.actionCategoriesModel.categoryName === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ACTION_CATEGORY.TABLE_TITLE.ACTION_CATEGORY_NAME')}), 'Error');
      return false;
    } else {
      this.actionCategoriesModel.categoryName = this.actionCategoriesModel.categoryName.trim();
      if (this.actionCategoriesModel.categoryName.length > 100) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ACTION_CATEGORY.TABLE_TITLE.ACTION_CATEGORY_NAME'), max: 100}), 'Error');
        return false;
      }
    }
    // if (this.actionCategoriesModel.description  != null && this.actionCategoriesModel.description  !== ''){
    //   this.actionCategoriesModel.description = this.actionCategoriesModel.description.trim();
    //   if (this.actionCategoriesModel.description.length > 200){
    //     this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
    //         { name: this.translateService.instant('COMMON.DESCRIPTION'), max: 200 }), 'Error');
    //     return false;
    //   }
    // }
    return true;
  }

  create() {
    const sbCreate = this.actionCategoriesService.createActionCategory(this.actionCategoriesModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.actionCategoriesModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.actionCategoriesModel = res.data as ActionCategoriesModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.actionCategoriesService.getListActionCategory(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.actionCategoriesService.updateActionCategory(this.actionCategoriesModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.actionCategoriesModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.actionCategoriesService.getListActionCategory(this.query);
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
    if (this.actionCategoriesModel.categoryCode !== null
        && this.actionCategoriesModel.categoryCode !== '' && this.actionCategoriesModel.categoryCode.trim() !== '') {
      return true;
    }
    if (this.actionCategoriesModel.categoryName !== null
        && this.actionCategoriesModel.categoryName !== '' && this.actionCategoriesModel.categoryName.trim() !== '') {
      return true;
    }
    return false;
  }

  openConfirmClose() {
    const modalRef = this.modalService.open(ConfirmCloseModalComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.closeSuccess.subscribe((status) => {
      if (status) {
        this.modal.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
