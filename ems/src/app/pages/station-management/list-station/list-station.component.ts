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
import {catchError, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-list-station',
  templateUrl: './list-station.component.html',
  styleUrls: ['./list-station.component.scss']
})
export class ListStationComponent implements OnInit, AfterViewInit {
  stations = new BehaviorSubject<Station[]>([]);
  private subscriptions: Subscription[] = [];
  listStations = new BehaviorSubject<any>([]);
  searchForm: FormGroup; 
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
    // this.searchForm.get('stationName').valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
    //   this.searchForm.get('stationName').patchValue(value);
    //   let v = this.searchForm.get('stationName').value.trim();
    //   // this.searchForm.get('stationName').patchValue(v);
    //   this.stationName.next(v);
    // }); -- > Error Maximum call stack size exceeded
    // this.searchForm.get('stationCode').valueChanges.subscribe(value => this.stationCode.next(value));
    this.searchForm.get('status').valueChanges.subscribe(value => this.status.next(value));
    this.searchForm.get('infrastructureType').valueChanges.subscribe(value => this.infrastructureType.next(value));
  }

  displayPopup(conId) {
    this.openModal(this.content);
    this.stationManagementService.conId.next(conId);
  }

  openModal(content) {
    this.modal = this.modalService.open(content, {
      centered: true,
    });
  }

  editDirect(conId) {
    this.stationManagementService.conId.next(conId);
    this.router.navigate(['/station-management/edit-station'])
  }

  showDetail(conId) {
    this.stationManagementService.conId.next(conId);
    this.router.navigate(['/station-management/station-detail']);
  }

  deleteDirect(){
    this.deleteConstruction().subscribe(res => {
      if(res.errorCode == '0'){
        this.stationManagementService.toastrService.success(res.description);
        this.modalService.dismissAll();
        this.eSearch();
      }
      else {
        this.stationManagementService.toastrService.error(res.description);
        this.modalService.dismissAll();
      }
    })
  }

  loadForm() {
    this.searchForm = this.fb.group({
      provinceSearch: [''],
      stationCode: [''],
      stationName: [''],
      infrastructureType: [''],
      status: [null],
    });
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
      listBatch.push(this.stationManagementService.listStation.value[i]);
    }
    this.stations.next(listBatch);
  }

  eCreate() {
    this.router.navigate(['/station-management/init-station']);
  }

  eSearch() {
    this.searchForm.get('stationName').setValue(this.searchForm.get('stationName').value.trim());
    this.searchForm.get('stationCode').setValue(this.searchForm.get('stationCode').value.trim());
    this.conditionSearch().subscribe(res => {
      if (res.errorCode == '0') {
        if (res.data.length != 0) {
          this.firstIndex = 0;
        } else {
          this.firstIndex = -1;
        }
        this.listStations.next(res.data);
        this.listStations.value.forEach(item => {
          let stationTypeObj = this.stationManagementService.listStationType.value.find(type => type.value == item.stationType);
          let columnTypeobj =  this.stationManagementService.listPillarType.value.find(type => type.value == item.columnType);
          let provinceTypeObj = this.stationManagementService.listProvince.value.find(type => type.proCode == item.provinceCode);
          item.stationTypeName = stationTypeObj.name;
          item.columnTypeName = columnTypeobj.name;
          item.province = provinceTypeObj.proCode +'-'+provinceTypeObj.proName;
          if (item.startDate == undefined || item.startDate == null) {
            item.startDate = ""
          } else {
            item.startDate = moment.utc(item.startDate).local().format('DD/MM/YYYY HH:mm:ss');
          }
        })
        this.stationManagementService.listStation.next(this.listStations.value);
        this.paginator.total = this.stationManagementService.listStation.value.length;
        this.paginator.page = 1;
        const listBatch = [];
        this.stations.next([]);
        this.lastIndex = this.paginator.pageSize > this.paginator.total ? this.paginator.total : this.paginator.pageSize;
        for (let i = 0; i < this.lastIndex; i++) {
          listBatch.push(this.stationManagementService.listStation.value[i]);
        }
        this.stations.next(listBatch);
      }
    });

  }

  conditionSearch() {
    const requestTarget = {
      functionName: 'searchConstructionForCM',
      constructionDTO: {
        constructionCode: this.searchForm.get('stationCode').value.trim(),
        constructionName: this.searchForm.get('stationName').value.trim(),
        status: this.status.value,
        provinceCode: this.provinceSelected.value,
        constructionType: this.infrastructureType.value
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  deleteConstruction() {
    const requestTarget = {
      functionName: 'deleteConstruction',
      constructionDTO: {
        constructionId: this.stationManagementService.conId.value
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
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
