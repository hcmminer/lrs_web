/* tslint:disable */
// @ts-nocheck
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import { fadeInItems } from '@angular/material/menu';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ProjectSupervision } from 'src/app/pages/_models/project-supervision.model';
import { RequestApiModel } from 'src/app/pages/_models/request-api.model';
import { Station } from 'src/app/pages/_models/station.model';
import { ProjectSupervisionService } from 'src/app/pages/_services/project-supervision.service';
import { StationManagementService } from 'src/app/pages/_services/station-management.service';
import {AuthService} from '../../../../modules/auth';
import * as moment from 'moment';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, AfterViewInit {
  stations = new BehaviorSubject<ProjectSupervision[]>([]);
  listStations = new BehaviorSubject<any>([]);
  provinceSelected = new BehaviorSubject('');
  stationName = new BehaviorSubject('');
  stationCode = new BehaviorSubject('');
  status = new BehaviorSubject<number>(null);
  infrastructureType = new BehaviorSubject('');
  firstIndex: number = -1;
  lastIndex: number = 0;
  paginator = {page: 1, pageSize: 10, total: 0};
  records = [
    {id: 1, value: 10},
    {id: 2, value: 15},
    {id: 3, value: 20},
    {id: 4, value: 30},
    {id: 5, value: 50},
  ];

  searchForm: FormGroup;
  @ViewChild('importHandOverDate') importHandOverDate: ElementRef;
  constructor(
    private authService: AuthService,
    private router: Router,
    public fb: FormBuilder,
    public modalService: NgbModal,
    public projectSupervisionService: ProjectSupervisionService,
    public spinner: NgxSpinnerService
  ) {
    this.loadForm();
  }

  ngOnInit(): void{
    this.getComboBoxData().subscribe(res => {
      if(res.errorCode == '0'){
        this.projectSupervisionService.listProvince.next(res.data.provinceDTOList);
        this.projectSupervisionService.listConstructionStatus.next(res.data.listConstructionStatus);
        this.projectSupervisionService.listPillarType.next(res.data.columnTypeList);
        this.projectSupervisionService.listStationType.next(res.data.stationTypeList);
        this.eSearch();
      }
    })
  }

  ngAfterViewInit(): void {
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => this.provinceSelected.next(value));
    this.searchForm.get('stationCode').valueChanges.subscribe(value => this.stationCode.next(value));
    this.searchForm.get('status').valueChanges.subscribe(value => this.status.next(value));
  }

  loadForm(){
    this.searchForm = this.fb.group({
      provinceSearch: [''],
      stationCode: [''],
      status: [''],
    });
  }

  showProjectDetail(conId) {
    this.projectSupervisionService.conId.next(conId);
    this.router.navigate(['/project-supervision/project-detail']);
  }

  something(){
    console.log('hello');
  }

  changeNumberOfRecord(event){
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

  eSearch(){
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
        let stationTypeObj = this.projectSupervisionService.listStationType.value.find(type => type.value == item.stationType)
        let columnTypeobj =  this.projectSupervisionService.listPillarType.value.find(type => type.value == item.columnType);
        let provinceTypeObj = this.projectSupervisionService.listProvince.value.find(type => type.proCode == item.provinceCode);
        item.stationTypeName = stationTypeObj.name;
        item.columnTypeName = columnTypeobj.name;
        item.province = provinceTypeObj.proCode +'-'+provinceTypeObj.proName;
        // if (item.startDate == undefined || item.startDate == null || item.startDate == "") {
        //   item.startDate == ""
        // } else {
        //   item.startDate = moment.utc(item.startDate).local().format('DD/MM/YYYY HH:mm:ss');
        // }
      })
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
  openHandOverDate(){
    this.modalService.open(this.importHandOverDate,{
      size: '600px',
      centered: true,
    });
  }

  conditionSearch() {
    const requestTarget = {
      functionName: 'searchConstruction',
      constructionDTO: {
        constructionCode: this.searchForm.get('stationCode').value.trim(),
        // constructionName: this.searchForm.get('stationName').value.trim(),
        status: this.status.value,
        provinceCode: this.provinceSelected.value,
        constructionType: this.infrastructureType.value
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  getComboBoxData(){
    const requestTarget = {
      functionName: 'getComboBoxData',
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }
  
}
