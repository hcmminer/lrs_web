/* tslint:disable */
// @ts-nocheck
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BTS } from '../../_models/bts.model';
import { BtsManagementService } from '../../_services/bts-management.service';
import { RequestApiModel } from '../../_models/request-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
import { Console } from 'console';

@Component({
  selector: 'app-list-bts',
  templateUrl: './list-bts.component.html',
  styleUrls: ['./list-bts.component.scss']
})
export class ListBtsComponent implements OnInit, AfterViewInit {
  stations = new BehaviorSubject<BTS[]>([]);
  files: any[];
  listStations = new BehaviorSubject<any>([]);
  searchForm: FormGroup;
  firstIndex: number = 0;
  lastIndex: number;
  paginator = { page: 1, pageSize: 10, total: 0 };
  records = [
    { id: 1, value: 10 },
    { id: 2, value: 15 },
    { id: 3, value: 20 },
    { id: 4, value: 30 },
    { id: 5, value: 50 },
  ];
  @ViewChild('formSearch') formSearch: ElementRef;
  @ViewChild('init') init: ElementRef;
  @ViewChild('content') content: ElementRef;
  private modal: any;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public btsManagementService: BtsManagementService,
    public spinner: NgxSpinnerService
  ) {
    this.loadForm();
  }

  ngOnInit(): void {
    this.btsManagementService.btnSave.subscribe(val => {
      if (val) {
        this.init.nativeElement.style.display = 'none';
        this.formSearch.nativeElement.style.display = '';
        this.btsManagementService.btnSave.next(false);
        this.eSearch();
      }
    })
    this.getComboBoxDataBTSStation().subscribe(res => {
        this.btsManagementService.listProvince.next(res.data.provinceDTOList);
        this.btsManagementService.listStationStatus.next(res.data.listBTSStationStatus);
        this.btsManagementService.listApprovedStatus.next(res.data.listApprovedStationStatus);
        this.btsManagementService.listYesOrNo.next(res.data.listYesOrNo);
        // this.btsManagementService.listDistrict.next(res[2].data);
        this.eSearch();
    });
  }

