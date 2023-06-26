import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, fromEvent, of, Subscription} from 'rxjs';
import {NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {DashboardOnlineService} from '../../_services/dashboard-online.service';
import {ResponseModel} from '../../_models/response.model';
import {AlarmAudioModel, AlarmColorModel, AlarmSeverityModel, ErrorCategoriesModel} from '../../_models/error-categories.model';
import {DashboardDetailModel} from '../../_models/Dashboard.model';
import {AlarmViewerComponent} from '../alarm-viewer/alarm-viewer.component';
import {getDateInputWithFormat} from '../../../utils/functions';
import {ToastrService} from 'ngx-toastr';
import {catchError, debounceTime, finalize, map} from 'rxjs/operators';
import {AlarmGroupComponent} from '../alarm-group/alarm-group.component';
import {WebsocketServiceGroup} from '../../_services/websocket.service-group';
import {ServiceModel} from '../../_models/service.model';
import {SystemManagementModel} from '../../_models/system-categories.model';
import {ActionCategoriesModel} from '../../_models/action-categories.model';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  systemCode: '',
  serviceCode: '',
  actionCategoryId: -1,
  startDate: '',
  iValidStartDate: undefined,
  endDate: '',
  iValidEndDate: undefined,
  action: '',
  numberRecord: '20',
  statusCLR: -1,
  listTypeCode: [],
  listSeverity: []
};

