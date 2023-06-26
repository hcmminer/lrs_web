import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {HTTPService} from './http.service';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {ResponseModel} from '../_models/response.model';
import {environment} from '../../../environments/environment';
import {CONFIG} from '../../utils/constants';
import {PaginatorState} from '../../_metronic/shared/crud-table';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {ActionModel, ActionCategoriesModel} from '../_models/action-categories.model';

@Injectable({
  providedIn: 'root',
})
export class ActionCategoriesService implements OnDestroy {
  subscriptions: Subscription[] = [];
  items = new BehaviorSubject<ActionCategoriesModel[]>([]);
  cbxCategory = new BehaviorSubject<ActionCategoriesModel[]>([]);
  itemAction = new BehaviorSubject<ActionModel[]>([]);
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

  getListActionCategory(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.items.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.items.next(response.data as ActionCategoriesModel[]);
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

  createActionCategory(item: ActionCategoriesModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  getItemActionCategoryById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateActionCategory(item: ActionCategoriesModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY}`;
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

  deleteActionCategory(actionId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY_DELETE}`;

    return this.httpService.post(url, {categoryId: actionId}, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  // action management
  getListActionManagement(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.itemAction.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.itemAction.next(response.data as ActionModel[]);
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

  getListCategoryBox(query: {}){
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        // map((response: ResponseModel) => {
        //   if (!response.status) {
        //     throw new Error(response.message);
        //   }
        //   this.cbxCategory.next(response.data as ActionCategoriesModel[]);
        //   this.cbxCategory.value.unshift({categoryId: -1, categoryName: this.translateService.instant('LIST_STATUS.ALL')});
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getItemActionManagementById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  createActionManagement(item: ActionModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT}`;
    // item.status = 'O';

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateActionManagement(item: ActionModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT}`;
    // item.status = 'O';
    this.isLoading.next(true);

    return this.httpService.post(url, item, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(item);
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  deleteActionManagement(acId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT_DELETE}`;

    return this.httpService.post(url, {actionId: acId}, null).pipe(
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
