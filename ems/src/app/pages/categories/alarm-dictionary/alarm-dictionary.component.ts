import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {ResponseModel} from '../../_models/response.model';
import {ErrorCategoriesService} from '../../_services/error-categories.service';
import {EditAlarmDictionaryModalComponent} from './edit-alarm-dictionary-modal/edit-alarm-dictionary-modal.component';
import {DeleteAlarmDictionaryModalComponent} from './delete-alarm-dictionary-modal/delete-alarm-dictionary-modal.component';
import {AlarmSeverityModel, ErrorCategoriesModel} from '../../_models/error-categories.model';
import {ActionCategoriesModel, ActionModel} from '../../_models/action-categories.model';
import {CommonComboBox} from '../../_models/common.model';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  alarmCode: null,
  alarmName: null,
  alarmTypeCode: '-1',
  alarmSeverityId: -1,
  objectId: -1,
  objectType: 'T'
};

@Component({
  selector: 'app-alarm-dictionary',
  templateUrl: './alarm-dictionary.component.html',
  styleUrls: ['./alarm-dictionary.component.scss']
})
export class AlarmDictionaryComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  queryReset = {
    alarmCode: null,
    alarmName: null,
    alarmTypeCode: '-1',
    alarmSeverityId: -1,
    objectId: -1,
    objectType: 'T'
  };
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  private subscriptions: Subscription[] = [];
  listObjectType = CONFIG.LINE_OBJECT_TYPE;
  objectTypeActionCategory = CONFIG.OBJECT_TYPE.ACTION_CATEGORY;
  objectTypeAction = CONFIG.OBJECT_TYPE.ACTION;

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public translateService: TranslateService,
      public errorCategoriesService: ErrorCategoriesService
  ) {
  }

  ngOnInit(): void {
    const pa = this.errorCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.errorCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
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
      }
    });
    this.errorCategoriesService.cbxObject.next([{
      id: -1,
      name: this.translateService.instant('LIST_STATUS.ALL')
    }]);
    this.subscriptions.push(getCbxAlarmType);
    this.subscriptions.push(getCbxAlarmSeverity);
    this.loadSearchForm();
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      alarmCodeSearch: [this.query.alarmCode],
      alarmNameSearch: [this.query.alarmName],
      alarmTypeSearch: [this.query.alarmTypeCode],
      alarmSeveritySearch: [this.query.alarmSeverityId],
      objectSearch: [this.query.objectId],
      objectTypeSearch: [this.query.objectType]
    });
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
  }

  eChangeObjectType() {
    this.errorCategoriesService.cbxObject.next([]);
    if (this.query.objectType === 'C') {
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
        }
      });
      this.subscriptions.push(getCbxActionCategoryBox);
    } else if (this.query.objectType === 'A') {
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
        }
      });
      this.subscriptions.push(getCbxActionBox);
    } else {
      this.errorCategoriesService.cbxObject.next([{id: -1, name: this.translateService.instant('LIST_STATUS.ALL')}]);
      this.query.objectId = -1;
    }
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.errorCategoriesService.getListAlarmDictionary(this.query);
  }

  private prepareSearch() {
    if (this.query.alarmCode != null && this.query.alarmCode !== '') {
      this.query.alarmCode = this.query.alarmCode.trim();
    }
    if (this.query.alarmName != null && this.query.alarmName !== '') {
      this.query.alarmName = this.query.alarmName.trim();
    }
  }

  create() {
    this.edit(undefined);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditAlarmDictionaryModalComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.errorCategoriesService.getListAlarmDictionary(this.query), () => {
    });
  }

  delete(rowdata: any): void {
    if (rowdata.status === 'O') {
      const modalRef = this.modalService.open(DeleteAlarmDictionaryModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.id;
      modalRef.result.then(() => this.errorCategoriesService.getListAlarmDictionary(this.query), () => {
      });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.errorCategoriesService.getListAlarmDictionary(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
