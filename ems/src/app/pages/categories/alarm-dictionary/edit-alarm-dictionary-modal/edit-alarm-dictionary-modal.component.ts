import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CONFIG} from '../../../../utils/constants';
import {ToastrService} from 'ngx-toastr';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {ResponseModel} from '../../../_models/response.model';
import {catchError, first} from 'rxjs/operators';
import {AlarmDictionaryModel, AlarmSeverityModel, ErrorCategoriesModel} from '../../../_models/error-categories.model';
import {ErrorCategoriesService} from '../../../_services/error-categories.service';
import {ActionCategoriesModel, ActionModel} from '../../../_models/action-categories.model';
import {ConfirmCloseModalComponent} from '../../confirm-close-modal/confirm-close-modal.component';

const EMPTY_ALARM_DICTIONARY: AlarmDictionaryModel = {
  id: null,
  objectId: -1,
  objectType: 'T',
  alarmCode: '',
  alarmName: '',
  alarmSeverityId: -1,
  alarmTypeCode: '-1',
  alarmDesc: '',
  alarmPattern: '',
  probableCause: '',
  suggestAction: '',
  suggestSolotion: ''
};

@Component({
  selector: 'app-edit-alarm-dictionary-modal',
  templateUrl: './edit-alarm-dictionary-modal.component.html',
  styleUrls: ['./edit-alarm-dictionary-modal.component.scss']
})
export class EditAlarmDictionaryModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() query: {};
  isLoading$: Observable<boolean>;
  alarmDictionaryModel: AlarmDictionaryModel;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  listObjectType = CONFIG.LINE_OBJECT_TYPE;
  finishLoadComboBox = new BehaviorSubject<number>(0);
  LoadObject = new BehaviorSubject<boolean>(false);

  constructor(
      private modalService: NgbModal,
      public toastrService: ToastrService,
      private fb: FormBuilder,
      public modal: NgbActiveModal,
      public translateService: TranslateService,
      public errorCategoriesService: ErrorCategoriesService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.errorCategoriesService.isLoading$;
    this.errorCategoriesService.getListAlarmDictionary(this.query);
    const getCbxAlarmType = this.errorCategoriesService.getListAlarmTypeBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.errorCategoriesService.cbxAlarmType.next([]);
        if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
          this.errorCategoriesService.cbxAlarmType.next(res.data as ErrorCategoriesModel[]);
        }
        this.errorCategoriesService.cbxAlarmType.value.unshift({
          code: '-1',
          name: this.translateService.instant('LIST_STATUS.ALL')
        });
        this.finishLoadComboBox.next(this.finishLoadComboBox.value + 1);
      }
    });
    const getCbxAlarmSeverity = this.errorCategoriesService.getListAlarmSeverityBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.errorCategoriesService.cbxAlarmSeverity.next([]);
        if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
          this.errorCategoriesService.cbxAlarmSeverity.next(res.data as AlarmSeverityModel[]);
        }
        this.errorCategoriesService.cbxAlarmSeverity.value.unshift({
          alarmSeverityId: -1,
          name: this.translateService.instant('LIST_STATUS.ALL')
        });
        this.finishLoadComboBox.next(this.finishLoadComboBox.value + 1);
      }
    });
    this.errorCategoriesService.cbxObject.next([{
      id: -1,
      name: this.translateService.instant('LIST_STATUS.ALL')
    }]);
    const loadCB = this.finishLoadComboBox.subscribe(value => {
      if (value === 2) {
        this.loadActionManagement();
      }
    });
    this.subscriptions.push(getCbxAlarmType);
    this.subscriptions.push(getCbxAlarmSeverity);
    this.subscriptions.push(loadCB);
  }

  loadActionManagement() {
    if (!this.id) {
      this.alarmDictionaryModel = {
        ...EMPTY_ALARM_DICTIONARY
      };
      this.loadForm();
    } else {
      const sb = this.errorCategoriesService.getItemAlarmDictionaryById(this.id).pipe(
          first(),
          catchError((errorMessage) => {
            this.modal.dismiss(errorMessage);
            return of({
              ...EMPTY_ALARM_DICTIONARY
            });
          })
      ).subscribe((res: ResponseModel) => {
        if (res.status) {
          this.alarmDictionaryModel = res.data as AlarmDictionaryModel;
        } else if (res.message) {
          this.toastrService.error(res.message, 'Error');
        }
        this.eChangeObjectType();
        const endLoadObject = this.LoadObject.subscribe(value => {
          if (value === true) {
            this.loadForm();
          }
        });
        this.subscriptions.push(endLoadObject);
      });
      this.subscriptions.push(sb);
    }
  }

  eChangeObjectType() {
    if (this.alarmDictionaryModel.objectType === 'C') {
      const getCbxActionCategoryBox = this.errorCategoriesService.getListActionCategoryBox({
        pageLimit: 1000,
        currentPage: 1,
        status: 'O',
        typeRequest: 'COMBOBOX'
      }).subscribe((res: ResponseModel) => {
        if (!res.status) {
          throw new Error(res.message);
        } else {
          if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
            this.errorCategoriesService.actionCategoryList.next(res.data as ActionCategoriesModel[]);
          }
          this.errorCategoriesService.cbxObject.next([]);
          if (this.errorCategoriesService.actionCategoryList.value != null) {
            const list = [];
            this.errorCategoriesService.actionCategoryList.value.forEach(value => {
              list.push({id: value.categoryId, name: value.categoryName});
            });
            this.errorCategoriesService.cbxObject.next(list);
          }
          this.errorCategoriesService.cbxObject.value.unshift({
            id: -1,
            name: this.translateService.instant('LIST_STATUS.ALL')
          });
          this.LoadObject.next(true);
        }
      });
      this.subscriptions.push(getCbxActionCategoryBox);
    } else if (this.alarmDictionaryModel.objectType === 'A') {
      const getCbxActionBox = this.errorCategoriesService.getListActionBox({
        pageLimit: 1000,
        currentPage: 1,
        status: 'O',
        typeRequest: 'COMBOBOX'
      }).subscribe((res: ResponseModel) => {
        if (!res.status) {
          throw new Error(res.message);
        } else {
          if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
            this.errorCategoriesService.actionList.next(res.data as ActionModel[]);
          }
          this.errorCategoriesService.cbxObject.next([]);
          if (this.errorCategoriesService.actionList.value != null) {
            const list = [];
            this.errorCategoriesService.actionList.value.forEach(value => {
              list.push({id: value.actionId, name: value.actionName});
            });
            this.errorCategoriesService.cbxObject.next(list);
          }
          this.errorCategoriesService.cbxObject.value.unshift({
            id: -1,
            name: this.translateService.instant('LIST_STATUS.ALL')
          });
          this.LoadObject.next(true);
        }
      });
      this.subscriptions.push(getCbxActionBox);
    } else {
      this.errorCategoriesService.cbxObject.next([{id: -1, name: this.translateService.instant('LIST_STATUS.ALL')}]);
      this.alarmDictionaryModel.objectId = -1;
      this.LoadObject.next(true);
    }
  }

  loadForm() {
    const indexType = this.errorCategoriesService.cbxAlarmType.value.findIndex(value =>
        value.code === this.alarmDictionaryModel.alarmTypeCode
    );
    if (indexType === -1){
      this.alarmDictionaryModel.alarmTypeCode = '-1';
    }
    const indexSeverity = this.errorCategoriesService.cbxAlarmSeverity.value.findIndex(value =>
        value.alarmSeverityId === this.alarmDictionaryModel.alarmSeverityId
    );
    if (indexSeverity === -1){
      this.alarmDictionaryModel.alarmSeverityId = -1;
    }
    const indexObject = this.errorCategoriesService.cbxObject.value.findIndex(value =>
        value.id === this.alarmDictionaryModel.objectId
    );
    if (indexObject === -1){
      this.alarmDictionaryModel.objectId = -1;
    }
    this.formGroup = this.fb.group({
      alarmCode: [this.alarmDictionaryModel.alarmCode, Validators.compose([Validators.required, Validators.maxLength(50)])],
      alarmName: [this.alarmDictionaryModel.alarmName, Validators.compose([Validators.required, Validators.maxLength(200)])],
      alarmType: [this.alarmDictionaryModel.alarmTypeCode, Validators.compose([Validators.required])],
      alarmSeverity: [this.alarmDictionaryModel.alarmSeverityId, Validators.compose([Validators.required])],
      object: [this.alarmDictionaryModel.objectId, Validators.compose([Validators.required])],
      objectType: [this.alarmDictionaryModel.objectType],
      probableCause: [this.alarmDictionaryModel.probableCause, Validators.compose([Validators.maxLength(200)])],
      suggestAction: [this.alarmDictionaryModel.suggestAction, Validators.compose([Validators.maxLength(200)])],
      suggestSolotion: [this.alarmDictionaryModel.suggestSolotion, Validators.compose([Validators.maxLength(200)])],
      alarmPattern: [this.alarmDictionaryModel.alarmPattern, Validators.compose([Validators.maxLength(200)])],
      alarmDesc: [this.alarmDictionaryModel.alarmDesc, Validators.compose([Validators.maxLength(200)])]
    });
  }

  save() {
    const vali = this.prepareAlarmDictionaryModel();
    if (vali) {
      if (this.alarmDictionaryModel.id) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  prepareAlarmDictionaryModel() {
    if (this.alarmDictionaryModel.alarmCode == null || this.alarmDictionaryModel.alarmCode === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.ALARM_CODE')}), 'Error');
      return false;
    } else {
      this.alarmDictionaryModel.alarmCode = this.alarmDictionaryModel.alarmCode.trim();
      if (this.alarmDictionaryModel.alarmCode.length > 50) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.ALARM_CODE'), max: 50}), 'Error');
        return false;
      }
      const checkCode = this.alarmDictionaryModel.alarmCode.match('^[A-Z0-9_\.]*$');
      if (checkCode == null) {
        this.toastrService.error(this.translateService.instant('CATEGORY.ALARM_DICTIONARY.MESSAGE.NOT_SPECIAL_CHARACTERS'), 'Error');
        return false;
      }
    }
    if (this.alarmDictionaryModel.alarmName == null || this.alarmDictionaryModel.alarmName === '') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.ALARM_NAME')}), 'Error');
      return false;
    } else {
      this.alarmDictionaryModel.alarmName = this.alarmDictionaryModel.alarmName.trim();
      if (this.alarmDictionaryModel.alarmName.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.ALARM_NAME'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.alarmDictionaryModel.alarmTypeCode.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.ALARM_TYPE')}), 'Error');
      return false;
    }
    if (this.alarmDictionaryModel.alarmSeverityId.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.ALARM_SEVERITY')}), 'Error');
      return false;
    }
    if (this.alarmDictionaryModel.objectId.toString() === '-1') {
      this.toastrService.error(this.translateService.instant('VALIDATION.REQUIRED',
          {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.OBJECT')}), 'Error');
      return false;
    }
    if (this.alarmDictionaryModel.probableCause != null && this.alarmDictionaryModel.probableCause !== '') {
      this.alarmDictionaryModel.probableCause = this.alarmDictionaryModel.probableCause.trim();
      if (this.alarmDictionaryModel.probableCause.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.PROBABLE_CAUSE'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.alarmDictionaryModel.suggestAction != null && this.alarmDictionaryModel.suggestAction !== '') {
      this.alarmDictionaryModel.suggestAction = this.alarmDictionaryModel.suggestAction.trim();
      if (this.alarmDictionaryModel.suggestAction.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.SUGGEST_ACTION'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.alarmDictionaryModel.suggestSolotion != null && this.alarmDictionaryModel.suggestSolotion !== '') {
      this.alarmDictionaryModel.suggestSolotion = this.alarmDictionaryModel.suggestSolotion.trim();
      if (this.alarmDictionaryModel.suggestSolotion.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.SUGGEST_SOLUTION'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.alarmDictionaryModel.alarmPattern != null && this.alarmDictionaryModel.alarmPattern !== '') {
      this.alarmDictionaryModel.alarmPattern = this.alarmDictionaryModel.alarmPattern.trim();
      if (this.alarmDictionaryModel.alarmPattern.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('CATEGORY.ALARM_DICTIONARY.TABLE_TITLE.ALARM_PATTERN'), max: 200}), 'Error');
        return false;
      }
    }
    if (this.alarmDictionaryModel.alarmDesc != null && this.alarmDictionaryModel.alarmDesc !== '') {
      this.alarmDictionaryModel.alarmDesc = this.alarmDictionaryModel.alarmDesc.trim();
      if (this.alarmDictionaryModel.alarmDesc.length > 200) {
        this.toastrService.error(this.translateService.instant('VALIDATION.MAX_LENGTH',
            {name: this.translateService.instant('COMMON.DESCRIPTION'), max: 200}), 'Error');
        return false;
      }
    }
    return true;
  }

  create() {
    const sbCreate = this.errorCategoriesService.createAlarmDictionary(this.alarmDictionaryModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.alarmDictionaryModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.alarmDictionaryModel = res.data as AlarmDictionaryModel;
        this.modal.close();
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.CREATE_SUCCESS'), 'Success');
        this.errorCategoriesService.getListAlarmDictionary(this.query);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });

    this.subscriptions.push(sbCreate);
  }

  edit() {
    const sbUpdate = this.errorCategoriesService.updateAlarmDictionary(this.alarmDictionaryModel).pipe(
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of(this.alarmDictionaryModel);
        }),
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.UPDATE_SUCCESS'), 'Success');
        this.errorCategoriesService.getListAlarmDictionary(this.query);
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
    if (this.alarmDictionaryModel.alarmCode !== null
        && this.alarmDictionaryModel.alarmCode !== '' && this.alarmDictionaryModel.alarmCode.trim() !== '') {
      return true;
    }
    if (this.alarmDictionaryModel.alarmName !== null
        && this.alarmDictionaryModel.alarmName !== '' && this.alarmDictionaryModel.alarmName.trim() !== '') {
      return true;
    }
    if (this.alarmDictionaryModel.alarmTypeCode.toString() !== '-1') {
      return true;
    }
    if (this.alarmDictionaryModel.alarmSeverityId.toString() !== '-1') {
      return true;
    }
    if (this.alarmDictionaryModel.objectId.toString() !== '-1') {
      return true;
    }
    if (this.alarmDictionaryModel.probableCause !== null
        && this.alarmDictionaryModel.probableCause !== '' && this.alarmDictionaryModel.probableCause.trim() !== '') {
      return true;
    }
    if (this.alarmDictionaryModel.suggestAction !== null
        && this.alarmDictionaryModel.suggestAction !== '' && this.alarmDictionaryModel.suggestAction.trim() !== '') {
      return true;
    }
    if (this.alarmDictionaryModel.suggestSolotion !== null
        && this.alarmDictionaryModel.suggestSolotion !== '' && this.alarmDictionaryModel.suggestSolotion.trim() !== '') {
      return true;
    }
    if (this.alarmDictionaryModel.alarmPattern !== null
        && this.alarmDictionaryModel.alarmPattern !== '' && this.alarmDictionaryModel.alarmPattern.trim() !== '') {
      return true;
    }
    if (this.alarmDictionaryModel.alarmDesc !== null
        && this.alarmDictionaryModel.alarmDesc !== '' && this.alarmDictionaryModel.alarmDesc.trim() !== '') {
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
