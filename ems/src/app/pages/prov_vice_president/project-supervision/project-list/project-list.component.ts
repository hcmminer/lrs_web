// ts-lint:disable
// @ts-nocheck
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerService} from 'ngx-spinner';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {ProjectSupervision} from 'src/app/pages/_models/project-supervision.model';
import {RequestApiModel} from 'src/app/pages/_models/request-api.model';
import {Station} from 'src/app/pages/_models/station.model';
import {ProjectSupervisionService} from 'src/app/pages/_services/project-supervision.service';
import {StationManagementService} from 'src/app/pages/_services/station-management.service';
import * as moment from 'moment';
import {getDateInputWithFormat} from '../../../../utils/functions';
import {TranslateService} from '@ngx-translate/core';

const queryInit = {
  startDate: '',
  iValidStartDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
};

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, AfterViewInit {
  stations = new BehaviorSubject<ProjectSupervision[]>([]);
  listStations = new BehaviorSubject<any>([]);
  firstIndex: number = -1;
  lastIndex: number = 0;
  provinceSelected = new BehaviorSubject('');
  stationName = new BehaviorSubject('');
  stationCode = new BehaviorSubject('');
  status = new BehaviorSubject<number>(null);
  infrastructureType = new BehaviorSubject('');
  paginator = {page: 1, pageSize: 10, total: 0};
  records = [
    {id: 1, value: 10},
    {id: 2, value: 15},
    {id: 3, value: 20},
    {id: 4, value: 30},
    {id: 5, value: 50},
  ];
  searchForm: FormGroup;
  dateInputForm: FormGroup;
  startDateErrorMsg: string = '';
  query = {
    ...queryInit
  };
  dateSending: string  = '';
  @ViewChild('importHandOverDate') importHandOverDate: ElementRef;
  @ViewChild('fromDate') fromDate: ElementRef;

  constructor(
    private router: Router,
    public fb: FormBuilder,
    public modalService: NgbModal,
    public projectSupervisionService: ProjectSupervisionService,
    public spinner: NgxSpinnerService,
    public translateService: TranslateService
  ) {
    this.loadForm();
  }

  ngOnInit(): void {
    this.getComboBoxData().subscribe(res => {
      this.projectSupervisionService.listProvince.next(res.data.provinceDTOList);
      this.projectSupervisionService.listConstructionStatus.next(res.data.listConstructionStatus);
      this.projectSupervisionService.listPillarType.next(res.data.columnTypeList);
      this.projectSupervisionService.listStationType.next(res.data.stationTypeList);
      this.eSearch();

    });
  }

  ngAfterViewInit(): void {
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => this.provinceSelected.next(value));
    this.searchForm.get('stationCode').valueChanges.subscribe(value => this.stationCode.next(value));
    this.searchForm.get('status').valueChanges.subscribe(value => this.status.next(value));
  }

  loadForm() {
    this.searchForm = this.fb.group({
      provinceSearch: [localStorage.getItem('user-province')],
      stationCode: [''],
      status: [''],
    });
    this.dateInputForm = this.fb.group({
      iValidStartDate: [this.query.startDate]
    });
  }

  showProjectDetail(conId) {
    this.projectSupervisionService.conId.next(conId);
    this.router.navigate(['/project-supervision/project-detail']);
  }

  changeNumberOfRecord(event) {
    this.paginator.pageSize = event.target.value;
    this.eSearch();
  }

  pageChange(page) {
    this.firstIndex = (page - 1) * this.paginator.pageSize;
    this.lastIndex = this.paginator.pageSize * page > this.paginator.total ? this.paginator.total : this.paginator.pageSize * page;
    const listBatch = [];
    this.stations.next([]);
    for (let i = this.firstIndex; i < this.lastIndex; i++) {
      listBatch.push(this.projectSupervisionService.listStation.value[i]);
    }
    this.stations.next(listBatch);
  }

  eSearch() {
    this.searchForm.get('stationCode').setValue(this.searchForm.get('stationCode').value.trim());
    this.conditionSearch().subscribe(res => {
      if (res.errorCode == '0') {
        if (res.data.length != 0) {
          this.firstIndex = 0;
        } else {
          this.firstIndex = -1;
        }
        this.listStations.next(res.data);

        this.listStations.value.map(item => {
          // tslint:disable-next-line:triple-equals
          const stationTypeObj = this.projectSupervisionService.listStationType.value.find(type => type.value == item.stationType);
          // tslint:disable-next-line:triple-equals
          const columnTypeobj = this.projectSupervisionService.listPillarType.value.find(type => type.value == item.columnType);
          // tslint:disable-next-line:triple-equals
          const provinceTypeObj = this.projectSupervisionService.listProvince.value.find(type => type.proCode == item.provinceCode);
          item.stationTypeName = stationTypeObj.name;
          item.columnTypeName = columnTypeobj.name;
          item.province = provinceTypeObj.proCode + '-' + provinceTypeObj.proName;
          // tslint:disable-next-line:triple-equals
          // if (item.startDate == undefined) {
          //   return;
          // } else {
          //   item.startDate = (moment.utc(item.startDate).local().format('DD/MM/YYYY'));
          // }
        });
        this.projectSupervisionService.listStation.next(this.listStations.value);
        this.paginator.total = this.projectSupervisionService.listStation.value.length;
        this.paginator.page = 1;
        this.firstIndex = 0;
        const listBatch = [];
        this.stations.next([]);
        this.lastIndex = this.paginator.pageSize > this.paginator.total ? this.paginator.total : this.paginator.pageSize;
        for (let i = 0; i < this.lastIndex; i++) {
          listBatch.push(this.projectSupervisionService.listStation.value[i]);
        }
        this.stations.next(listBatch);
      }
    });
  }

  openHandOverDate(id) {
    this.projectSupervisionService.conId.next(id);
    this.modalService.open(this.importHandOverDate, {
      size: '600px',
      centered: true,
    });
  }

  OnDateChange(event) {
    this.projectSupervisionService.startDate.next(moment.utc(event, 'DD-MM-YYYY').local().format('DD/MM/YYYY'));
  }

  conditionSearch() {
    const requestTarget = {
      functionName: 'searchConstruction',
      constructionDTO: {
        constructionCode: this.stationCode.value.trim(),
        constructionName: this.stationName.value,
        status: this.status.value,
        provinceCode: this.provinceSelected.value,
        constructionType: this.infrastructureType.value
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  getComboBoxData() {
    const requestTarget = {
      functionName: 'getComboBoxData'
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  saveHandoverDate() {
    if (!this.isValidDateForm()) {
      return;
    }
    this.dateSending = getDateInputWithFormat(this.query.iValidStartDate);
    this.updateConstructionStartDate(this.dateSending).subscribe(res => {
      if (res.errorCode === '0') {
        this.projectSupervisionService.toastrService.success(res.description);
        this.modalService.dismissAll();
        this.dateInputForm.get('iValidStartDate').patchValue(moment.format('DD/MM/YYYY'));
        this.eSearch();
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }

    });
  }

  updateConstructionStartDate(_date) {
    const requestTarget = {
      functionName: 'updateConstructionStartDate',
      constructionDTO: {
        constructionId: this.projectSupervisionService.conId.value,
        startDateStr: _date
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  isValidDate(dateString): boolean {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split('/');
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    // tslint:disable-next-line:triple-equals
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
      return false;
    }

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    // tslint:disable-next-line:triple-equals
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  }

  isControlInvalid(controlName: string): boolean {
    switch (controlName) {
      case 'iValidStartDate':
        return this.startDateErrorMsg && this.startDateErrorMsg.length > 0;
    }
  }

  resetError(controlName: string) {
    switch (controlName) {
      case 'iValidStartDate':
        this.startDateErrorMsg = '';
        break;
    }
  }

  isValidDateForm(): boolean {
    this.startDateErrorMsg = '';
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let isValidAllDate = true;

    // required
    // if(this.query.iValidStartDate == null){
    //   this.startDateErrorMsg = this.translateService.instant('VALIDATION.REQUIRED',
    //     {name: this.translateService.instant('REPORTS.REPORT_ERROR_OCCURRED_RESOLVED.TABLE_TITLE.FROM_DATE')});
    //   isValidAllDate = false;
    // }

    // validate format and value
    let iValidStartDateStr;
    if (typeof (this.query.iValidStartDate) == 'string') {
      iValidStartDateStr = this.query.iValidStartDate;
      if (/^[0-9]{8}$/.test(iValidStartDateStr)) {
        this.query.iValidStartDate = new NgbDate(parseInt(iValidStartDateStr.substr(4, 4)),
          parseInt(iValidStartDateStr.substr(2, 2)),
          parseInt(iValidStartDateStr.substr(0, 2)));
      }
    }
    if (typeof this.query.iValidStartDate == 'object') {
      iValidStartDateStr = this.query.iValidStartDate.day + '/' + this.query.iValidStartDate.month + '/' + this.query.iValidStartDate.year;
    }

    if (!this.isValidDate(iValidStartDateStr)) {
      this.startDateErrorMsg = this.translateService.instant('VALIDATION.INCORRECT' , {
        name: this.translateService.instant('LIST_CATEGORY_WORK.CON_DATE')
      });
      isValidAllDate = false;
    } else {
      if (new Date(this.query.iValidStartDate['year'], this.query.iValidStartDate['month'] - 1, this.query.iValidStartDate['day']) < currentDate) {
        this.startDateErrorMsg = this.translateService.instant('VALIDATION.AFTER_CURRENT_DATE',
          {name: this.translateService.instant('POPUP.INSERT_DELIVERY.HAND_OVER_DATE')});
        isValidAllDate = false;
      }
    }

    return isValidAllDate;
  }


}
