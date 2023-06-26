import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlarmSeverityModel} from '../../../_models/error-categories.model';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorCategoriesService} from '../../../_services/error-categories.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, first} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_ALARM_SEVERITY: AlarmSeverityModel = {
  alarmSeverityId: null,
  code: '',
  name: ''
};

@Component({
  selector: 'app-edit-alarm-severity-modal',
  templateUrl: './edit-alarm-severity-modal.component.html',
  styleUrls: ['./edit-alarm-severity-modal.component.scss']
})
export class EditAlarmSeverityModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  alarmSeverityModel: AlarmSeverityModel;

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
    this.loadAlarmSeverity();
  }

  loadAlarmSeverity() {
    if (!this.id) {
      this.alarmSeverityModel = {
        ...EMPTY_ALARM_SEVERITY
      };
      this.loadForm();
    } else {
      const sb = this.errorCategoriesService.getItemAlarmSeverityById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_ALARM_SEVERITY
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.alarmSeverityModel = res.data as AlarmSeverityModel;
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
      alarmSeverityCode: [this.alarmSeverityModel.code, Validators.compose([Validators.required, Validators.maxLength(50)])],
      alarmSeverityName: [this.alarmSeverityModel.name, Validators.compose([Validators.required, Validators.maxLength(100)])]
    });
  }

  save() {
    const vali = this.prepareAlarmSeverityModel();
    if (vali) {
      if (this.alarmSeverityModel.alarmSeverityId) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareAlarmSeverityModel() {
    if (this.alarmSeverityModel.code == null || this.alarmSeverityModel.code === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ALARM_SEVERITY.TABLE_TITLE.ALARM_SEVERITY_CODE')}), 'Error');
      return false;
    } else {
      this.alarmSeverityModel.code = this.alarmSeverityModel.code.trim();
      if (this.alarmSeverityModel.code.length > 50) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_SEVERITY.TABLE_TITLE.ALARM_SEVERITY_CODE'), max: 50}), 'Error');
        return false;
      }
      const checkCode = this.alarmSeverityModel.code.match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.ALARM_SEVERITY.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.alarmSeverityModel.name == null || this.alarmSeverityModel.name === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ALARM_SEVERITY.TABLE_TITLE.ALARM_SEVERITY_NAME')}), 'Error');
      return false;
    } else {
      this.alarmSeverityModel.name = this.alarmSeverityModel.name.trim();
      if (this.alarmSeverityModel.name.length > 100) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_SEVERITY.TABLE_TITLE.ALARM_SEVERITY_NAME'), max: 100}), 'Error');
        return false;
      }
    }
    return true;
  }

  create() {
    const sbCreate = this.errorCategoriesService.createAlarmSeverity(this.alarmSeverityModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.alarmSeverityModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.alarmSeverityModel = res.data as AlarmSeverityModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.errorCategoriesService.getListAlarmSeverity(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.errorCategoriesService.updateAlarmSeverity(this.alarmSeverityModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.alarmSeverityModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.errorCategoriesService.getListAlarmSeverity(this.query);
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
    if (this.alarmSeverityModel.code !== null
        && this.alarmSeverityModel.code !== '' && this.alarmSeverityModel.code.trim() !== '') {
      return true;
    }
    if (this.alarmSeverityModel.name !== null
        && this.alarmSeverityModel.name !== '' && this.alarmSeverityModel.name.trim() !== '') {
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
