/* tslint:disable */
// @ts-nocheck
import {AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {BehaviorSubject, forkJoin, of, Subject, Subscription} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RequestApiModel} from '../../_models/request-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {HTTPService} from '../../_services/http.service';
import {StationProgressReportService} from '../../../_services/station-progress-report.service';
import {getDateInputWithFormat} from '../../../../utils/functions';
import {CONFIG} from '../../../../utils/constants';
import {catchError, first} from 'rxjs/operators';
import * as moment from 'moment';


@Component({
  selector: 'app-export-reports-corp',
  templateUrl: './export-reports-corp.component.html',
  styleUrls: ['./export-reports-corp.component.scss']
})

export class ExportReportsCorpComponent implements OnInit, AfterViewInit, OnDestroy {
  searchForm: FormGroup;
  provinceSelected = new BehaviorSubject('');
  isLoading = new BehaviorSubject<boolean>(false);
  status = new BehaviorSubject('');
  infrastructureType = new BehaviorSubject('');
  searchDataHtml = new BehaviorSubject<any>(null);
  private subscriptions: Subscription[] = [];
  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public service: StationProgressReportService
  ) {
    this.loadForm();

  }

  ngOnInit(): void {
    this.getComboBoxData().subscribe(res => {
      if(res.errorCode == '0'){
        this.service.listProvince.next(res.data.provinceDTOList);
        this.service.listInfrastructureType.next(res.data.constructionTypeDTOList);
        this.service.listConstructionStatus.next(res.data.listConstructionStatus);
      }
    })
  };

  ngAfterViewInit(): void {
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => this.provinceSelected.next(value));
    this.searchForm.get('status').valueChanges.subscribe(value => this.status.next(value));
    this.searchForm.get('infrastructureType').valueChanges.subscribe(value => this.infrastructureType.next(value));
  }

  searchReport() {
    let params = {
      province : this.provinceSelected.value,
      construction_status: this.status.value,
      construction_type: this.infrastructureType.value
    };
    this.isLoading.next(true);
    const sb = this.service.searchReport(params, CONFIG.API_PATH.REPORT_STATION_PROGRESS_HTML)
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
      });
    this.subscriptions.push(sb);
  }

  exportReport() {
    let params = {
      province : this.provinceSelected.value,
      construction_status: this.status.value,
      construction_type: this.infrastructureType.value
    };
    const fileTime = moment().format('YYYY-MM-DD\'HH:mm:ss');
    // const sb =
    const sb = this.service.exportReport(params, CONFIG.API_PATH.REPORT_STATION_PROGRESS_FILE)
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
        this.service.saveFile(`reportFileProgress${fileTime}.xlsx`, res);
        // window.open('data:Application/octet-stream,' + encodeURIComponent(res));
      });
    this.subscriptions.push(sb);
  }

  loadForm() {
    this.searchForm = this.fb.group({
      provinceSearch: [null],
      infrastructureType: [null],
      status: [null],
    });
  }

  getComboBoxData(){
    const requestTarget = {
      functionName: 'getComboBoxData',
    };
    return this.service.callAPICommon(requestTarget as RequestApiModel);
  }

  ngOnDestroy(){
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
