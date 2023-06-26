import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {StationReportService} from '../../../_services/station-report.service';
import {NgbActiveModal, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HTTPService} from '../../../_services/http.service';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {getDateInputWithFormat} from '../../../../utils/functions';
import {CONFIG} from '../../../../utils/constants';
import {catchError, first} from 'rxjs/operators';
import * as moment from 'moment';
const queryInit = {
  startDate: '',
  iValidStartDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
  endDate: '',
  iValidEndDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
};
@Component({
  selector: 'app-accumul-report',
  templateUrl: './accumul-report.component.html',
  styleUrls: ['./accumul-report.component.scss']
})
export class AccumulReportComponent implements OnInit, AfterViewInit, OnDestroy {
  isSelectService: any;
  isLoading = new BehaviorSubject<boolean>(false);
  searchForm: FormGroup;
  private subscriptions: Subscription[] = [];
  searchDataHtml = new BehaviorSubject<any>(null);
  proCode = new BehaviorSubject('')
  // @ViewChild('monthlyReportWeb') mRW : ElementRef;
  query = {
    ...queryInit
  };
  startDateErrorMsg: string = '';
  endDateErrorMsg: string = '';
  constructor(public rpService: StationReportService,
              public httpService: HTTPService,
              public toastrService: ToastrService,
              private fb: FormBuilder,
              private translateService: TranslateService,
              public modal: NgbActiveModal
  ) {
    this.loadSearchForm();
  }

  ngOnInit() {

  }

  changeService(val: any) {
    this.rpService.chooseReportType.next(val);
    this.isSelectService = val;
  }

  ngAfterViewInit(){
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => {
      this.proCode.next(value);
    });
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      provinceSearch: [null],
      iValidStartDate: [this.query.startDate],
      iValidEndDate: [this.query.endDate]
    });
  }

  isValidDate(dateString): boolean {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    // tslint:disable-next-line:triple-equals
    if (year < 1000 || year > 3000 || month == 0 || month > 12)
      return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    // tslint:disable-next-line:triple-equals
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  }

  isControlInvalid(controlName: string): boolean {
    switch(controlName){
      case 'iValidStartDate':
        return this.startDateErrorMsg && this.startDateErrorMsg.length > 0;
      case 'iValidEndDate':
        return this.endDateErrorMsg && this.endDateErrorMsg.length > 0;
    }
  }

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

  isValidDateForm() : boolean{
    this.startDateErrorMsg = '';
    this.endDateErrorMsg = '';
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    let isValidAllDate = true;

    // required
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

    // validate format and value
    let iValidStartDateStr;
    if (typeof(this.query.iValidStartDate) == 'string'){
      iValidStartDateStr = this.query.iValidStartDate;
      if(/^[0-9]{8}$/.test(iValidStartDateStr)){
        this.query.iValidStartDate = new NgbDate( parseInt(iValidStartDateStr.substr(4,4)),
          parseInt(iValidStartDateStr.substr(2,2)),
          parseInt(iValidStartDateStr.substr(0,2)));
      }
    }
    if(typeof this.query.iValidStartDate == 'object'){
      iValidStartDateStr = this.query.iValidStartDate.day + "/" + this.query.iValidStartDate.month + "/" + this.query.iValidStartDate.year;
    }

    let iValidEndDateStr;
    if (typeof this.query.iValidEndDate == 'string'){
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

  searchReport() {
    if (!this.isValidDateForm()) return;

    this.query.startDate = getDateInputWithFormat(this.query.iValidStartDate);
    this.query.endDate = getDateInputWithFormat(this.query.iValidEndDate);
    let params = {
      p_from_date: this.query.startDate,
      p_to_date: this.query.endDate,
      p_pro : this.proCode.value
    };
    this.isLoading.next(true);
    const sb = this.rpService.searchReport(params, CONFIG.API_PATH.REPORT_STATION_ACUMMUL_HTML)
      .pipe(
        first(),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of({
            // ...EMPTY_SYSTEM_CATEGORY
          });
        })
      )
      .subscribe((res) => {
        this.isLoading.next(false);
        this.searchDataHtml.next(res as string);
        // this.mRW.nativeElement.innerHTML = res;
      });
    this.subscriptions.push(sb);
  }

  exportReport() {
    if (!this.isValidDateForm()) {
      return;
    }

    this.query.startDate = getDateInputWithFormat(this.query.iValidStartDate);
    this.query.endDate = getDateInputWithFormat(this.query.iValidEndDate);
    let params = {
      p_from_date: this.query.startDate,
      p_to_date: this.query.endDate,
      p_pro: this.proCode.value
    };
    const fileTime = moment().format('YYYY-MM-DD\'T\'HH:mm:ss');
    // this.rpService.exportReport(params, CONFIG.API_PATH.REPORT_STATION_MONTHLY_FILE)
    const sb = this.rpService.exportReport(params, CONFIG.API_PATH.REPORT_STATION_MONTHLY_FILE)
      .pipe(
        first(),
        catchError((errorMessage) => {
          this.modal.dismiss(errorMessage);
          return of({
            // ...EMPTY_SYSTEM_CATEGORY
          });
        })
      )
      .subscribe((res) => {
        this.isLoading.next(false);
        this.rpService.saveFile(`reportFileAcummulMonthly${params.p_from_date}-${params.p_to_date}.xlsx`, res);
        // window.open('data:Application/octet-stream,' + encodeURIComponent(res));
      });
    this.subscriptions.push(sb);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
