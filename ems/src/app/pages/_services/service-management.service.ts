import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {HTTPService} from './http.service';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {ResponseModel} from '../_models/response.model';
import {environment} from '../../../environments/environment';
import {CONFIG} from '../../utils/constants';
import {PaginatorState} from '../../_metronic/shared/crud-table';
import {ToastrService} from 'ngx-toastr';
import {SystemManagementModel} from '../_models/system-categories.model';
import {TranslateService} from '@ngx-translate/core';
import {ServiceMap, ServiceModel} from '../_models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceManagementService implements OnDestroy {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());
  items = new BehaviorSubject<ServiceModel[]>([]);
  cbxSystem = new BehaviorSubject<SystemManagementModel[]>([]);
  cbxService = new BehaviorSubject<ServiceModel[]>([]);
  itemServiceMap = new BehaviorSubject<ServiceMap[]>([]);

  constructor(
      private httpService: HTTPService,
      private toastrService: ToastrService,
      public translateService: TranslateService
  ) {
  }

  get isLoading$() {
    return this.isLoading.asObservable();
  }

  // service management
  getListServiceManagement(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.items.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.items.next(response.data as ServiceModel[]);
          }
          this.paginatorState.next({
            page: response.currentPage,
            pageSize: response.pageLimit,
            total: response.recordTotal
          } as PaginatorState);
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  getListSystemBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.cbxSystem.next(response.data as SystemManagementModel[]);
        //   this.cbxSystem.value.unshift({systemId: -1, systemName: this.translateService.instant('LIST_STATUS.ALL')});
        // }),
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
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.cbxService.next(response.data as ServiceModel[]);
        //   this.cbxService.value.unshift({serviceId: -1,
        //     serviceCode: this.translateService.instant('LIST_STATUS.ALL'),
        //     serviceName: this.translateService.instant('LIST_STATUS.ALL')});
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListServiceForParentBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_FOR_PARENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.cbxService.next(response.data as ServiceModel[]);
        //   this.cbxService.value.unshift({serviceId: -1,
        //     serviceCode: this.translateService.instant('LIST_STATUS.ALL'),
        //     serviceName: this.translateService.instant('LIST_STATUS.ALL')});
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getItemServiceById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  createService(item: ServiceModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateService(item: ServiceModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;
    this.isLoading.next(true);

    return this.httpService.post(url, item, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(item);
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  deleteService(serId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_DELETE}`;

    return this.httpService.post(url, {serviceId: serId}, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }


  // service map
  getListServiceMap(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_MAP_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.itemServiceMap.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.itemServiceMap.next(response.data as ServiceMap[]);
          }
          this.paginatorState.next({
            page: response.currentPage,
            pageSize: response.pageLimit,
            total: response.recordTotal
          } as PaginatorState);
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  getItemServiceMapById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_MAP_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }


  createServiceMap(item: ServiceMap) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_MAP}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateServiceMap(item: ServiceMap) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_MAP}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;
    this.isLoading.next(true);

    return this.httpService.post(url, item, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(item);
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  deleteServiceMap(id: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SERVICE_MAP_DELETE}`;

    return this.httpService.post(url, {mapId: id}, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