@Component({
  selector: 'app-dashboard-online',
  templateUrl: './dashboard-online.component.html',
  styleUrls: ['./dashboard-online.component.scss']
})
export class DashboardOnlineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('numberRecord') nr: ElementRef;
  @ViewChild('action') at: ElementRef;
  query = {
    ...queryInit
  };
  queryReset = {
    systemCode: '',
    serviceCode: '',
    actionCategoryId: -1,
    startDate: '',
    iValidStartDate: undefined,
    endDate: '',
    iValidEndDate: undefined,
    action: '',
    numberRecord: '20',
    statusCLR: -1
  };
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  private subscriptions: Subscription[] = [];
  listCLRStatus = CONFIG.LINE_CLR_STATUS;
  clearStatus = CONFIG.CLR_STATUS.CLEAR;
  notClearStatus = CONFIG.CLR_STATUS.NOT_CLEAR;
  actionTypeProduct = CONFIG.ACTION_TYPE.PRODUCT;
  actionTypeAction = CONFIG.ACTION_TYPE.ACTION;

  checkF = new BehaviorSubject<number>(0);
  listType = [];
  listSeverity = [];

  // color
  listColor: any;

  startDateErrorMsg: string = '';
  endDateErrorMsg: string = '';

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      private toastrService: ToastrService,
      public translateService: TranslateService,
      public dashboardOnlineService: DashboardOnlineService,
      private websocketService: WebsocketServiceGroup
  ) {
  }

  ngOnInit(): void {
    this.dashboardOnlineService.isPlayAudio = true;
    this.dashboardOnlineService.listDashboard.next([]);
    // this.ePlay();
    this.websocketService.checkRunTime.next(false);
    const pa = this.dashboardOnlineService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.dashboardOnlineService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.checkF.subscribe(value => {
      if (value === 3) {
        this.dashboardOnlineService.cbxAlarmSeverity.value.forEach((value) => {
          const indexSer = this.dashboardOnlineService.listAlarmColor.value.findIndex(
              value1 => value1.alarmSeverityId === value.alarmSeverityId);
          if (indexSer > -1) {
            value.colorCurrentType = this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrentType;
            value.colorCurrent = this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrent;
          }
        });

        this.dashboardOnlineService.getListDashboard(this.query).subscribe((res: ResponseModel) => {
          if (!res.status) {
            throw new Error(res.message);
          } else {
            this.dashboardOnlineService.listDashboard.next(res.data as DashboardDetailModel[]);
            // const listTmp = [];
            // this.dashboardOnlineService.listDashboardDetail.value.forEach(value => {
            //   const index = listTmp.findIndex(value1 => value1.alarmId === value.alarmId);
            //   if (index === -1) {
            //     listTmp.push(value);
            //   }
            // });
            // this.dashboardOnlineService.listDashboard.next(listTmp);
            this.dashboardOnlineService.paginatorState.next({
              page: res.currentPage,
              pageSize: res.pageLimit,
              total: this.dashboardOnlineService.listDashboard.value ? this.dashboardOnlineService.listDashboard.value.length : 0
            } as PaginatorState);
            this.setColorInRow();
          }
        });
      }
    });
    const cbxType = this.dashboardOnlineService.getListAlarmTypeBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.cbxAlarmType.next(res.data as ErrorCategoriesModel[]);
        this.checkAllSelectBoxType();
        this.checkF.next(this.checkF.value + 1);
      }
    });
    const cbxSeverity = this.dashboardOnlineService.getListAlarmSeverityBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.cbxAlarmSeverity.next(res.data as AlarmSeverityModel[]);
        this.checkAllSelectBoxSeverity();
        this.checkF.next(this.checkF.value + 1);
      }
    });
    const lstColor = this.dashboardOnlineService.getListAlarmColor().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      this.dashboardOnlineService.listAlarmColor.next(response.data as AlarmColorModel[]);
      this.checkF.next(this.checkF.value + 1);
    });
    this.subscriptions.push(lstColor);
    // this.dashboardOnlineService.getListSystemBox({pageLimit: 1000, currentPage: 1, status: 'O'});
    const lstSys = this.dashboardOnlineService.getListSystemBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.cbxSystem.next(res.data as SystemManagementModel[]);
        this.dashboardOnlineService.cbxSystem.value.unshift({systemCode: '', systemName: this.translateService.instant('LIST_STATUS.ALL')});
        // this.checkF1.next(this.checkF1.value + 1);
      }
    });
    const lstSer = this.dashboardOnlineService.getListServiceBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.cbxService.next(res.data as ServiceModel[]);
        this.dashboardOnlineService.cbxService.value.unshift({
          serviceCode: '',
          serviceName: this.translateService.instant('LIST_STATUS.ALL')
        });
      }
    });
    const lstAcCat = this.dashboardOnlineService.getListActionCategoryBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.cbxCategory.next(res.data as ActionCategoriesModel[]);
        this.dashboardOnlineService.cbxCategory.value.unshift({
          categoryId: -1,
          categoryName: this.translateService.instant('LIST_STATUS.ALL')
        });
        // this.checkF1.next(this.checkF1.value + 1);
      }
    });
    this.dashboardOnlineService.getListActionBox({pageLimit: 1000, currentPage: 1, status: 'O', typeRequest: 'COMBOBOX'});
    this.loadSearchForm();
    this.subscriptions.push(cbxType);
    this.subscriptions.push(cbxSeverity);
    this.subscriptions.push(lstSys);
    this.subscriptions.push(lstAcCat);
    this.subscriptions.push(lstSer);
    const request = this.dashboardOnlineService.getListServerAudio().pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          // this.modal.dismiss(err);
          return of(undefined);
        }),
        finalize(() => {
        })
    ).subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      this.dashboardOnlineService.listAlarmAudioServer.next(response.data as AlarmAudioModel[]);
    });
    this.subscriptions.push(request);
    // this.connect();
    this.subscriptions.push(request);
    // setTimeout(args => {
    //   this.ePerform();
    // }, 5000);
    this.ePerform();
  }

  setColorInRow() {
    this.dashboardOnlineService.cbxAlarmSeverity.value.forEach(item => {
      item.totalError = 0;
    });
    this.dashboardOnlineService.listDashboard.value.forEach((value) => {
      const indexSer = this.dashboardOnlineService.listAlarmColor.value.findIndex(
          value1 => value1.alarmSeverityId === value.alarmSeverityId);
      if (indexSer > -1 && value.clearStatus !== '1') {
        value.colorCurrentType = this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrentType;
        value.colorCurrent = this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrent;
      }
      this.dashboardOnlineService.cbxAlarmSeverity.value.filter((item) => {
        if (item.alarmSeverityId === value.alarmSeverityId) {
          item.totalError++;
        }
      });
    });
  }

  ePerform() {
    this.toastrService.info(this.translateService.instant('NOTI.PERFORMING_ALARM'), 'Info');
    this.connect();
  }

  eExport() {
    this.toastrService.info(this.translateService.instant('NOTI.EXPORT_EXCEL'), 'Info');
    this.dashboardOnlineService.exportListDashboardDetail();
  }

  eDisconnect() {
    this.websocketService.disconnect();
  }

  connect(): void {
    if (!this.websocketService.checkRunTime.value) {
      this.websocketService.connect();
    }
  }

  ePlay() {
    if (!this.dashboardOnlineService.isPlayAudio) {
      this.toastrService.info(this.translateService.instant('NOTI.PAUSE_PLAY_ALARM'), 'Info');
      if (this.dashboardOnlineService.listDashboard.value[0] && this.dashboardOnlineService.listDashboard.value[0].alarmSeverityId) {
        const serId = this.dashboardOnlineService.listDashboard.value[0].alarmSeverityId;
        const audioIndex = this.dashboardOnlineService.listAlarmAudioServer.value.findIndex(audio => audio.alarmSeverityId === serId);
        if (audioIndex > -1) {
          const linkFile = this.dashboardOnlineService.listAlarmAudioServer.value[audioIndex].audioCurrent;
          if (linkFile != null) {
            const regex = /.+?\/(?=[^\/]+$)/g;
            const fileName = linkFile.replace(/\\/gi, '/').split(regex);
            const fileTypeArray = linkFile.split('.');
            if (fileTypeArray !== null) {
              const len = fileTypeArray.length;
              const fileType = fileTypeArray[len - 1];
              if (linkFile) {
                const request = this.dashboardOnlineService.getServerAudioContent(fileName[1]).subscribe(response => {
                  if (!response.status) {
                    throw new Error(response.message);
                  } else {
                    this.dashboardOnlineService.audioPlay = new Audio('data:audio/' + fileType + ';base64,' + response.data);
                    this.dashboardOnlineService.audioPlay.play();
                    this.dashboardOnlineService.isPlayAudio = true;
                  }
                });
                this.subscriptions.push(request);
              }
            }
          }
        }
      }
    } else if (typeof (this.dashboardOnlineService.audioPlay) !== 'undefined' && this.dashboardOnlineService.audioPlay !== null) {
      this.toastrService.info(this.translateService.instant('NOTI.PAUSE_SOUND_ALARM'), 'Info');
      this.dashboardOnlineService.audioPlay.pause();
      this.dashboardOnlineService.isPlayAudio = false;
    }else{
      this.toastrService.info(this.translateService.instant('NOTI.PAUSE_SOUND_ALARM'), 'Info');
      this.dashboardOnlineService.isPlayAudio = false;
    }
  }

  checkAllSelectBoxType() {
    let i = 0;
    this.dashboardOnlineService.cbxAlarmType.value.forEach(value => {
      value.checked = true;
      this.query.listTypeCode.push(value.code);
      this.listType.push(value.code);
      i++;
    });
    // this.dashboardOnlineService.cbxAlarmType.value.forEach(value => {
    //   value.checked = true;
    //   this.query.listTypeCode.push(value.code);
    // });
    // this.listType.next(this.query.listTypeCode);
  }

  checkAllSelectBoxSeverity() {
    let i = 0;
    this.dashboardOnlineService.cbxAlarmSeverity.value.forEach(value => {
      value.checked = true;
      this.query.listSeverity.push(value.alarmSeverityId);
      this.listSeverity.push(value.alarmSeverityId);
      i++;
    });
  }

  eViewDetail(faultId: number) {
    const modalRef = this.modalService.open(AlarmGroupComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = faultId;
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
    this.searchForm.value.iValidStartDate = undefined;
    this.searchForm.value.iValidEndDate = undefined;
    this.eSearch();
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      system: [this.query.systemCode],
      service: [this.query.serviceCode],
      actionCategory: [this.query.actionCategoryId],
      iValidStartDate: [this.query.startDate],
      iValidEndDate: [this.query.endDate],
      action: [this.query.action],
      numberRecord: [this.query.numberRecord],
      statusCLR: [this.query.statusCLR],
    });
  }

  isValidDate(dateString): boolean {
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  };

  resetError(controlName: string){
    switch(controlName){
      case 'iValidStartDate':
        this.startDateErrorMsg = '';
        break;
      case 'iValidEndDate':
        this.endDateErrorMsg = '';
        break;
    }
  }

  isControlInvalid(controlName: string): boolean {
    switch(controlName){
      case 'iValidStartDate':
        return this.startDateErrorMsg && this.startDateErrorMsg.length > 0;
      case 'iValidEndDate':
        return this.endDateErrorMsg && this.endDateErrorMsg.length > 0;
    }
  }

  isValidDateForm() : boolean{
    this.startDateErrorMsg = '';
    this.endDateErrorMsg = '';
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    let isValidAllDate = true;
  
    if(this.query.iValidStartDate != null){
      let iValidStartDateStr;
      if (typeof this.query.iValidStartDate == "string"){
        iValidStartDateStr = this.query.iValidStartDate;
        if(/^[0-9]{8}$/.test(iValidStartDateStr)){
          this.query.iValidStartDate = new NgbDate( parseInt(iValidStartDateStr.substr(4,4)), 
                                                    parseInt(iValidStartDateStr.substr(2,2)), 
                                                    parseInt(iValidStartDateStr.substr(0,2)));
          this.searchForm.value.iValidStartDate = this.query.iValidStartDate;
        }
      }
      if(typeof this.query.iValidStartDate == "object"){
        iValidStartDateStr = this.query.iValidStartDate.day + "/" + this.query.iValidStartDate.month + "/" + this.query.iValidStartDate.year;
      }
      if(!this.isValidDate(iValidStartDateStr)){
        this.startDateErrorMsg = this.translateService.instant('VALIDATION.START_DATE_INVALID');
        isValidAllDate = false;
      }else{
        if(new Date(this.query.iValidStartDate['year'], this.query.iValidStartDate['month'] - 1, this.query.iValidStartDate['day']) > currentDate){
          this.startDateErrorMsg = this.translateService.instant('VALIDATION.AFTER_CURRENT_DATE',
          {name: this.translateService.instant('ALARM_DASHBOARD.ALARM_DASHBOARD.TABLE_TITLE.START_DATETIME')});
          isValidAllDate = false;
        }
      }
    }
    
    if(this.query.iValidEndDate != null){
      let iValidEndDateStr;
      if (typeof this.query.iValidEndDate == "string"){
        iValidEndDateStr = this.query.iValidEndDate;
        if(/^[0-9]{8}$/.test(iValidEndDateStr)){
          this.query.iValidEndDate = new NgbDate( parseInt(iValidEndDateStr.substr(4,4)), 
                                                  parseInt(iValidEndDateStr.substr(2,2)), 
                                                  parseInt(iValidEndDateStr.substr(0,2)));
          this.searchForm.value.iValidEndDate = this.query.iValidEndDate;
        }
      }
      if(typeof this.query.iValidEndDate == "object"){
        iValidEndDateStr = this.query.iValidEndDate.day + "/" + this.query.iValidEndDate.month + "/" + this.query.iValidEndDate.year;
      }
      if(!this.isValidDate(iValidEndDateStr)){
        this.endDateErrorMsg = this.translateService.instant('VALIDATION.END_DATE_INVALID');
        isValidAllDate = false;
      }
    }
    
    if(this.query.iValidStartDate != null
      && this.query.iValidEndDate != null
      && isValidAllDate && new Date(this.query.iValidStartDate['year'], this.query.iValidStartDate['month'] - 1, this.query.iValidStartDate['day'])
      > new Date(this.query.iValidEndDate['year'], this.query.iValidEndDate['month'] - 1, this.query.iValidEndDate['day'])){
      this.startDateErrorMsg = this.translateService.instant('VALIDATION.START_DATE_BEFORE_END_DATE');
      isValidAllDate = false;
    }
    
    return isValidAllDate;
  }

  private prepareSearch(): boolean {
    if(!this.isValidDateForm()) return false;

    const searchFormValue = this.searchForm.value;
    const validFrom = searchFormValue.iValidStartDate;
    const validTo = searchFormValue.iValidEndDate;
    this.query.startDate = getDateInputWithFormat(validFrom, CONFIG.FORMAT_DATE.NORMAL);
    this.query.endDate = getDateInputWithFormat(validTo, CONFIG.FORMAT_DATE.NORMAL);
    return true;
  }

  onCheckType(index, val) {
    if (this.listType[index] == null) {
      this.listType[index] = val;
    } else {
      this.listType[index] = null;
    }
    console.log(this.listType);
  }

  onCheckSeverity(index, val) {
    if (this.listSeverity[index] == null) {
      this.listSeverity[index] = val;
    } else {
      this.listSeverity[index] = null;
    }
    console.log(this.listSeverity);
  }

  eOnKeyUp() {
    this.query.numberRecord = this.query.numberRecord.replace(/\D/g, '');
  }

  eSearch() {
    if(!this.prepareSearch()) return;
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    if (this.query.numberRecord != null && this.query.numberRecord !== '') {
      this.query.pageLimit = +this.query.numberRecord;
    } else {
      this.query.pageLimit = 20;
      this.query.numberRecord = '20';
    }
    this.query.listTypeCode = this.listType.filter((el) =>
        el != null
    );
    this.query.listSeverity = this.listSeverity.filter((el) =>
        el != null
    );
    this.dashboardOnlineService.getListDashboard(this.query).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.listDashboard.next(res.data as DashboardDetailModel[]);
        this.dashboardOnlineService.paginatorState.next({
          page: res.currentPage,
          pageSize: res.pageLimit,
          total: this.dashboardOnlineService.listDashboard.value ? this.dashboardOnlineService.listDashboard.value.length : 0
        } as PaginatorState);
        this.setColorInRow();
      }
    });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.dashboardOnlineService.getListDashboard(this.query).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.listDashboard.next(res.data as DashboardDetailModel[]);
        this.dashboardOnlineService.paginatorState.next({
          page: res.currentPage,
          pageSize: res.pageLimit,
          total: this.dashboardOnlineService.listDashboard.value ? this.dashboardOnlineService.listDashboard.value.length : 0
        } as PaginatorState);
        this.setColorInRow();
      }
    });
  }

  ngAfterViewInit() {
    const keyup$ = fromEvent(this.nr.nativeElement, 'keyup').pipe(
        map((i: any) => i.currentTarget.value),
        debounceTime(3000)
    ).subscribe(() => this.eSearch());
    this.subscriptions.push(keyup$);
    const keyup1$ = fromEvent(this.at.nativeElement, 'keyup').pipe(
        map((i: any) => i.currentTarget.value),
        debounceTime(3000)
    ).subscribe(() => this.eSearch());
    this.subscriptions.push(keyup1$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
    if (this.websocketService.checkConnect) {
      this.websocketService.disconnect();
    }
    // this.websocketService.disconnect();
    if (typeof (this.dashboardOnlineService.audioPlay) !== 'undefined' && this.dashboardOnlineService.audioPlay !== null) {
      // this.toastrService.info(this.translateService.instant('NOTI.PAUSE_SOUND_ALARM'), 'Info');
      this.dashboardOnlineService.audioPlay.pause();
      this.dashboardOnlineService.isPlayAudio = false;
    }else{
      this.dashboardOnlineService.isPlayAudio = false;
    }
  }
}
