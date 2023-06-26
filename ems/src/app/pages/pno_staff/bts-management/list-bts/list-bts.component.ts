
import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { BtsManagementService } from 'src/app/pages/_services/bts-management.service';
import { BTS } from 'src/app/pages/_models/bts.model';
import * as moment from 'moment';
import {DataUtilities} from '../../../../utils/data';
import {RequestApiModel} from '../../../_models/request-api.model';

@Component({
  selector: 'app-list-bts',
  templateUrl: './list-bts.component.html',
  styleUrls: ['./list-bts.component.scss']
})
export class ListBtsComponent implements OnInit, AfterViewInit {
  stations = new BehaviorSubject<BTS[]>([]);
  files: any[];
  listStations = new BehaviorSubject<any>([]);
  listStationsToUpdate = new BehaviorSubject<any>([]);
  hasError = new BehaviorSubject<boolean>(false);
  hasErrorLong = new BehaviorSubject<boolean>(false);
  hasErrorLat = new BehaviorSubject<boolean>(false);
  listProvinceToUpdate = [];
  searchForm: FormGroup;
  updateForm: FormGroup;
  firstIndex: number = -1;
  lastIndex: number = 0;
  latTest = new FormControl('', Validators.required);
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
  @ViewChild('tempVar') tempVar: ElementRef;
  @ViewChild('endDate') endDate: ElementRef;
  private modal: any;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public btsManagementService: BtsManagementService,
    public spinner: NgxSpinnerService,
    public cd: ChangeDetectorRef
  ) {
    this.loadForm();
  }

  ngOnInit(): void {
    this.getComboBoxDataBTSStation().subscribe(res => {
      this.btsManagementService.listProvince.next(res.data.provinceDTOList);
      this.btsManagementService.listStationStatus.next(res.data.listBTSStationStatus);
      this.btsManagementService.listApprovedStatus.next(res.data.listApprovedStationStatus);
      this.btsManagementService.listYesOrNo.next(res.data.listYesOrNo);
      this.listProvinceToUpdate = res.data.provinceDTOList;
      // this.btsManagementService.listDistrict.next(res[2].data);
      this.eSearch();
    });
  }

  ngAfterViewInit(): void {
    this.searchForm.get('stationCode').valueChanges.subscribe(value => this.btsManagementService.stationCode.next(value));
    this.searchForm.get('stationName').valueChanges.subscribe(value => this.btsManagementService.stationName.next(value));
    this.searchForm.get('approveStatus').valueChanges.subscribe(value => this.btsManagementService.approvedStatusSelected.next(value));
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => {
      this.btsManagementService.provinceSelected.next(value);
      if (value == '' || value == undefined || value == null) { return; }
      this.getListDistrict(value).subscribe(res => {
        if (res.errorCode == '0') {
          this.btsManagementService.listDistrict.next(res.data);
        }
        else {
          this.btsManagementService.toastrService.error(res.description);
        }
      });
    });
    this.searchForm.get('districtSearch').valueChanges.subscribe(value => {
      this.btsManagementService.districtSelected.next(value);
    });
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

  showDetail() {
    this.router.navigate(['/station-management/station-detail']);
  }

  loadForm() {
    this.searchForm = this.fb.group({
      stationCode: [''],
      stationName: [''],
      stationStatus: [null],
      provinceSearch: [''],
      districtSearch: [''],
      approveStatus: [null],
      infrastructureType: [''],
      contractedStation: [null],
      CRStation: [null]
    });
  }

  changeNumberOfRecord(event) {
    this.paginator.pageSize = event.target.value;
    this.eSearch();
  }

  pageChange(page) {
    // reset last edit
    this.stations.value.forEach(station => station.edit = false);
    if (this.stations.value.every(item => item.edit == false)){
      this.isShowUpdate.next(false);
    }
    this.firstIndex = (page - 1) * this.paginator.pageSize;
    this.lastIndex = this.paginator.pageSize * page > this.paginator.total ? this.paginator.total : this.paginator.pageSize * page;
    const listBatch = [];
    this.stations.next([]);
    for (let i = this.firstIndex; i < this.lastIndex; i++) {
      listBatch.push(this.btsManagementService.listStation.value[i]);
    }
    this.stations.next(listBatch);
    // this.updateEditCache();
  }

  startEdit(row): void {
    row.edit = true;
    this.isShowUpdate.next(true);
  }

  stopEdit(row): void {
    row.edit = false;
    if (this.stations.value.every(it => it.edit == false)){
      this.isShowUpdate.next(false);
    }
  }

  eCreate() {
    this.router.navigate(['bts-management/init-bts']);
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
          Object.assign(item, {edit: false});
          if (item.fileContract){
            // const decode = decodeURIComponent(item.fileContractBase64); -- su dung trong truong hop server tra ve base64 dang byte ( da encode )
            // item.fileContractToDisplay = '<a download=\"contractFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ decode + '\">contractFile'+ item.siteOnNims + '.pdf</a>';
            // tslint:disable-next-line:max-line-length
            item.fileContractToDisplay = '<a download=\"contractFile' + item.siteOnNims + '.pdf\" href=\"data:application/pdf;base64,' + item.fileContract + '\">contractFile' + item.siteOnNims + '.pdf</a>';
          } else {
            item.fileContractBase64 = null;
            item.fileContract = null;
            item.fileContractToDisplay = '';
          }
          if (item.fileCR){
            // const decode = decodeURIComponent(item.fileCRBase64); -- su dung trong truong hop server tra ve base64 dang byte ( da encode )
            // item.fileCRToDisplay = '<a download=\"CRFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ decode + '\">CRFile'+ item.siteOnNims + '.pdf</a>';
            item.fileCRToDisplay = '<a download=\"CRFile' + item.siteOnNims + '.pdf\" href=\"data:application/pdf;base64,' + item.fileCR + '\">CRFile' + item.siteOnNims + '.pdf</a>';
          } else {
            item.fileCRBase64 = null;
            item.fileCR = null;
            item.fileCRToDisplay = '';
          }
          if(item.hasElectricity || item.hasElectricity == 0){
            let electricObj = this.btsManagementService.listYesOrNo.value.find(type => type.value == item.hasElectricity);
            item.hasElectricityStr = electricObj.name;
          }
        });
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
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    // const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array.buffer], { type: 'application/pdf'});
    const blobURL = URL.createObjectURL(blob);
    return blobURL;
  }

  toBase64Contract(event, row){
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function() {
      row.fileContractBase64 = reader.result.toString().substring(28);
    };
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
        approvedStatus: this.btsManagementService.approvedStatusSelected.value,
        hasCRFile: this.btsManagementService.hasCRFile.value,
        hasContractFile: this.btsManagementService.hasContractFile.value
      }
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  getComboBoxDataBTSStation() {
    const requestTarget = {
      functionName: 'getComboBoxDataBTSStation'
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
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

  formatStartDateToSend(event, row){
    row.startDatePayment = moment(event.value).local().format('DD/MM/YYYY');
  }

  formatEndDateToSend(event, row){
    row.endDatePayment = moment(event.value).local().format('DD/MM/YYYY');
  }

  setElectricStatus(event ,row){
    row.hasElectricity = event.target.value;
  }

  checkCoordinateValidation(event, type){
    switch(type){
      case 'Long':
        var term = event.target.value;
        var re = new RegExp('^[0-9]*\.?[0-9]*$');
        if (!re.test(term)) {
          this.hasErrorLong.next(true);
        }
        else this.hasErrorLong.next(false);
        break;
      case 'Lat':
        var term = event.target.value;
        var re = new RegExp('^[0-9]*\.?[0-9]*$');
        if (!re.test(term)) {
          this.hasErrorLat.next(true);
        }
        else this.hasErrorLat.next(false);
        break;
    }
  }

  updateToDB(){
    this.updateBTSStation().subscribe(res => {
      if (res.errorCode == 0){
        this.stations.value.map(item => item.edit = false);
        this.isShowUpdate.next(false);
        this.btsManagementService.toastrService.success(res.description);
        this.eSearch();
      }
      else {
        this.btsManagementService.toastrService.error(res.description);
      }
    });
  }

  updateBTSStation() {
    const lst = [];
    this.stations.value.forEach(item => {
      if (item.edit == true){
        const obj = {
          id: item.id,
          siteOnNims: item.siteOnNims,
          siteOnContract: item.siteOnContract,
          contractNo: item.contractNo,
          latitude: item.latitude,
          longitude: item.longitude
        };
        lst.push(obj);
      }
    });
    const requestTarget = {
      functionName: 'updateBTSStation',
      btsStationDTOList: lst
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  getFile(filePath){
    const request = {
      functionName :"getFile",
      filePath: filePath
    }
    this.btsManagementService.callAPICommon(request as RequestApiModel).subscribe(res => {
      if (res.errorCode == '0'){
        const downloadLink = document.createElement("a");
        const fileName = `${filePath}.pdf`;
        downloadLink.href = 'data:application/pdf;base64,'+ res.data.fileContent;
        downloadLink.download = fileName;
        downloadLink.click();
      }
    })
  }

}
