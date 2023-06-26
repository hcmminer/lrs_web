import {Injectable, OnDestroy} from '@angular/core';
import {HTTPService} from './http.service';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {PaginatorState} from '../../_metronic/shared/crud-table';
import {environment} from '../../../environments/environment';
import {CONFIG} from '../../utils/constants';
import {catchError, finalize, map} from 'rxjs/operators';
import {ResponseModel} from '../_models/response.model';
import {SystemManagementModel} from '../_models/system-categories.model';
import {ServiceModel} from '../_models/service.model';
import {ActionCategoriesModel, ActionModel} from '../_models/action-categories.model';
import {AlarmAudioModel, AlarmColorModel, AlarmSeverityModel, ErrorCategoriesModel} from '../_models/error-categories.model';
import {DashboardDetailModel} from '../_models/Dashboard.model';
import {DataUtilities} from '../../utils/data';

@Injectable({
  providedIn: 'root',
})
export class DashboardOnlineService implements OnDestroy {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());
  cbxSystem = new BehaviorSubject<SystemManagementModel[]>([]);
  cbxService = new BehaviorSubject<ServiceModel[]>([]);
  cbxCategory = new BehaviorSubject<ActionCategoriesModel[]>([]);
  cbxAction = new BehaviorSubject<ActionModel[]>([]);
  cbxAlarmType = new BehaviorSubject<ErrorCategoriesModel[]>([]);
  cbxAlarmSeverity = new BehaviorSubject<AlarmSeverityModel[]>([]);
  listDashboardDetail = new BehaviorSubject<DashboardDetailModel[]>([]);
  listDashboard = new BehaviorSubject<DashboardDetailModel[]>([]);
  listDashboardGroup = new BehaviorSubject<DashboardDetailModel[]>([]);

  // color
  listAlarmColor = new BehaviorSubject<AlarmColorModel[]>([]);
  // audio
  listAlarmAudioServer = new BehaviorSubject<AlarmAudioModel[]>([]);
  isPlayAudio = false;
  audioPlay: any;

  serviceCode = '';

  constructor(
      private httpService: HTTPService,
      private toastrService: ToastrService,
      public translateService: TranslateService
  ) {
  }

  get isLoading$() {
    return this.isLoading.asObservable();
  }


  getListDashboardDetail(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DASHBOARD_DETAIL}`;
    const request = this.httpService.post(url, query, {}).pipe(
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.listDashboardDetail.next(response.data as DashboardDetailModel[]);
        //   this.paginatorState.next({
        //     page: response.currentPage,
        //     pageSize: response.pageLimit,
        //     total: response.recordTotal
        //   } as PaginatorState);
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
    // this.subscriptions.push(request);
  }

  getListDashboard(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DASHBOARD_GROUP}`;
    const request = this.httpService.post(url, query, {}).pipe(
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.listDashboardDetail.next(response.data as DashboardDetailModel[]);
        //   const listTmp = [];
        //   this.listDashboardDetail.value.forEach(value => {
        //     const index = listTmp.findIndex(value1 => value1.alarmId === value.alarmId);
        //     if (index === -1) {
        //       listTmp.push(value);
        //     }
        //   });
        //   this.listDashboard.next(listTmp);
        //   this.paginatorState.next({
        //     page: response.currentPage,
        //     pageSize: response.pageLimit,
        //     total: this.listDashboard.value.length
        //   } as PaginatorState);
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListSystemBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListServiceBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListActionCategoryBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListActionBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.cbxAction.next(response.data as ActionModel[]);
          // this.cbxAction.value.unshift({actionId: -1, actionName: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  getListAlarmTypeBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.cbxAlarmType.next(response.data as ErrorCategoriesModel[]);
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListAlarmSeverityBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.cbxAlarmSeverity.next(response.data as AlarmSeverityModel[]);
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  exportListDashboardDetail(): void {
    const moment = Date.now().toString();
    // this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.EXPORT_ALARM_DETAIL}`;
    const request = this.httpService.post(url, this.listDashboardDetail.value, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.downExportExcel(response.data.toString(), `export_alarm_detail_${moment}.xlsx`);
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  downExportExcel(data: string, name = 'detail.xls') {
    if (!data) {
      return;
    }
    const newData = DataUtilities.base64ToArrayBuffer(data);
    const myBlob = new Blob([newData as BlobPart], {type: 'application/vnd.ms-excel;charset=UTF-8'});
    const blobURL = URL.createObjectURL(myBlob);
    const anchor = document.createElement('a');
    anchor.href = blobURL;
    // href.download = 'abc.csv';
    anchor.id = 'download';
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    this.isLoading.next(false);
  }

  getListServerAudio() {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_AUDIO_LIST}`;
    const request = this.httpService.get(url, null, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  getServerAudioContent(fileName: string) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SERVER_AUDIO_CONTENT + fileName}`;
    const request = this.httpService.get(url, null, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        })
    );
    return request;
  }

  getListAlarmColor() {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_COLOR_LIST}`;
    const request = this.httpService.get(url, null, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getAlarmDetailGroup(faultId: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DASHBOARD_GROUP_DETAIL}/${faultId}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

}
