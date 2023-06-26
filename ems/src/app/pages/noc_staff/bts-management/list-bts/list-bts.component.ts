/* tslint:disable */
// @ts-nocheck
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RequestApiModel } from '../../_models/request-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
import { BtsManagementService } from 'src/app/pages/_services/bts-management.service';
import {BTS} from '../../../_models/bts.model';
import * as moment from 'moment';
import {first} from 'rxjs/operators';


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
  listProvinceToUpdate = [];
  temp = new Observable<any>('');
  searchForm: FormGroup;
  updateForm: FormGroup;
  firstIndex: number = -1;
  lastIndex: number = 0;
  editCache: { [key: string]: { edit: boolean; data } } = {};
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
  @ViewChild('fileCon') fileCon: ElementRef
  private modal: any;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
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
      if (value == '' || value == undefined || value == null) return;
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

  getListDistrict(_proCode) {
    const requestTarget = {
      functionName: 'getListDistrict',
      provinceDTO: {
        proCode: _proCode
      }
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  changeNumberOfRecord(event) {
    this.paginator.pageSize = event.target.value;
    this.eSearch();
  }

  pageChange(page) {
    //reset last edit
    this.stations.value.forEach(station => station.edit = false);
    if(this.stations.value.every(item => item.edit == false)){
      this.isShowOffStation.next(false);
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

  startEdit(item): void {
    if(item.fileCRName != null && item.fileCRName != '' && item.fileCRName != undefined){
      item.edit = true;
      item.fileCREdited = false;
      this.isShowOffStation.next(true);
    } else {
      item.edit = true;
      item.fileCREdited = false;
      this.isShowOffStation.next(false);
    }
  }

  stopEdit(item): void {
    item.edit = false;
    item.fileContractEdited = false;
    if(this.stations.value.every(item => item.edit == false)){
      this.isShowOffStation.next(false);
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
          Object.assign(item, {"edit": false});
          if(item.fileContract != null && item.fileContract != "" && item.fileContract != undefined){
            // const decode = decodeURIComponent(item.fileContractBase64); -- su dung trong truong hop server tra ve base64 dang byte ( da encode )
            // item.fileContractToDisplay = '<a download=\"contractFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ decode + '\">contractFile'+ item.siteOnNims + '.pdf</a>';
            item.fileContractToDisplay = '<a download=\"contractFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ item.fileContract + '\">contractFile'+ item.siteOnNims + '.pdf</a>';
          } else {
            item.fileContractBase64 = null;
            item.fileContract = null;
            item.fileContractToDisplay = "";
          }
          if(item.fileCR != null && item.fileCR != "" && item.fileCR != undefined){
            // const decode = decodeURIComponent(item.fileCRBase64); -- su dung trong truong hop server tra ve base64 dang byte ( da encode )
            // item.fileCRToDisplay = '<a download=\"CRFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ decode + '\">CRFile'+ item.siteOnNims + '.pdf</a>';
            item.fileCRToDisplay = '<a download=\"CRFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ item.fileCR + '\">CRFile'+ item.siteOnNims + '.pdf</a>';
          } else {
            item.fileCRBase64 = null;
            item.fileCR = null;
            item.fileCRToDisplay = "";
          }
          if(item.hasElectricity || item.hasElectricity == 0){
            let electricObj = this.btsManagementService.listYesOrNo.value.find(type => type.value == item.hasElectricity);
            item.hasElectricityStr = electricObj.name;
          }
          if(item.fileCRPath){
            item.fileCR = item.fileCRPath;
          }
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

  openShowOffStation(){
    this.openModal(this.content);
  }

  clickAccept(){
    this.turnOffBTSStation().subscribe(res => {
      if(res.errorCode == 0){
          this.btsManagementService.toastrService.success(res.description);
          this.modalService.dismissAll();
          this.isShowOffStation.next(false);
          this.eSearch();
      }
      else {
        this.btsManagementService.toastrService.error(res.description);
        this.modalService.dismissAll();
      }
    })
  }

  turnOffBTSStation(){
    let lst = [];
    this.stations.value.forEach(item => {
      if(item.edit == true){
        let obj = {
          id: item.id,
          siteOnNims: item.siteOnNims,
          status: 0,
          fileCR: item.fileCR
        }
        lst.push(obj);
      }
    })
    const requestTarget = {
      functionName: "turnOffBTSStation",
      btsStationDTOList: lst
    }

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

  onSelectFile(event: any, item: any, fileType: number) {
    if (event.target.files && event.target.files.length > 0) {
      // validate photo files
      const regex = new RegExp('[^\\s]+(.*?)\\.(pdf)$');
      let countEx = 0;
      // let countSize = 0;
      const lenFile = event.target.files.length;
      const files = [];
      for (let i = 0; i < lenFile; i++) {
        const file = event.target.files[i];
        if (!regex.test(file.name)) {
          countEx++;
          this.translate.get('VALIDATION.REQUIRE_FORMAT', {name: 'File', format: 'pdf'}).subscribe((res: string) => {
            this.btsManagementService.toastrService.error(res);
          });
        } else {
          files.push(file);
        }
      }
      // upload img
      this.uploadFilePDF(files, item, fileType);
    }
  }

  uploadFilePDF(files: any[], item: any , fileType: number) {
    if (files && files.length > 0) {
      const formData: FormData = new FormData();
      files.forEach(file => {
        formData.append('listFileImage', file);
      })
      this.btsManagementService.callAPIUploadFile(formData, 'uploadFile', item.id, fileType)
        .pipe(first())
        .subscribe(res => {
          if (res.errorCode === '0') {
            item.fileCREdited = true;
            item.fileCR = res.data.filePath;
            item.fileCRPathTemp = res.data.filePath;
            item.fileCRNameTemp = res.data.fileName;
            this.isShowOffStation.next(true);
            this.btsManagementService.toastrService.success(res.description);
          } else {
            // show error
            this.btsManagementService.toastrService.error(res.description);
          }
        });
    }
  }
}
