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
import {AlarmColorModel} from '../_models/error-categories.model';
import {ListLogicMap, LogicMapDTO, LogicMapModel} from '../_models/logic-map.model';
import {TotalSeverity} from '../_models/service.model';

@Injectable({
  providedIn: 'root',
})
export class LogicMapService implements OnDestroy {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());
  cbxSystem = new BehaviorSubject<SystemManagementModel[]>([]);

  // color
  listAlarmColor = new BehaviorSubject<AlarmColorModel[]>([]);

  // logic map
  listLogicMap = new BehaviorSubject<ListLogicMap[]>([]);
  listTotalSeverity = new BehaviorSubject<TotalSeverity[]>([]);
  listCheckbox = new BehaviorSubject<LogicMapModel[]>([]);

  checkShow = false;
  canhBaoGoc : any;

  constructor(
      private httpService: HTTPService,
      private toastrService: ToastrService,
      public translateService: TranslateService
  ) {
  }

  get isLoading$() {
    return this.isLoading.asObservable();
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
        // }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    );
    return request;
  }

  getListColor(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.ALARM_COLOR_LIST}`;
    const request = this.httpService.get(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          this.listAlarmColor.next(response.data as AlarmColorModel[]);
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  getLogicMap(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.LOGIC_MAP}`;
    const request = this.httpService.post(url, query, null).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          if (this.canhBaoGoc){
            clearInterval(this.canhBaoGoc);
          }
          this.listLogicMap.next(response.data as ListLogicMap[]);
          this.listLogicMap.value.forEach(logicMap => {
            logicMap.serviceGoc = logicMap.logicMapDTOS[0];
            if (logicMap.serviceGoc.nodeMapDTOS && logicMap.serviceGoc.nodeMapDTOS.length > 0) {
              const len = logicMap.serviceGoc.nodeMapDTOS.length;
              logicMap.serviceGoc.nodeMapDTOS.forEach((value, index) => {
                if (logicMap.serviceGoc.nodeMapDTOS.length > 1) {
                  if (index === 0) {
                    value.classBorder = 'border-bottom-logic border-half-left';
                  } else if (index > 0 && index < len - 1) {
                    value.classBorder = 'border-bottom-logic';
                  } else if (index === len - 1) {
                    value.classBorder = 'border-bottom-logic border-half-right';
                  } else {
                    value.classBorder = '';
                  }
                }
                // check shadow node goc
                if (value.alarmNorClearByServiceDTO && value.alarmNorClearByServiceDTO.color) {
                  if (value.alarmNorClearByServiceDTO.colorType === 'RGB') {
                    value.alarmNorClearByServiceDTO.shadow = '0 0 76px rgb(' + value.alarmNorClearByServiceDTO.color + ')';
                  } else if (value.alarmNorClearByServiceDTO.colorType === 'HEX') {
                    value.alarmNorClearByServiceDTO.shadow = '0 0 76px ' + value.alarmNorClearByServiceDTO.color;
                  } else {
                    value.alarmNorClearByServiceDTO.shadow = null;
                  }
                }
              });
              logicMap.serviceGoc.src = 'assets/media/logic-map/giua.png';
              // error loi
              // if (logicMap.serviceGoc.totalError && logicMap.serviceGoc.totalError > 0) {
              //   let showAlarm = false;
              //   const canhBaoGoc = setInterval(args => {
              //     if (!showAlarm){
              //       logicMap.serviceGoc.src = 'assets/media/logic-map/giua-alarm-show.png';
              //       this.listLogicMap.next(this.listLogicMap.value);
              //     }else {
              //       logicMap.serviceGoc.src = 'assets/media/logic-map/giua-alarm-hide.png';
              //       this.listLogicMap.next(this.listLogicMap.value);
              //     }
              //     showAlarm = !showAlarm;
              //   }, 500);
              // }else{
              //   logicMap.serviceGoc.src = 'assets/media/logic-map/giua.png';
              // }
            } else {
              logicMap.serviceGoc.src = 'assets/media/logic-map/down_solid.png';
            }
            // check shadow service goc
            if (logicMap.serviceGoc.alarmNorClearByServiceDTO && logicMap.serviceGoc.alarmNorClearByServiceDTO.color) {
              if (logicMap.serviceGoc.alarmNorClearByServiceDTO.colorType === 'RGB') {
                logicMap.serviceGoc.alarmNorClearByServiceDTO.shadow = '0 0 76px rgb(' + logicMap.serviceGoc.alarmNorClearByServiceDTO.color + ')';
              } else if (logicMap.serviceGoc.alarmNorClearByServiceDTO.colorType === 'HEX') {
                logicMap.serviceGoc.alarmNorClearByServiceDTO.shadow = '0 0 76px ' + logicMap.serviceGoc.alarmNorClearByServiceDTO.color;
              } else {
                logicMap.serviceGoc.alarmNorClearByServiceDTO.shadow = null;
              }
            }
            if (logicMap.logicMapDTOS.length > 1) {
              logicMap.serviceMapping = logicMap.logicMapDTOS.slice(1);
              const lenMapping = logicMap.serviceMapping.length;
              logicMap.serviceMapping.forEach((value, index) => {
                if (value.status === 'O') {
                  if (value.nodeMapDTOS != null && value.nodeMapDTOS.length > 0) {
                    value.src = 'assets/media/logic-map/giua.png';
                  } else {
                    value.src = 'assets/media/logic-map/up-solid.png';
                  }
                } else {
                  if (value.nodeMapDTOS != null && value.nodeMapDTOS.length > 0) {
                    value.src = 'assets/media/logic-map/giua_dot_up.png';
                  } else {
                    value.src = 'assets/media/logic-map/up_dot.png';
                  }
                }
                // check shadow service nhanh
                if (value.alarmNorClearByServiceDTO && value.alarmNorClearByServiceDTO.color) {
                  if (value.alarmNorClearByServiceDTO.colorType === 'RGB') {
                    value.alarmNorClearByServiceDTO.shadow = '0 0 76px rgb(' + value.alarmNorClearByServiceDTO.color + ')';
                  } else if (value.alarmNorClearByServiceDTO.colorType === 'HEX') {
                    value.alarmNorClearByServiceDTO.shadow = '0 0 76px ' + value.alarmNorClearByServiceDTO.color;
                  } else {
                    value.alarmNorClearByServiceDTO.shadow = null;
                  }
                }
                if (index === 0 && lenMapping > 1) {
                  value.classBorder = 'border-logic border-half-left';
                } else if (index > 0 && index < lenMapping - 1) {
                  value.classBorder = 'border-logic border-bottom';
                } else if (index === lenMapping - 1 && lenMapping > 1) {
                  value.classBorder = 'border-logic border-half-right';
                } else {
                  value.classBorder = '';
                }
                const lenNote = value.nodeMapDTOS.length;
                value.nodeMapDTOS.forEach((value1, index1) => {
                  if (index1 === 0 && lenNote > 1) {
                    value1.classBorder = 'border-logic border-half-left';
                  } else if (index1 > 0 && index1 < lenNote - 1) {
                    value1.classBorder = 'border-logic border-bottom';
                  } else if (index1 === lenNote - 1 && lenNote > 1) {
                    value1.classBorder = 'border-logic border-half-right';
                  } else {
                    value1.classBorder = '';
                  }
                  // check shadow node duoi
                  if (value1.alarmNorClearByServiceDTO && value1.alarmNorClearByServiceDTO.color) {
                    if (value1.alarmNorClearByServiceDTO.colorType === 'RGB') {
                      value1.alarmNorClearByServiceDTO.shadow = '0 0 76px rgb(' + value1.alarmNorClearByServiceDTO.color + ')';
                    } else if (value1.alarmNorClearByServiceDTO.colorType === 'HEX') {
                      value1.alarmNorClearByServiceDTO.shadow = '0 0 76px ' + value1.alarmNorClearByServiceDTO.color;
                    } else {
                      value1.alarmNorClearByServiceDTO.shadow = null;
                    }
                  }
                });
              });
            }
          });
          this.canhBaoGoc = setInterval(args => {
            this.checkShow = !this.checkShow;
            this.listLogicMap.next(this.listLogicMap.value);
          }, 500);
          console.log(this.listLogicMap.value);
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  getListCountSeverity(query: {}): void {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${CONFIG.API_PATH.LIST_TOTAL_SEVERITY}`;
    const request = this.httpService.post(url, query, {}).pipe(
        map((response: ResponseModel) => {
          if (!response.status) {
            throw new Error(response.message);
          }
          if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
            this.listTotalSeverity.next(response.data as TotalSeverity[]);
          } else {
            const arr = [];
            this.listAlarmColor.value.forEach(value => {
              const totalSeverity = new TotalSeverity();
              totalSeverity.severityName = value.alarmSeverityName;
              totalSeverity.total = 0;
              arr.push(totalSeverity);
            });
            this.listTotalSeverity.next(arr);
          }
          // if (response.data)
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => this.isLoading.next(false))
    ).subscribe();
    this.subscriptions.push(request);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
