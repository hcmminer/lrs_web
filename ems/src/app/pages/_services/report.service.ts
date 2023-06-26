import { ActionModel } from './../_models/action-categories.model';
import {Injectable, OnDestroy} from '@angular/core';
import {HTTPService} from './http.service';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {PaginatorState} from '../../_metronic/shared/crud-table';
import {environment} from '../../../environments/environment';
import {CONFIG} from '../../utils/constants';
import {catchError, finalize, map} from 'rxjs/operators';
import {ResponseModel} from '../_models/response.model';
import {SystemManagementModel} from '../_models/system-categories.model';
import {ServiceModel} from '../_models/service.model';
import {ActionCategoriesModel} from '../_models/action-categories.model';
import {AlarmSeverityModel, ErrorCategoriesModel} from '../_models/error-categories.model';
import { DataUtilities } from 'src/app/utils/data';

@Injectable({
  providedIn: 'root',
})
export class ReportService implements OnDestroy {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());
  cbxSystem = new BehaviorSubject<SystemManagementModel[]>([]);
  cbxService = new BehaviorSubject<ServiceModel[]>([]);
  // cbxCategory = new BehaviorSubject<ActionCategoriesModel[]>([]);
  cbxAction = new BehaviorSubject<ActionModel[]>([]);
  cbxAlarmType = new BehaviorSubject<ErrorCategoriesModel[]>([]);
  // cbxAlarmSeverity = new BehaviorSubject<AlarmSeverityModel[]>([]);

  constructor(
      private httpService: HTTPService,
      private toastrService: ToastrService,
      public translateService: TranslateService
  ) {
  }

  get isLoading$() {
    return this.isLoading.asObservable();
  }


  getListSystemBox(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.cbxSystem.next(response.data as SystemManagementModel[]);
          }
          this.cbxSystem.value.unshift({systemId: -1, systemCode: '', systemName: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  getListServiceBox(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.cbxService.next(response.data as ServiceModel[]);
          }
          this.cbxService.value.unshift({serviceId: -1, serviceCode: '',
            serviceName: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  // getListActionCategoryBox(query: {}){
  //   this.isLoading.next(true);
  //   const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY_LIST}`;
  //   const request = this.httpService.post(url, query, {}).pipe(
  //       map((response: ResponseModel) => {
  //         if (!response.status) {
  //           throw new Error(response.message);
  //         }
  //         this.cbxCategory.next(response.data as ActionCategoriesModel[]);
  //         this.cbxCategory.value.unshift({categoryId: -1, categoryCode: "", categoryName: this.translateService.instant('LIST_STATUS.ALL')});
  //       }),
  //       catchError((err) => {
  //         this.toastrService.error(err.error?.message || err.message, 'Error');
  //         return of(undefined);
  //       }),
  //       finalize(() => this.isLoading.next(false))
  //   ).subscribe();
  //   this.subscriptions.push(request);
  // }

  getListActionBox(query: {}){
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.cbxAction.next(response.data as ActionModel[]);
          }
          this.cbxAction.value.unshift({actionId: -1, actionCode: '', actionName: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  getListAlarmTypeBox(query: {}){
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.cbxAlarmType.next(response.data as ErrorCategoriesModel[]);
          }
          this.cbxAlarmType.value.unshift({id: -1, code: '', name: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  // getListAlarmSeverityBox(query: {}){
  //   this.isLoading.next(true);
  //   const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY_LIST}`;
  //   const request = this.httpService.post(url, query, {}).pipe(
  //       map((response: ResponseModel) => {
  //         if (!response.status) {
  //           throw new Error(response.message);
  //         }
  //         this.cbxAlarmSeverity.next(response.data as AlarmSeverityModel[]);
  //       }),
  //       catchError((err) => {
  //         this.toastrService.error(err.error?.message || err.message, 'Error');
  //         return of(undefined);
  //       }),
  //       finalize(() => this.isLoading.next(false))
  //   );
  //   return request;
  // }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  searchReport(params: any, reportTypePath: string) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${reportTypePath}`;

    return this.httpService.get(url, params, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  exportReport(params: any, reportTypePath: string): Observable<any> {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${reportTypePath}`;

    return this.httpService.get(url, params, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  downExportExcel(data: string, name = '.xls') {
    if (!data) {
      return;
    }
    const newData = DataUtilities.base64ToArrayBuffer(data);
    const myBlob = new Blob([newData as BlobPart], { type: 'application/vnd.ms-excel;charset=UTF-8' });
    const blobURL = URL.createObjectURL(myBlob);
    const anchor = document.createElement('a');
    anchor.href = blobURL;
    // href.download = 'abc.csv';
    anchor.id = 'download';
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