doSth(event){
  console.log(event.target.value)
}

  ngAfterViewInit(): void {
    this.searchForm.get('stationCode').valueChanges.subscribe(value => this.btsManagementService.stationCode.next(value));
    this.searchForm.get('stationName').valueChanges.subscribe(value => this.btsManagementService.stationName.next(value));
    this.searchForm.get('approveStatus').valueChanges.subscribe(value => this.btsManagementService.approvedStatusSelected.next(value));
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => {
      this.btsManagementService.provinceSelected.next(value);
      if(value == '' || value == undefined || value == null) return;
      this.getListDistrict(value).subscribe(res => {
        if (res.errorCode == '0') {
          this.btsManagementService.listDistrict.next(res.data);
        }
        else {
          this.btsManagementService.toastrService.error(res.description);
        }
      });
    });
    console.log(this.btsManagementService.provinceSelected);
    this.searchForm.get('districtSearch').valueChanges.subscribe(value =>{
      this.btsManagementService.districtSelected.next(value);
    });
    console.log(this.btsManagementService.districtSelected)
    this.searchForm.get('stationStatus').valueChanges.subscribe(value => this.btsManagementService.stationStatusSelected.next(value));
    this.searchForm.get('CRStation').valueChanges.subscribe(value => this.btsManagementService.hasCRFile.next(value));
    this.searchForm.get('contractedStation').valueChanges.subscribe(value => this.btsManagementService.hasContractFile.next(value));
  }

  displayPopup() {
    this.openModal(this.content);
  }

  openModal(content) {
    this.modal = this.modalService.open(content, {
      centered: true,
    });
  }

  clickAccept() {

  }

  something() {
    console.log('hello');
  }

  showDetail() {
    this.router.navigate(['/station-management/station-detail']);
  }

  loadForm() {
    this.searchForm = this.fb.group({
      stationCode: [''],
      stationName: [''],
      stationStatus: [''],
      provinceSearch: [''],
      districtSearch: [''],
      approveStatus: [''],
      infrastructureType: [''],
      contractedStation: [''],
      CRStation: ['']
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
      listBatch.push(this.btsManagementService.listStation.value[i]);
    }
    this.stations.next(listBatch);
  }

  eCreate() {
    this.init.nativeElement.style.display = '';
    this.formSearch.nativeElement.style.display = 'none';
  }

  eSearch() {
    this.conditionSearch().subscribe(res => {
      if (res.errorCode == '0') {
        if (res.data.length != 0) {
          this.firstIndex = 0;
        } else {
          this.firstIndex = -1;
        }
        this.listStations.next(res.data);
        this.listStations.value.map(item => {
          let provinceTypeObj = this.btsManagementService.listProvince.value.find(type => type.proId == item.province);
          // let districtTypeObj = this.btsManagementService.listDistrict.value.find(type => type.distId == item.district);
          let stationStatusTypeObj = this.btsManagementService.listStationStatus.value.find(type => type.value == item.status);
          let approvedStatusTypeObj = this.btsManagementService.listApprovedStatus.value.find(type => type.value == item.approvedStatus);
          item.approvedStatus = approvedStatusTypeObj.name;
          item.province = provinceTypeObj.proId;
          item.status = stationStatusTypeObj.name;
          item.rentalPrice = this.numberWithCommas(+item.rentalFee * item.periodOfRent);
          item.rentalFee = this.numberWithCommas(item.rentalFee);
        
          // item.district = districtTypeObj.name;
        })
        this.btsManagementService.listStation.next(this.listStations.value);
        this.paginator.total = this.btsManagementService.listStation.value.length;
        this.paginator.page = 1;
        const listBatch = [];
        this.stations.next([]);
        this.lastIndex = this.paginator.pageSize > this.paginator.total ? this.paginator.total : this.paginator.pageSize;
        for (let i = 0; i < this.lastIndex; i++) {
          listBatch.push(this.btsManagementService.listStation.value[i]);
        }
        this.stations.next(listBatch);
      }
    });
    this.searchForm.reset();
  }
  changeSelect(item){
    item.isChecked = !item.isChecked;
    // this.btsManagementService.itemToUpdate.next(item);
    // console.log(this.btsManagementService.itemToUpdate);
    
    let check = false;
    for(let i =0; i< this.stations.value.length; i++){
      if(this.stations.value[i].isChecked){
        check = true;
        break;
      }
    }
    if(check){
      this.isShowUpdate.next(true);
    }else{
      this.isShowUpdate.next(false);
    }
  }

  
  conditionSearch() {
    const requestTarget = {
      functionName: 'searchBTSStation',
      btsStationDTO: {
        siteOnNims: this.btsManagementService.stationCode.value,
        name: this.btsManagementService.stationName.value,
        status: this.btsManagementService.stationStatusSelected.value,
        province: this.btsManagementService.provinceSelected.value,
        district: this.btsManagementService.districtSelected.value,
        appovedStatus: this.btsManagementService.approvedStatusSelected.value,
        hasCRFile: this.btsManagementService.hasCRFile.value,
        hasContractFile: this.btsManagementService.hasContractFile.value
      }
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }
  
  getComboBoxDataBTSStation(){
    const requestTarget = {
      functionName: 'getComboBoxDataBTSStation'
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  onFileChange(event){
    this.files = event.target.files;
  }

  getListDistrict(_proCode) {
    const requestTarget = {
      functionName: 'getListDistrict',
      provinceDTO: {
        proCode: _proCode
      }
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  numberWithCommas(x) {
    if (x) {
      return this.replaceNumber(x.toString().split('.').join(''));
    } else {
      return '0';
    }
  }

  replaceNumber(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
 