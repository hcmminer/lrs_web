import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {NgbActiveModal, NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {DashboardOnlineService} from '../../_services/dashboard-online.service';
import {ResponseModel} from '../../_models/response.model';
import {AlarmSeverityModel, ErrorCategoriesModel} from '../../_models/error-categories.model';
import { ReportService } from '../../_services/report.service';
import { ToastrService } from 'ngx-toastr';
import { getDateInputWithFormat } from '../../../../../src/app/utils/functions';
import { catchError, first } from 'rxjs/operators';
import * as moment from 'moment';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  systemCode: "",
  serviceCode: "",
  // categoryCode: "",
  code: "",
  startDate: '',
  iValidStartDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  endDate: '',
  iValidEndDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
  action: '',
  numberRecord: '',
  statusCLR: -1
};


@Component({
  selector: 'app-report-error-occurred-resolved',
  templateUrl: './report-error-occurred-resolved.component.html',
  styleUrls: ['./report-error-occurred-resolved.component.scss']
})
export class ReportErrorOccurredResolvedComponent implements OnInit , OnDestroy {
  query = {
    ...queryInit
  };
  paginator: PaginatorState;
  // isLoading: boolean;
  searchForm: FormGroup;
  private subscriptions: Subscription[] = [];
  listCLRStatus = CONFIG.LINE_CLR_STATUS;
  searchDataHtml = new BehaviorSubject('');
  isLoading = new BehaviorSubject<boolean>(false);
  startDateErrorMsg: string = '';
  endDateErrorMsg: string = '';

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public translateService: TranslateService,
      public reportService: ReportService,
      public toastrService: ToastrService,
      public modal: NgbActiveModal
  ) {
  }

  ngOnInit(): void {
    const pa = this.reportService.paginatorState.subscribe(res => this.paginator = res);
    // const sb = this.reportService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    // this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    // this.dashboardOnlineService.getListSystemManagement(this.query);
    this.reportService.getListSystemBox({pageLimit: 1000, currentPage: 1, status: 'O', typeRequest: 'COMBOBOX'});
    this.reportService.getListServiceBox({pageLimit: 1000, currentPage: 1, status: 'O', typeRequest: 'COMBOBOX'});
    // this.reportService.getListActionCategoryBox({pageLimit: 1000, currentPage: 1, status: 'O'});
    this.reportService.getListActionBox({pageLimit: 1000, currentPage: 1, status: 'O', typeRequest: 'COMBOBOX'});
    this.reportService.getListAlarmTypeBox({pageLimit: 1000, currentPage: 1, status: 'O', typeRequest: 'COMBOBOX'});
    // const cbxSeverity = this.reportService.getListAlarmSeverityBox({
    //   pageLimit: 1000,
    //   currentPage: 1,
    //   status: 'O'
    // }).subscribe((res: ResponseModel) => {
    //   if (!res.status) {
    //     throw new Error(res.message);
    //   } else {
    //     this.reportService.cbxAlarmSeverity.next(res.data as AlarmSeverityModel[]);
    //     this.checkAllSelectBoxSeverity();
    //   }
    // });
    this.loadSearchForm();
    // this.subscriptions.push(cbxSeverity);
  }

  checkAllSelectBoxType() {
    this.reportService.cbxAlarmType.value.forEach(value => {
      value.checked = true;
    });
  }

  // checkAllSelectBoxSeverity() {
  //   this.reportService.cbxAlarmSeverity.value.forEach(value => {
  //     value.checked = true;
  //   });
  // }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      system: [this.query.systemCode],
      service: [this.query.serviceCode],
      // actionCategory: [this.query.categoryCode],
      action: [this.query.action],
      alarmType: [this.query.code],
      iValidStartDate: [this.query.startDate],
      iValidEndDate: [this.query.endDate],
      numberRecord: [this.query.numberRecord],
      statusCLR: [this.query.statusCLR],
    });
  }

  onCheckType(index) {
  }

  onCheckSeverity(index) {
  }

  eOnKeyUp() {
    this.query.numberRecord = this.query.numberRecord.replace(/\D/g, '');
  }

  eReset() {
    this.query = {
      ...queryInit
    };
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    // this.systemCategoriesService.getListSystemManagement(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
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
    
    //required
    if(this.query.iValidStartDate == null){
      this.startDateErrorMsg = this.translateService.instant('VALIDATION.REQUIRED',
      {name: this.translateService.instant('REPORTS.REPORT_ERROR_OCCURRED_RESOLVED.TABLE_TITLE.FROM_DATE')});
      isValidAllDate = false;
    }
    
    if(this.query.iValidEndDate == null){
      this.endDateErrorMsg = this.translateService.instant('VALIDATION.REQUIRED',
      {name: this.translateService.instant('REPORTS.REPORT_ERROR_OCCURRED_RESOLVED.TABLE_TITLE.TO_DATE')});
      isValidAllDate = false;
    }
    
    //validate format and value
    let iValidStartDateStr;
    if (typeof this.query.iValidStartDate == "string"){
      iValidStartDateStr = this.query.iValidStartDate;
      if(/^[0-9]{8}$/.test(iValidStartDateStr)){
        this.query.iValidStartDate = new NgbDate( parseInt(iValidStartDateStr.substr(4,4)), 
                                                  parseInt(iValidStartDateStr.substr(2,2)), 
                                                  parseInt(iValidStartDateStr.substr(0,2)));
      }
    }
    if(typeof this.query.iValidStartDate == "object"){
      iValidStartDateStr = this.query.iValidStartDate.day + "/" + this.query.iValidStartDate.month + "/" + this.query.iValidStartDate.year;
    }
    
    let iValidEndDateStr;
    if (typeof this.query.iValidEndDate == "string"){
      iValidEndDateStr = this.query.iValidEndDate;
      if(/^[0-9]{8}$/.test(iValidEndDateStr)){
        this.query.iValidEndDate = new NgbDate( parseInt(iValidEndDateStr.substr(4,4)), 
                                                  parseInt(iValidEndDateStr.substr(2,2)), 
                                                  parseInt(iValidEndDateStr.substr(0,2)));
      }
    }
    if(typeof this.query.iValidEndDate == "object"){
      iValidEndDateStr = this.query.iValidEndDate.day + "/" + this.query.iValidEndDate.month + "/" + this.query.iValidEndDate.year;
    }
    
    if(!this.isValidDate(iValidStartDateStr)){
      this.startDateErrorMsg = this.translateService.instant('VALIDATION.START_DATE_INVALID');
      isValidAllDate = false;
    }else{
      if(new Date(this.query.iValidStartDate['year'], this.query.iValidStartDate['month'] - 1, this.query.iValidStartDate['day']) > currentDate){
        this.startDateErrorMsg = this.translateService.instant('VALIDATION.AFTER_CURRENT_DATE',
        {name: this.translateService.instant('REPORTS.REPORT_ERROR_OCCURRED_RESOLVED.TABLE_TITLE.FROM_DATE')});
        isValidAllDate = false;
      }
    }

    if(!this.isValidDate(iValidEndDateStr)){
      this.endDateErrorMsg = this.translateService.instant('VALIDATION.END_DATE_INVALID');
      isValidAllDate = false;
    }else{
      if(new Date(this.query.iValidEndDate['year'], this.query.iValidEndDate['month'] - 1, this.query.iValidEndDate['day']) > currentDate){
        this.endDateErrorMsg = this.translateService.instant('VALIDATION.AFTER_CURRENT_DATE',
        {name: this.translateService.instant('REPORTS.REPORT_ERROR_OCCURRED_RESOLVED.TABLE_TITLE.TO_DATE')});
        isValidAllDate = false;
      }
    }

    if(isValidAllDate && new Date(this.query.iValidStartDate['year'], this.query.iValidStartDate['month'] - 1, this.query.iValidStartDate['day'])
      > new Date(this.query.iValidEndDate['year'], this.query.iValidEndDate['month'] - 1, this.query.iValidEndDate['day'])){
      this.startDateErrorMsg = this.translateService.instant('VALIDATION.FROM_DATE_BEFORE_TO_DATE');
      isValidAllDate = false;
    }

    return isValidAllDate;
  }

  searchReportErrorOccurredResolved() {
    if(!this.isValidDateForm()) return;

    this.query.startDate = getDateInputWithFormat(this.query.iValidStartDate);
    this.query.endDate = getDateInputWithFormat(this.query.iValidEndDate);
    let params = {};
    if(this.query.systemCode != ""){
      Object.assign(params, {System: this.query.systemCode})
    }
    if(this.query.serviceCode != ""){
      Object.assign(params, {Service: this.query.serviceCode})
    }
    // if(this.query.categoryCode != ""){
    //   Object.assign(params, {Action: this.query.categoryCode})
    // }
    if(this.query.action != ""){
      Object.assign(params, {Action: this.query.action})
    }
    if(this.query.code != ""){
      Object.assign(params, {Error: this.query.code})
    }
    Object.assign(params, {From_date: this.query.startDate});
    Object.assign(params, {To_date: this.query.endDate});
    this.isLoading.next(true);
    const sb = this.reportService.searchReport(params, CONFIG.API_PATH.REPORT_ERROR_OCCURRED_RESOLVED_HTML).pipe(
      first(),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of({
          // ...EMPTY_SYSTEM_CATEGORY
        });
      })
    ).subscribe((res: ResponseModel) => {
      this.isLoading.next(false);
      if (res.status) {
        this.searchDataHtml.next(res.data as string);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });
    this.subscriptions.push(sb);
  }

  exportReportErrorOccurredResolved() {
    if(!this.isValidDateForm()) return;

    this.query.startDate = getDateInputWithFormat(this.query.iValidStartDate);
    this.query.endDate = getDateInputWithFormat(this.query.iValidEndDate);
    let params = {};
    if(this.query.systemCode != ""){
      Object.assign(params, {System: this.query.systemCode})
    }
    if(this.query.serviceCode != ""){
      Object.assign(params, {Service: this.query.serviceCode})
    }
    // if(this.query.categoryCode != ""){
    //   Object.assign(params, {Action: this.query.categoryCode})
    // }
    if(this.query.action != ""){
      Object.assign(params, {Action: this.query.action})
    }
    if(this.query.code != ""){
      Object.assign(params, {Error: this.query.code})
    }
    Object.assign(params, {From_date: this.query.startDate});
    Object.assign(params, {To_date: this.query.endDate});
    const fileTime = moment().format("YYYY-MM-DD'T'HH:mm:ss");
    const sb = this.reportService.exportReport(params, CONFIG.API_PATH.REPORT_ERROR_OCCURRED_RESOLVED_FILE).pipe(
      first(),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of({
          // ...EMPTY_SYSTEM_CATEGORY
        });
      })
    ).subscribe((res: any) => {
      this.reportService.downExportExcel(
        res && res.data,
        `report_error_occurred_resolved_${fileTime}.xls`
      );
    });
    this.subscriptions.push(sb);
  }
}
