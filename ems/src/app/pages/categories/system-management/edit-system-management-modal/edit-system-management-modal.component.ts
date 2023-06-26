import {SystemCategoriesModel} from './../../../_models/system-categories.model';
import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {TranslateService} from '@ngx-translate/core';
import {SystemManagementModel} from '../../../_models/system-categories.model';
import {SystemCategoriesService} from '../../../_services/system-categories.service';
import {CONFIG} from '../../../../utils/constants';
import {convertStringToNGDate, getDateInput} from '../../../../utils/functions';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_SYSTEM_MANAGEMENT: SystemManagementModel = {
  systemId: null,
  systemCategoryId: -1,
  parentId: -1,
  collectType: -1,
  systemCode: '',
  systemName: '',
  description: '',
  endDate: '',
  ivalidEndate: undefined,
  orderNo: null,
  numChildLevel: null,
  status: 'O'
};

@Component({
  selector: 'app-edit-system-management-modal',
  templateUrl: './edit-system-management-modal.component.html',
  styleUrls: ['./edit-system-management-modal.component.scss']
})
export class EditSystemManagementModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  systemManagementModel: SystemManagementModel;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  listCollectType = CONFIG.LINE_COLLECT_TYPE;
  @ViewChild('systemCategory') sysCategory: ElementRef;
  listStatus = CONFIG.LIST_STATUS_EDIT;
  endDateErrorMsg: string = '';

  constructor(
      private modalService: NgbModal,
      public toastrService: ToastrService,
      private fb: FormBuilder,
      public modal: NgbActiveModal,
      public systemCategoriesService: SystemCategoriesService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.systemCategoriesService.isLoading$;
    let requestSystemCategory;
    let requestSystem;
    requestSystemCategory = this.systemCategoriesService.getListSystemCategoryBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (this.id != null && this.id != undefined) {
        requestSystem = this.systemCategoriesService.getListSystemManagementForParentBox({
          systemId: this.id,
          status: 'O',
          typeRequest: 'COMBOBOX'
        }).subscribe((res: ResponseModel) => {
          this.loadSystemManagement();
        });
      } else {
        requestSystem = this.systemCategoriesService.getListSystemManagementBox({
          pageLimit: 1000,
          currentPage: 1,
          status: 'O',
          typeRequest: 'COMBOBOX'
        }).subscribe((res: ResponseModel) => {
          this.loadSystemManagement();
        });
      }
    });
    this.subscriptions.push(requestSystemCategory);
    this.subscriptions.push(requestSystem);
  }

  loadSystemManagement() {
    if (!this.id) {
      this.systemManagementModel = {
        ...EMPTY_SYSTEM_MANAGEMENT
      };
      this.loadForm();
    } else {
      const sb = this.systemCategoriesService.getItemSystemManagementById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_SYSTEM_MANAGEMENT
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.systemManagementModel = res.data as SystemManagementModel;
          if (this.systemManagementModel.parentId == undefined || this.systemManagementModel.parentId == null) {
            this.systemManagementModel.parentId = -1;
          }
          let isSysCatNotExist = this.systemCategoriesService.cbxSystemCategory.value.findIndex((value: SystemCategoriesModel) => value.id == this.systemManagementModel.systemCategoryId) == -1;
          if (isSysCatNotExist) {
            this.systemManagementModel.systemCategoryId = -1;
          }
          let isSysParentNotExist = this.systemCategoriesService.cbxSystem.value.findIndex((value: SystemManagementModel) => value.systemId == this.systemManagementModel.parentId) == -1;
          if (isSysParentNotExist) {
            this.systemManagementModel.parentId = -1;
          }
          if (this.systemManagementModel.endDate != null) {
            this.systemManagementModel.ivalidEndate = convertStringToNGDate(this.systemManagementModel.endDate);
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
      systemCode: [this.systemManagementModel.systemCode,
        Validators.compose([Validators.required, Validators.maxLength(50)])],
      systemName: [this.systemManagementModel.systemName, Validators.compose([Validators.required, Validators.maxLength(200)])],
      systemCategory: [this.systemManagementModel.systemCategoryId, Validators.compose([Validators.required])],
      collectType: [this.systemManagementModel.collectType, Validators.compose([Validators.required])],
      systemParent: [this.systemManagementModel.parentId],
      status: [this.systemManagementModel.status],
      numChildLevel: [this.systemManagementModel.numChildLevel, Validators.compose([Validators.maxLength(10)])],
      orderNo: [this.systemManagementModel.orderNo, Validators.compose([Validators.maxLength(10)])],
      ivalidEndate: [this.systemManagementModel.endDate, Validators.compose([Validators.nullValidator])],
      // ivalidEndate: '',
      description: [this.systemManagementModel.description, Validators.compose([Validators.maxLength(200)])]
    });
  }

  eOnKeyUp(val) {
    if (val === '1') {
      this.systemManagementModel.numChildLevel = +this.systemManagementModel.numChildLevel.toString().replace(/\D/g, '');
      // tslint:disable-next-line:max-line-length
      this.systemManagementModel.numChildLevel = this.systemManagementModel.numChildLevel === 0 ? null : this.systemManagementModel.numChildLevel;
    } else {
      this.systemManagementModel.orderNo = +this.systemManagementModel.orderNo.toString().replace(/\D/g, '');
      this.systemManagementModel.orderNo = this.systemManagementModel.orderNo === 0 ? null : this.systemManagementModel.orderNo;
    }
  }

  eChangeParent() {
    if (this.systemManagementModel.parentId.toString() === '-1') {
      this.sysCategory.nativeElement.disabled = false;
      this.systemManagementModel.systemCategoryId = -1;
    } else {
      const indexSystemCategory = this.systemCategoriesService.cbxSystem.value.findIndex(value =>
          value.systemId.toString() === this.systemManagementModel.parentId.toString()
      );
      if (indexSystemCategory !== -1) {
        this.systemManagementModel.systemCategoryId = this.systemCategoriesService.cbxSystem.value[indexSystemCategory].systemCategoryId;
        this.sysCategory.nativeElement.disabled = true;
      }
    }
  }

  changeStatus(status) {
    this.systemManagementModel.status = (status == CONFIG.STATUS.ACTIVE) ? CONFIG.STATUS.INACTIVE : CONFIG.STATUS.ACTIVE;
  }

  isValidDate(dateString): boolean {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRE_FORMAT',
          {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.END_DATE'), format: 'dd/mm/yyyy'}), 'Error');
      return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split('/');
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
      this.toastrService.error(this.translateService.instant('VALIDATION.EXPIRATION_DATE_INVALID'), 'Error');
      return false;
    }

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    if (day > 0 && day <= monthLength[month - 1]) {
      return true;
    } else {
      this.toastrService.error(this.translateService.instant('VALIDATION.EXPIRATION_DATE_INVALID'), 'Error');
      return false;
    }
  };

  save() {
    const vali = this.prepareSystemModel();
    if (vali) {
      if (this.systemManagementModel.systemId) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareSystemModel() {
    if (this.systemManagementModel.systemCode == null || this.systemManagementModel.systemCode === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.SYSTEM_CODE')}), 'Error');
      return false;
    } else {
      this.systemManagementModel.systemCode = this.systemManagementModel.systemCode.trim();
      if (this.systemManagementModel.systemCode.length > 50) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.SYSTEM_CODE'), max: 50}), 'Error');
        return false;
      }
      const checkCode = this.systemManagementModel.systemCode.match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.SYSTEM.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.systemManagementModel.systemName == null || this.systemManagementModel.systemName === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.SYSTEM_NAME')}), 'Error');
      return false;
    } else {
      this.systemManagementModel.systemName = this.systemManagementModel.systemName.trim();
      if (this.systemManagementModel.systemName.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.SYSTEM_NAME'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.systemManagementModel.systemCategoryId.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.SYSTEM_CATEGORY')}), 'Error');
      return false;
    }
    if (this.systemManagementModel.collectType.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.COLLECT_TYPE')}), 'Error');
      return false;
    }
    if (this.systemManagementModel.numChildLevel && this.systemManagementModel.numChildLevel.toString().trim().length > 2) {
      this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
          {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.NUMBER_CHILD'), max: 2}), 'Error');
      return false;
    }
    if (this.systemManagementModel.orderNo && this.systemManagementModel.orderNo.toString().trim().length > 2) {
      this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
          {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.ORDER_NO'), max: 2}), 'Error');
      return false;
    }
    if (this.systemManagementModel.description != null && this.systemManagementModel.description !== '') {
      this.systemManagementModel.description = this.systemManagementModel.description.trim();
      if (this.systemManagementModel.description.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('COMMON.DESCRIPTION'), max: 200}), 'Error');
        return false;
      }
    }

    if (this.systemManagementModel.ivalidEndate != null) {
      //validate format and value
      let iValidEndDateStr = (typeof this.systemManagementModel.ivalidEndate == 'object') ? this.systemManagementModel.ivalidEndate.day + '/' + this.systemManagementModel.ivalidEndate.month + '/' + this.systemManagementModel.ivalidEndate.year : '';
      if (!this.isValidDate(iValidEndDateStr)) {
        return false;
      }
    }
    // convertDate
    const invalidEnacted = this.systemManagementModel.ivalidEndate;
    if (invalidEnacted !== undefined && invalidEnacted.day !== null && invalidEnacted.month !== null && invalidEnacted.year !== null) {
      this.systemManagementModel.endDate = getDateInput(invalidEnacted);
      let endDate = new Date(invalidEnacted.year, invalidEnacted.month - 1, invalidEnacted.day);
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (endDate.getTime() < currentDate.getTime()) {
        this.toastrService.error(this.translateService.instant('VALIDATION.BEFORE_CURRENT_DATE',
            {name: this.translateService.instant('CATEGORY.SYSTEM.TABLE_TITLE.END_DATE')}), 'Error');
        return false;
      }
    }
    return true;
  }

  create() {
    const sbCreate = this.systemCategoriesService.createSystemManagement(this.systemManagementModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.systemManagementModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.systemManagementModel = res.data as SystemManagementModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.systemCategoriesService.getListSystemManagement(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    console.log(this.systemManagementModel);
    if (this.systemManagementModel.ivalidEndate == null) {
      delete this.systemManagementModel.ivalidEndate;
    }
    const sbUpdate = this.systemCategoriesService.updateSystemManagement(this.systemManagementModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.systemManagementModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.systemCategoriesService.getListSystemManagement(this.query);
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

  isControlInvalidDate(): boolean {
    if (typeof this.systemManagementModel.ivalidEndate == 'string') {
      let iValidEndDateStr: string = this.systemManagementModel.ivalidEndate;
      if (/^[0-9]{8}$/.test(iValidEndDateStr)) {
        iValidEndDateStr = [iValidEndDateStr.substr(0, 2),
          iValidEndDateStr.substr(2, 2),
          iValidEndDateStr.substr(4, 4)].join('/');
        return !this.isValidDateForm(iValidEndDateStr);
      } else {
        return true;
      }
    }
    return false;
  }

  isValidDateForm(dateString): boolean {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split('/');
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
      return false;
    }

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    if (day > 0 && day <= monthLength[month - 1]) {
      return true;
    } else {
      return false;
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  eConfirmClose() {
    if (this.checkEnterInput()) {
      this.openConfirmClose();
    } else {
      this.modal.close();
    }
  }

  checkEnterInput() {
    if (this.systemManagementModel.systemCode !== null
        && this.systemManagementModel.systemCode !== '' && this.systemManagementModel.systemCode.trim() !== '') {
      return true;
    }
    if (this.systemManagementModel.systemName !== null
        && this.systemManagementModel.systemName !== '' && this.systemManagementModel.systemName.trim() !== '') {
      return true;
    }
    if (this.systemManagementModel.systemCategoryId.toString() !== '-1') {
      return true;
    }
    if (this.systemManagementModel.collectType.toString() !== '-1') {
      return true;
    }
    if (this.systemManagementModel.parentId.toString() !== '-1') {
      return true;
    }
    if (this.systemManagementModel.numChildLevel !== null
        && this.systemManagementModel.numChildLevel.toString() !== ''
        && this.systemManagementModel.numChildLevel.toString().trim() !== '') {
      return true;
    }
    if (this.systemManagementModel.orderNo !== null
        && this.systemManagementModel.orderNo.toString() !== '' && this.systemManagementModel.orderNo.toString().trim() !== '') {
      return true;
    }
    if (this.systemManagementModel.ivalidEndate !== null && this.systemManagementModel.ivalidEndate !== undefined
        && this.systemManagementModel.ivalidEndate.toString() !== '' && this.systemManagementModel.ivalidEndate.toString().trim() !== '') {
      return true;
    }
    if (this.systemManagementModel.description !== null
        && this.systemManagementModel.description !== '' && this.systemManagementModel.description.trim() !== '') {
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

  formatDateValue() {
    let iValidEndDateStr;
    if (typeof this.systemManagementModel.ivalidEndate == 'string') {
      iValidEndDateStr = this.systemManagementModel.ivalidEndate;
      if (/^[0-9]{8}$/.test(iValidEndDateStr)) {
        this.systemManagementModel.ivalidEndate = new NgbDate(parseInt(iValidEndDateStr.substr(4, 4)),
            parseInt(iValidEndDateStr.substr(2, 2)),
            parseInt(iValidEndDateStr.substr(0, 2)));
      }
    }
  }
}
