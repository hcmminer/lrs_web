/* tslint:disable */
// @ts-nocheck
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, forkJoin, Subject, Subscription} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Station} from '../../_models/station.model';
import {StationManagementService} from '../../_services/station-management.service';
import {RequestApiModel} from '../../_models/request-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {HTTPService} from '../../_services/http.service';
import * as moment from 'moment';

@Component({
  selector: 'app-export-reports-corp',
  templateUrl: './export-reports-corp.component.html',
  styleUrls: ['./export-reports-corp.component.scss']
})
export class ExportReportsCorpComponent implements OnInit, AfterViewInit {
  private subscriptions: Subscription[] = [];
  listStations = new BehaviorSubject<any>([]);
  searchForm: FormGroup; 
  provinceSelected = new BehaviorSubject('');
  stationName = new BehaviorSubject('');
  stationCode = new BehaviorSubject('');
  status = new BehaviorSubject<number>(null);
  infrastructureType = new BehaviorSubject('');
  @ViewChild('formSearch') formSearch: ElementRef;
  @ViewChild('init') init: ElementRef;
  @ViewChild('content') content: ElementRef;
  private modal: any;

  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public stationManagementService: StationManagementService,
    public spinner: NgxSpinnerService,
    private http: HTTPService
  ) {
    this.loadForm();

  }

  ngOnInit(): void {
    this.http.checkError.next(false);
    this.getComboBoxData().subscribe(res => {
      if(res.errorCode == '0'){
        this.stationManagementService.listProvince.next(res.data.provinceDTOList);
        this.stationManagementService.listInfrastructureType.next(res.data.constructionTypeDTOList);
        this.stationManagementService.listConstructionStatus.next(res.data.listConstructionStatus);
        this.stationManagementService.listPositionType.next(res.data.positionTypeList);
        this.stationManagementService.listPillarType.next(res.data.columnTypeList);
        this.stationManagementService.listStationType.next(res.data.stationTypeList);
        this.eSearch();

      }
    })
  };

  ngAfterViewInit(): void {
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => this.provinceSelected.next(value));
    this.searchForm.get('status').valueChanges.subscribe(value => this.status.next(value));
    this.searchForm.get('infrastructureType').valueChanges.subscribe(value => this.infrastructureType.next(value));
  }

  eCreate(){}

  eSearch(){}

  loadForm() {
    this.searchForm = this.fb.group({
      provinceSearch: [''],
      stationCode: [''],
      stationName: [''],
      infrastructureType: [''],
      status: [null],
    });
  }

  getComboBoxData(){
    const requestTarget = {
      functionName: 'getComboBoxData',
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  ngOnDestroy(){
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
