import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {HTTPService} from './http.service';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {ResponseModel} from '../_models/response.model';
import {environment} from '../../../environments/environment';
import {CONFIG} from '../../utils/constants';
import {PaginatorState} from '../../_metronic/shared/crud-table';
import {ToastrService} from 'ngx-toastr';
import {AlarmAudioModel, AlarmColorModel, AlarmDictionaryModel, AlarmSeverityModel, ErrorCategoriesModel} from '../_models/error-categories.model';
import {CommonComboBox} from '../_models/common.model';
import {ActionCategoriesModel, ActionModel} from '../_models/action-categories.model';

@Injectable({
  providedIn: 'root',
})
export class ErrorCategoriesService implements OnDestroy {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());
  items = new BehaviorSubject<ErrorCategoriesModel[]>([]);
  itemSeverity = new BehaviorSubject<AlarmSeverityModel[]>([]);

  // dic
  listDictionary = new BehaviorSubject<AlarmDictionaryModel[]>([]);
  cbxAlarmType = new BehaviorSubject<ErrorCategoriesModel[]>([]);
  cbxAlarmSeverity = new BehaviorSubject<AlarmSeverityModel[]>([]);
  cbxObject = new BehaviorSubject<CommonComboBox[]>([]);
  actionCategoryList = new BehaviorSubject<ActionCategoriesModel[]>([]);
  actionList = new BehaviorSubject<ActionModel[]>([]);

  // color
  listAlarmColor = new BehaviorSubject<AlarmColorModel[]>([]);

  // audio
  listAlarmAudio = new BehaviorSubject<AlarmAudioModel[]>([]);
  listAlarmAudioServer = new BehaviorSubject<AlarmAudioModel[]>([]);
  // isPlayAudio = false;

  constructor(
      private httpService: HTTPService,
      private toastrService: ToastrService
  ) {
  }

  get isLoading$() {
    return this.isLoading.asObservable();
  }

  getListErrorType(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.items.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.items.next(response.data as ErrorCategoriesModel[]);
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

  createErrorType(item: ErrorCategoriesModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY}`;
    // item.status = item.status ? CONFIG.STATUS.ACTIVE : CONFIG.STATUS.INACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  getItemErrorTypeById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateErrorType(item: ErrorCategoriesModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY}`;
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

  deleteErrorType(errorTypeId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY_DELETE}`;

    return this.httpService.post(url, {id: errorTypeId}, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }


  getListAlarmSeverity(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.itemSeverity.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.itemSeverity.next(response.data as AlarmSeverityModel[]);
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

  createAlarmSeverity(item: AlarmSeverityModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY}`;
    item.status = CONFIG.STATUS.ACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  getItemAlarmSeverityById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateAlarmSeverity(item: AlarmSeverityModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY}`;
    item.status = CONFIG.STATUS.ACTIVE;
    this.isLoading.next(true);

    return this.httpService.post(url, item, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(item);
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  deleteAlarmSeverity(severityId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY_DELETE}`;

    return this.httpService.post(url, {alarmSeverityId: severityId}, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }


  getListAlarmDictionary(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DICTIONARY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.listDictionary.next([]);
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.listDictionary.next(response.data as AlarmSeverityModel[]);
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

  getListAlarmTypeBox(query: {}){
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ERROR_TYPE_CATEGORY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListAlarmSeverityBox(query: {}){
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SEVERITY_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListActionCategoryBox(query: {}){
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

  getListActionBox(query: {}){
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ACTION_MANAGEMENT_LIST}`;
    const request = this.httpService.post(url, query, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getItemAlarmDictionaryById(id: number) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DICTIONARY_BY_ID}/${id}`;

    return this.httpService.get(url, null, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  createAlarmDictionary(item: AlarmDictionaryModel) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DICTIONARY}`;
    item.status = CONFIG.STATUS.ACTIVE;

    return this.httpService.post(url, item, {}).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of({id: undefined});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateAlarmDictionary(item: AlarmDictionaryModel) {
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DICTIONARY}`;
    item.status = CONFIG.STATUS.ACTIVE;
    this.isLoading.next(true);

    return this.httpService.post(url, item, null).pipe(
        catchError(err => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(item);
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  deleteAlarmDictionary(dicId: any) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_DICTIONARY_DELETE}`;

    return this.httpService.post(url, {id: dicId}, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
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
    // this.subscriptions.push(request);
    return request;
  }

  updateAlarmColor(alarmColorList: AlarmColorModel[]) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_COLOR_UPDATE}`;

    return this.httpService.post(url, alarmColorList, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  getListAlarmAudio() {
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

  updateAlarmAudioServer(alarmAudioList: AlarmAudioModel[]) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_AUDIO_UPDATE_SERVER}`;

    return this.httpService.post(url, alarmAudioList, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  updateAlarmAudioLocal(alarmAudioList: AlarmAudioModel[]) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_AUDIO_UPDATE_LOCAL}`;

    return this.httpService.post(url, alarmAudioList, null).pipe(
        catchError(err => {
          return of({});
        }),
        finalize(() => this.isLoading.next(false))
    );
  }

  getListServerAudio() {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_SERVER_AUDIO_LIST}`;
    const request = this.httpService.get(url, null, {}).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
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
}
