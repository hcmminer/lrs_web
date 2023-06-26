import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CONFIG} from '../../../../utils/constants';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {ActionCategoriesModel, ActionModel} from '../../../_models/action-categories.model';
import {ActionCategoriesService} from '../../../_services/action-categories.service';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_ACTION_MANAGEMENT: ActionModel = {
  actionId: null,
  actionCode: '',
  actionName: '',
  categoryId: -1,
  actionType: 'A',
  referActionCode: '',
  description: '',
  status: 'O',
};

@Component({
  selector: 'app-edit-action-management-modal',
  templateUrl: './edit-action-management-modal.component.html',
  styleUrls: ['./edit-action-management-modal.component.scss']
})
export class EditActionManagementModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  actionModel: ActionModel;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  listActionType = CONFIG.LINE_ACTION_TYPE;
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
    const getCbx = this.actionCategoriesService.getListCategoryBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.actionCategoriesService.cbxCategory.next([]);
        if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
          this.actionCategoriesService.cbxCategory.next(res.data as ActionCategoriesModel[]);
        }
        this.actionCategoriesService.cbxCategory.value.unshift({
          categoryId: -1,
          categoryName: this.translateService.instant('LIST_STATUS.ALL')
        });
        this.loadActionManagement();
      }
    });
    this.subscriptions.push(getCbx);
  }

  loadActionManagement() {
    if (!this.id) {
      this.actionModel = {
        ...EMPTY_ACTION_MANAGEMENT
      };
      this.loadForm();
    } else {
      const sb = this.actionCategoriesService.getItemActionManagementById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_ACTION_MANAGEMENT
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.actionModel = res.data as ActionModel;
          let isActionCategoryNotExist = this.actionCategoriesService.cbxCategory.value.findIndex((value: ActionCategoriesModel) => value.categoryId == this.actionModel.categoryId) == -1;
          if (isActionCategoryNotExist) {
            this.actionModel.categoryId = -1;
          }
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
      actionCode: [this.actionModel.actionCode, Validators.compose([Validators.required, Validators.maxLength(50)])],
      actionName: [this.actionModel.actionName, Validators.compose([Validators.required, Validators.maxLength(200)])],
      categoryId: [this.actionModel.categoryId, Validators.compose([Validators.required])],
      actionType: [this.actionModel.actionType, Validators.compose([Validators.required])],
      referActionCode: [this.actionModel.referActionCode, Validators.compose([Validators.required, Validators.maxLength(200)])],
      description: [this.actionModel.description, Validators.compose([Validators.maxLength(200)])],
      status: [this.actionModel.status],
    });
  }

  changeStatus(status) {
    this.actionModel.status = (status === CONFIG.STATUS.ACTIVE) ? CONFIG.STATUS.INACTIVE : CONFIG.STATUS.ACTIVE;
  }

  save() {
    const vali = this.prepareActionModel();
    if (vali) {
      if (this.actionModel.actionId) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareActionModel() {
    if (this.actionModel.actionCode == null || this.actionModel.actionCode === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.ACTION_CODE')}), 'Error');
      return false;
    } else {
      this.actionModel.actionCode = this.actionModel.actionCode.trim();
      if (this.actionModel.actionCode.length > 50) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.ACTION_CODE'), max: 50}), 'Error');
        return false;
      }
      const checkCode = this.actionModel.actionCode.match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.ACTION.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.actionModel.actionName == null || this.actionModel.actionName === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.ACTION_NAME')}), 'Error');
      return false;
    } else {
      this.actionModel.actionName = this.actionModel.actionName.trim();
      if (this.actionModel.actionName.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.ACTION_NAME'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.actionModel.categoryId.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.ACTION_CATEGORY')}), 'Error');
      return false;
    }
    if (this.actionModel.actionType === 'A') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.ACTION_TYPE')}), 'Error');
      return false;
    }
    if (this.actionModel.referActionCode == null || this.actionModel.referActionCode === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.REFER_ACTION_CODE')}), 'Error');
      return false;
    } else {
      if (this.actionModel.referActionCode.trim().length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.REFER_ACTION_CODE'), max: 200}), 'Error');
        return false;
      }
    }
    // if (this.actionModel.referActionCode != null && this.actionModel.referActionCode !== '') {
    //   this.actionModel.referActionCode = this.actionModel.referActionCode.trim();
    //   if (this.actionModel.referActionCode.length > 200) {
    //     this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
    //         {name: this.translateService.instant('CATEGORY.ACTION.TABLE_TITLE.REFER_ACTION_CODE'), max: 200}), 'Error');
    //     return false;
    //   }
    // }
    // if (this.actionModel.description != null && this.actionModel.description !== '') {
    //   this.actionModel.description = this.actionModel.description.trim();
    //   if (this.actionModel.description.length > 200) {
    //     this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
    //         {name: this.translateService.instant('COMMON.DESCRIPTION'), max: 200}), 'Error');
    //     return false;
    //   }
    // }
    return true;
  }

  create() {
    const sbCreate = this.actionCategoriesService.createActionManagement(this.actionModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.actionModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.actionModel = res.data as ActionModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.actionCategoriesService.getListActionManagement(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.actionCategoriesService.updateActionManagement(this.actionModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.actionModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.actionCategoriesService.getListActionManagement(this.query);
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
    if (this.actionModel.actionCode !== null
        && this.actionModel.actionCode !== '' && this.actionModel.actionCode.trim() !== '') {
      return true;
    }
    if (this.actionModel.actionName !== null
        && this.actionModel.actionName !== '' && this.actionModel.actionName.trim() !== '') {
      return true;
    }
    if (this.actionModel.referActionCode !== null
        && this.actionModel.referActionCode !== '' && this.actionModel.referActionCode.trim() !== '') {
      return true;
    }
    if (this.actionModel.categoryId.toString() !== '-1') {
      return true;
    }
    if (this.actionModel.actionType !== 'A') {
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
