import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CONFIG} from '../../../../utils/constants';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {convertStringToNGDate, getDateInput} from '../../../../utils/functions';
import {ServiceManagementService} from '../../../_services/service-management.service';
import {ServiceModel} from '../../../_models/service.model';
import {SystemManagementModel} from 'src/app/pages/_models/system-categories.model';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_SERVICE_MANAGEMENT: ServiceModel = {
  serviceId: null,
  systemId: -1,
  parentId: -1,
  serviceType: 'A',
  serviceCode: '',
  serviceName: '',
  serviceURL: '',
  ipPort: '',
  endDate: '',
  ivalidEndate: undefined,
  orderNo: null,
  numChildLevel: null,
  // description: '',
  status: 'O'
};

@Component({
  selector: 'app-edit-service-management-modal',
  templateUrl: './edit-service-management-modal.component.html',
  styleUrls: ['./edit-service-management-modal.component.scss']
})
export class EditServiceManagementModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  serviceModel: ServiceModel;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  listServiceType = CONFIG.LINE_SERVICE_TYPE;
  finishLoadComboBox = new BehaviorSubject<number>(0);
  listStatus = CONFIG.LIST_STATUS_EDIT;

  constructor(
      private modalService: NgbModal,
      public toastrService: ToastrService,
      private fb: FormBuilder,
      public modal: NgbActiveModal,
      public serviceManagementService: ServiceManagementService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.serviceManagementService.isLoading$;
    const lsb = this.serviceManagementService.getListSystemBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe(
        (res: ResponseModel) => {
          if (!res.status) {
            throw new Error(res.message);
          } else {
            this.serviceManagementService.cbxSystem.next([]);
            if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
              this.serviceManagementService.cbxSystem.next(res.data as ServiceModel[]);
            }
            this.serviceManagementService.cbxSystem.value.unshift({
              systemId: -1,
              systemName: this.translateService.instant('LIST_STATUS.ALL')
            });
            this.finishLoadComboBox.next(this.finishLoadComboBox.value + 1);
          }
        });
    let sb: any = null;
    if (this.id != undefined && this.id != null) {
      sb = this.serviceManagementService.getListServiceForParentBox({
        serviceId: this.id,
        status: 'O',
        typeRequest: 'COMBOBOX'
      }).subscribe((res: ResponseModel) => {
        if (!res.status) {
          throw new Error(res.message);
        } else {
          this.serviceManagementService.cbxService.next([]);
          if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
            this.serviceManagementService.cbxService.next(res.data as ServiceModel[]);
          }
          this.serviceManagementService.cbxService.value.unshift({
            serviceId: -1,
            serviceName: this.translateService.instant('LIST_STATUS.ALL')
          });
          this.finishLoadComboBox.next(this.finishLoadComboBox.value + 1);
        }
      });
    } else {
      sb = this.serviceManagementService.getListServiceBox({
        pageLimit: 1000,
        currentPage: 1,
        status: 'O',
        typeRequest: 'COMBOBOX'
      }).subscribe((res: ResponseModel) => {
        if (!res.status) {
          throw new Error(res.message);
        } else {
          this.serviceManagementService.cbxService.next([]);
          if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
            this.serviceManagementService.cbxService.next(res.data as ServiceModel[]);
          }
          this.serviceManagementService.cbxService.value.unshift({
            serviceId: -1,
            serviceName: this.translateService.instant('LIST_STATUS.ALL')
          });
          this.finishLoadComboBox.next(this.finishLoadComboBox.value + 1);
        }
      });
    }
    const loadCB = this.finishLoadComboBox.subscribe(value => {
      if (value === 2) {
        this.loadServiceManagement();
      }
    });
    this.subscriptions.push(sb);
    this.subscriptions.push(lsb);
    this.subscriptions.push(loadCB);
  }

  loadServiceManagement() {
    if (!this.id) {
      this.serviceModel = {
        ...EMPTY_SERVICE_MANAGEMENT
      };
      this.loadForm();
    } else {
      const sb = this.serviceManagementService.getItemServiceById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_SERVICE_MANAGEMENT
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.serviceModel = res.data as ServiceModel;
          if (this.serviceModel.parentId == undefined || this.serviceModel.parentId == null) {
            this.serviceModel.parentId = -1;
          }
          let isSystemNotExist = this.serviceManagementService.cbxSystem.value.findIndex((value: SystemManagementModel) => value.systemId == this.serviceModel.systemId) == -1;
          if (isSystemNotExist) {
            this.serviceModel.systemId = -1;
          }
          let isServiceParentNotExist = this.serviceManagementService.cbxService.value.findIndex((value: ServiceModel) => value.serviceId == this.serviceModel.parentId) == -1;
          if (isServiceParentNotExist) {
            this.serviceModel.parentId = -1;
          }
          this.serviceModel.ivalidEndate = convertStringToNGDate(this.serviceModel.endDate);
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
      serviceCode: [this.serviceModel.serviceCode, Validators.compose([Validators.required, Validators.maxLength(50)])],
      serviceName: [this.serviceModel.serviceName, Validators.compose([Validators.required, Validators.maxLength(200)])],
      serviceType: [this.serviceModel.serviceType, Validators.compose([Validators.required])],
      systemId: [this.serviceModel.systemId, Validators.compose([Validators.required])],
      parentId: [this.serviceModel.parentId],
      status: [this.serviceModel.status],
      numChildLevel: [this.serviceModel.numChildLevel, Validators.compose([Validators.maxLength(10)])],
      orderNo: [this.serviceModel.orderNo, Validators.compose([Validators.maxLength(10)])],
      ivalidEndate: [this.serviceModel.endDate, Validators.compose([Validators.nullValidator])],
      serviceURL: [this.serviceModel.serviceURL, Validators.compose([Validators.maxLength(100)])],
      ipPort: [this.serviceModel.ipPort, Validators.compose([Validators.maxLength(100)])],
      // description: [this.serviceModel.description, Validators.compose([Validators.maxLength(200)])]
    });

  }

  changeStatus(status) {
    this.serviceModel.status = (status == CONFIG.STATUS.ACTIVE) ? CONFIG.STATUS.INACTIVE : CONFIG.STATUS.ACTIVE;
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
    const vali = this.prepareServiceModel();
    if (vali) {
      if (this.serviceModel.serviceId) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareServiceModel() {
    if (this.serviceModel.parentId == null) {
      this.serviceModel.parentId = -1;
    }
    if (this.serviceModel.serviceCode == null || this.serviceModel.serviceCode.trim() === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.SERVICE_CODE')}), 'Error');
      return false;
    } else {
      this.serviceModel.serviceCode = this.serviceModel.serviceCode.trim();
      if (this.serviceModel.serviceCode.length > 50) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.SERVICE_CODE'), max: 50}), 'Error');
        return false;
      }
      const checkCode = this.serviceModel.serviceCode.trim().match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.SERVICE.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.serviceModel.serviceName.trim() == null || this.serviceModel.serviceName.trim() === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.SERVICE_NAME')}), 'Error');
      return false;
    } else {
      this.serviceModel.serviceName = this.serviceModel.serviceName.trim();
      if (this.serviceModel.serviceName.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.SERVICE_NAME'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.serviceModel.serviceType === 'A') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.SERVICE_TYPE')}), 'Error');
      return false;
    }
    if (this.serviceModel.systemId.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.SYSTEM')}), 'Error');
      return false;
    }
    if (this.serviceModel.numChildLevel && this.serviceModel.numChildLevel.toString().trim().length > 2) {
      this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
          {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.NUMBER_CHILD'), max: 2}), 'Error');
      return false;
    }
    if (this.serviceModel.orderNo && this.serviceModel.orderNo.toString().trim().length > 2) {
      this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
          {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.ORDER_NO'), max: 2}), 'Error');
      return false;
    }
    if (this.serviceModel.serviceURL && this.serviceModel.serviceURL.toString().trim().length > 100) {
      this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
          {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.ORDER_NO'), max: 100}), 'Error');
      return false;
    }
    if (this.serviceModel.ipPort) {
      if (this.serviceModel.ipPort.toString().trim().length > 100) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.ORDER_NO'), max: 100}), 'Error');
        return false;
      }
      const checkCode = this.serviceModel.ipPort.trim().match(/^\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):([0-9]{1,5})\b$/g);
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.SERVICE.MESSAGE.IP_PORT_INVALID'), 'Error');
        return false;
      } else {
        if (+this.serviceModel.ipPort.trim().split(':')[1] > 65535) {
          this.toastrService.error(this.translateService.instant('CATEGORY.SERVICE.MESSAGE.IP_PORT_INVALID'), 'Error');
          return false;
        }
      }
    }
    // if (this.serviceModel.description && this.serviceModel.description.trim().length > 200) {
    //   this.serviceModel.description = this.serviceModel.description.trim();
    //   this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
    //       {name: this.translateService.instant('COMMON.DESCRIPTION'), max: 200}), 'Error');
    //   return false;
    // }

    if (this.serviceModel.ivalidEndate != null) {
      //validate format and value
      let iValidEndDateStr = (typeof this.serviceModel.ivalidEndate == 'object') ? this.serviceModel.ivalidEndate.day + '/' + this.serviceModel.ivalidEndate.month + '/' + this.serviceModel.ivalidEndate.year : '';
      if (!this.isValidDate(iValidEndDateStr)) {
        return false;
      }
    }
    // convertDate
    const ivalidEndate = this.serviceModel.ivalidEndate;
    if (ivalidEndate !== undefined && ivalidEndate.day !== null && ivalidEndate.month !== null && ivalidEndate.year !== null) {
      this.serviceModel.endDate = getDateInput(ivalidEndate);
      let endDate = new Date(ivalidEndate.year, ivalidEndate.month - 1, ivalidEndate.day);
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (endDate.getTime() < currentDate.getTime()) {
        this.toastrService.error(this.translateService.instant('VALIDATION.BEFORE_CURRENT_DATE',
            {name: this.translateService.instant('CATEGORY.SERVICE.TABLE_TITLE.END_DATE')}), 'Error');
        return false;
      }
    }
    return true;
  }

  create() {
    const sbCreate = this.serviceManagementService.createService(this.serviceModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.serviceModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.serviceModel = res.data as ServiceModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.serviceManagementService.getListServiceManagement(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  eOnKeyUp(val) {
    if (val === '1') {
      this.serviceModel.numChildLevel = +this.serviceModel.numChildLevel.toString().replace(/\D/g, '');
      this.serviceModel.numChildLevel = this.serviceModel.numChildLevel === 0 ? null : this.serviceModel.numChildLevel;
    } else {
      this.serviceModel.orderNo = +this.serviceModel.orderNo.toString().replace(/\D/g, '');
      this.serviceModel.orderNo = this.serviceModel.orderNo === 0 ? null : this.serviceModel.orderNo;
    }
  }

  edit() {
    const sbUpdate = this.serviceManagementService.updateService(this.serviceModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.serviceModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.serviceManagementService.getListServiceManagement(this.query);
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
    if (typeof this.serviceModel.ivalidEndate == 'string') {
      let iValidEndDateStr: string = this.serviceModel.ivalidEndate;
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

  eConfirmClose() {
    if (this.checkEnterInput()) {
      this.openConfirmClose();
    } else {
      this.modal.close();
    }
  }

  checkEnterInput() {
    if (this.serviceModel.serviceCode !== null
        && this.serviceModel.serviceCode !== '' && this.serviceModel.serviceCode.trim() !== '') {
      return true;
    }
    if (this.serviceModel.serviceName !== null
        && this.serviceModel.serviceName !== '' && this.serviceModel.serviceName.trim() !== '') {
      return true;
    }
    if (this.serviceModel.serviceType.toString() !== 'A') {
      return true;
    }
    if (this.serviceModel.systemId.toString() !== '-1') {
      return true;
    }
    if (this.serviceModel.parentId.toString() !== '-1') {
      return true;
    }
    if (this.serviceModel.ivalidEndate !== null && this.serviceModel.ivalidEndate !== undefined
        && this.serviceModel.ivalidEndate.toString() !== '' && this.serviceModel.ivalidEndate.toString().trim() !== '') {
      return true;
    }
    if (this.serviceModel.serviceURL !== null
        && this.serviceModel.serviceURL !== '' && this.serviceModel.serviceURL.trim() !== '') {
      return true;
    }
    if (this.serviceModel.ipPort !== null
        && this.serviceModel.ipPort !== '' && this.serviceModel.ipPort.trim() !== '') {
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

  formatDateValue() {
    let iValidEndDateStr;
    if (typeof this.serviceModel.ivalidEndate == 'string') {
      iValidEndDateStr = this.serviceModel.ivalidEndate;
      if (/^[0-9]{8}$/.test(iValidEndDateStr)) {
        this.serviceModel.ivalidEndate = new NgbDate(parseInt(iValidEndDateStr.substr(4, 4)),
            parseInt(iValidEndDateStr.substr(2, 2)),
            parseInt(iValidEndDateStr.substr(0, 2)));
      }
    }
  }
}
