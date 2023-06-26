import {Injectable, OnDestroy} from '@angular/core';
import {FunctionCategoryModel} from '../_models/function-category.model';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {HTTPService} from './http.service';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {ResponseModel} from '../_models/response.model';
import {environment} from '../../../environments/environment';
import {CONFIG} from '../../utils/constants';
import {PaginatorState} from '../../_metronic/shared/crud-table';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class FunctionCategoriesService implements OnDestroy {
  subscriptions: Subscription[] = [];
  items = new BehaviorSubject<FunctionCategoryModel[]>([]);
  isLoading = new BehaviorSubject<boolean>(false);
  paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());

  constructor(
    private httpService: HTTPService,
    private toastrService: ToastrService
  ) {
  }

  get isLoading$() {
    return this.isLoading.asObservable();
  }

  getList(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.FUNCTION_CATEGORIES_LIST}`;

    const request = this.httpService.post(url, query, {}).pipe(
      map((response: ResponseModel) => {
        if (!response.status) {
          throw new Error(response.message);
        }

        this.items.next(response.data as FunctionCategoryModel[]);
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

  getItemById(id: number){
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.FUNCTION_CATEGORIES}/${id}`;

    return this.httpService.get(url, null, null).pipe(
      catchError(err => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        return of({ id: undefined });
      }),
      finalize(() => this.isLoading.next(false))
    );
  }

  create(item: FunctionCategoryModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.FUNCTION_CATEGORIES}`;
    item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;

    return this.httpService.post(url, item, {}).pipe(
      catchError(err => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        return of({ id: undefined });
      }),
      finalize(() => this.isLoading.next(false))
    );
  }

  update(item: FunctionCategoryModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.FUNCTION_CATEGORIES}`;
    item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;
    this.isLoading.next(true);

    return this.httpService.post(url, item, null).pipe(
      catchError(err => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        return of(item);
      }),
      finalize(() => this.isLoading.next(false))
    );
  }

  // DELETE
  delete(id: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.FUNCTION_CATEGORIES_DELETE}`;

    return this.httpService.post(url, { categoryId: id }, null).pipe(
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
