import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {HTTPService} from './http.service';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {ResponseModel} from '../_models/response.model';
import {environment} from '../../../environments/environment';
import {CONFIG} from '../../utils/constants';
import {PaginatorState} from '../../_metronic/shared/crud-table';
import {ToastrService} from 'ngx-toastr';
import {SystemCategoriesModel, SystemManagementModel} from '../_models/system-categories.model';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class SystemCategoriesService implements OnDestroy {
  subscriptions: Subscription[] = [];
  items = new BehaviorSubject<SystemCategoriesModel[]>([]);
  cbxSystemCategory = new BehaviorSubject<SystemCategoriesModel[]>([]);
  cbxSystem = new BehaviorSubject<SystemManagementModel[]>([]);
  itemSys = new BehaviorSubject<SystemManagementModel[]>([]);
  isLoading = new BehaviorSubject<boolean>(false);
  paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());

  constructor(
      private httpService: HTTPService,
      private toastrService: ToastrService,
      public translateService: TranslateService
  ) {
  }

  get isLoading$() {
    return this.isLoading.asObservable();
  }

  getListSystemCategory(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.items.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.items.next(response.data as SystemCategoriesModel[]);
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

  createSystemCategory(item: SystemCategoriesModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_CATEGORY}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  getItemSystemCategoryById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_CATEGORY_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateSystemCategory(item: SystemCategoriesModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_CATEGORY}`;
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

  deleteSystemCategory(sysId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_CATEGORY_DELETE}`;

    return this.httpService.post(url, {id: sysId}, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  // system management
  getListSystemManagement(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.itemSys.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.itemSys.next(response.data as SystemManagementModel[]);
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

  getListSystemCategoryBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.cbxSystemCategory.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.cbxSystemCategory.next(response.data as SystemCategoriesModel[]);
          }
          this.cbxSystemCategory.value.unshift({id: -1, name: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
    // this.subscriptions.push(request);
  }

  getListSystemManagementBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.cbxSystem.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.cbxSystem.next(response.data as SystemManagementModel[]);
          }
          this.cbxSystem.value.unshift({systemId: -1, systemName: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
    // this.subscriptions.push(request);
  }

  getListSystemManagementForParentBox(query: {}) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_FOR_PARENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.cbxSystem.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.cbxSystem.next(response.data as SystemManagementModel[]);
          }
          this.cbxSystem.value.unshift({systemId: -1, systemName: this.translateService.instant('LIST_STATUS.ALL')});
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
    // this.subscriptions.push(request);
  }

  getItemSystemManagementById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  createSystemManagement(item: SystemManagementModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateSystemManagement(item: SystemManagementModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT}`;
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

  deleteSystemManagement(sysId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.SYSTEM_MANAGEMENT_DELETE}`;

    return this.httpService.post(url, {systemId: sysId}, null).pipe(
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
