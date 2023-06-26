import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {ServiceMap, ServiceModel} from '../../../_models/service.model';
import {ServiceManagementService} from '../../../_services/service-management.service';
import {server} from 'typescript';
import {CONFIG} from '../../../../utils/constants';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_SERVICE_MAP: ServiceMap = {
  mapId: null,
  serviceId: -1,
  secondServiceId: -1,
  orderNo: null,
  status: 'A'
};

const serviceNames = {
  serviceName1: '',
  serviceName2: ''
};

@Component({
  selector: 'app-edit-service-map-management-modal',
  templateUrl: './edit-service-map-management-modal.component.html',
  styleUrls: ['./edit-service-map-management-modal.component.scss']
})
export class EditServiceMapManagementModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  serviceName = {
    ...serviceNames
  };
  isLoading$: Observable<boolean>;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  serviceMap: ServiceMap;
  listServiceMapStatus = CONFIG.LINE_SERVICE_STATUS;

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
    const getCbx = this.serviceManagementService.getListServiceBox({
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
          serviceCode: this.translateService.instant('LIST_STATUS.ALL')
        });
        this.loadServiceMap();
      }
    });
    this.subscriptions.push(getCbx);
  }

  loadServiceMap() {
    if (!this.id) {
      this.serviceMap = {
        ...EMPTY_SERVICE_MAP
      };
      this.loadForm();
    } else {
      const sb = this.serviceManagementService.getItemServiceMapById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_SERVICE_MAP
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.serviceMap = res.data as ServiceMap;
          let isService1NotExist = this.serviceManagementService.cbxService.value.findIndex((value: ServiceModel) => value.serviceId == this.serviceMap.serviceId) == -1;
          if(isService1NotExist){
            this.serviceMap.serviceId = -1;
          }
          let isService2NotExist = this.serviceManagementService.cbxService.value.findIndex((value: ServiceModel) => value.serviceId == this.serviceMap.secondServiceId) == -1;
          if(isService2NotExist){
            this.serviceMap.secondServiceId = -1;
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
    const indexType = this.serviceManagementService.cbxService.value.findIndex(value =>
        value.serviceId === this.serviceMap.serviceId
    );
    if (indexType === -1) {
      this.serviceMap.serviceId = -1;
    }
    this.formGroup = this.fb.group({
      service1: [this.serviceMap.serviceId, Validators.compose([Validators.required])],
      service2: [this.serviceMap.secondServiceId, Validators.compose([Validators.required])],
      serviceName1: [this.serviceName.serviceName1, Validators.compose([Validators.required])],
      serviceName2: [this.serviceName.serviceName2, Validators.compose([Validators.required])],
      status: [this.serviceMap.status],
      orderNo: [this.serviceMap.orderNo, Validators.compose([Validators.maxLength(10)])]
    });
    this.onChangeService(1);
    this.onChangeService(2);
  }

  onChangeService(type: number) {
    if (type === 1) {
      const index = this.serviceManagementService.cbxService.value.findIndex(
          service => service.serviceId === +this.serviceMap.serviceId);
      if (index > -1 && +this.serviceMap.serviceId !== -1) {
        this.serviceName.serviceName1 = this.serviceManagementService.cbxService.value[index].serviceName;
      } else {
        this.serviceName.serviceName1 = '';
      }
    } else {
      const index2 = this.serviceManagementService.cbxService.value.findIndex(
          service2 => +this.serviceMap.secondServiceId === service2.serviceId);
      if (index2 > -1 && +this.serviceMap.secondServiceId !== -1) {
        this.serviceName.serviceName2 = this.serviceManagementService.cbxService.value[index2].serviceName;
      } else {
        this.serviceName.serviceName2 = '';
      }
    }
    if (+this.serviceMap.serviceId !== -1 && +this.serviceMap.secondServiceId !== -1 && this.serviceMap.serviceId.toString() === this.serviceMap.secondServiceId.toString()) {
      this.toastrService.error(this.translateService.instant('CATEGORY.SERVICE_MAP.VALIDATE.DUPLICATE'));
      return false;
    }
  }

  save() {
    const vali = this.prepareServiceMapModel();
    if (vali) {
      if (this.serviceMap.mapId) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareServiceMapModel() {
    if (this.serviceMap.serviceId.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SERVICE_MAP.TABLE_TITLE.SERVICE_CODE_1')}), 'Error');
      return false;
    }
    if (this.serviceMap.secondServiceId.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.SERVICE_MAP.TABLE_TITLE.SERVICE_CODE_2')}), 'Error');
      return false;
    }
    if (this.serviceMap.status.toString() === 'A') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('COMMON.STATUS.TITLE')}), 'Error');
      return false;
    }
    if (this.serviceMap.orderNo && this.serviceMap.orderNo.toString().trim().length > 2) {
      this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
          {name: this.translateService.instant('CATEGORY.SERVICE_MAP.TABLE_TITLE.ORDER_NO'), max: 2}), 'Error');
      return false;
    }
    if (this.serviceMap.serviceId.toString() === this.serviceMap.secondServiceId.toString()) {
      this.toastrService.error(this.translateService.instant('CATEGORY.SERVICE_MAP.VALIDATE.DUPLICATE'));
      return false;
    }
    return true;
  }

  create() {
    const sbCreate = this.serviceManagementService.createServiceMap(this.serviceMap).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.serviceMap);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.serviceMap = res.data as ServiceMap;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.serviceManagementService.getListServiceMap(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.serviceManagementService.updateServiceMap(this.serviceMap).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.serviceMap);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.serviceManagementService.getListServiceMap(this.query);
        this.modal.close();
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbUpdate);
  }

  eOnKeyUp() {
    this.serviceMap.orderNo = +this.serviceMap.orderNo.toString().replace(/\D/g, '');
    this.serviceMap.orderNo = this.serviceMap.orderNo === 0 ? null : this.serviceMap.orderNo;
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
    if (this.serviceMap.serviceId.toString() !== '-1') {
      return true;
    }
    if (this.serviceMap.secondServiceId.toString() !== '-1') {
      return true;
    }
    if (this.serviceMap.status.toString() !== 'A') {
      return true;
    }
    if (this.serviceMap.orderNo !== null
        && this.serviceMap.orderNo.toString() !== '' && this.serviceMap.orderNo.toString().trim() !== '') {
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
