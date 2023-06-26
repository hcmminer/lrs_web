/* tslint:disable */
// @ts-nocheck
import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RequestApiModel} from '../../_models/request-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {BtsManagementService} from 'src/app/pages/_services/bts-management.service';
import {BTS} from 'src/app/pages/_models/bts.model';
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
  listYesOrNoToUpdate = [];
  searchForm: FormGroup;
  updateForm: FormGroup;
  firstIndex: number = -1;
  lastIndex: number = 0;
  editCache: { [key: string]: { edit: boolean; data } } = {};
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
  @ViewChild('tempVar') tempVar: ElementRef;
  @ViewChild('endDate') endDate: ElementRef;
  @ViewChild('fileCon') fileCon: ElementRef;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  private modal: any;

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
      this.btsManagementService.listProvince.next(res.data.provinceDTOList.filter(p => p.proCode == localStorage.getItem('user-province')));
      this.btsManagementService.listStationStatus.next(res.data.listBTSStationStatus);
      this.btsManagementService.listApprovedStatus.next(res.data.listApprovedStationStatus);
      this.btsManagementService.listYesOrNo.next(res.data.listYesOrNo);
      this.listProvinceToUpdate = this.btsManagementService.listProvince.value;
      this.listYesOrNoToUpdate = res.data.listYesOrNo;
      this.getListDistrict(localStorage.getItem('user-province')).subscribe(response => {
        if (response.errorCode == '0') {
          this.btsManagementService.listDistrict.next(response.data);
        } else {
          this.btsManagementService.toastrService.error(response.description);
        }
      });
      // this.btsManagementService.listDistrict.next(res[2].data);
      this.eSearch();
    });
  }

  ngAfterViewInit(): void {
    this.searchForm.get('stationCode').valueChanges.subscribe(value => this.btsManagementService.stationCode.next(value));
    this.searchForm.get('stationName').valueChanges.subscribe(value => this.btsManagementService.stationName.next(value));
    this.searchForm.get('approveStatus').valueChanges.subscribe(value => this.btsManagementService.approvedStatusSelected.next(value));
    this.searchForm.get('districtSearch').valueChanges.subscribe(value => {
      this.btsManagementService.districtSelected.next(value);
    });
    this.searchForm.get('stationStatus').valueChanges.subscribe(value => this.btsManagementService.stationStatusSelected.next(value));
    this.searchForm.get('CRStation').valueChanges.subscribe(value => this.btsManagementService.hasCRFile.next(value));
    this.searchForm.get('contractedStation').valueChanges.subscribe(value => this.btsManagementService.hasContractFile.next(value));
    this.searchForm.get('provinceSearch').valueChanges.subscribe(value => this.getListDistrict(value).subscribe(res => {
      this.btsManagementService.listDistrict.next(res.data);
    }));
  }

  displayPopup() {
    this.openModal(this.content);
  }

  restrictLength(event){
    event.target.value = event.target.value.replace(/\D/g, '');
    if(+event.target.value.length >= +event.target.maxLength){
      event.target.value = event.target.value.slice(0, +event.target.maxLength);
    }
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
      provinceSearch: [localStorage.getItem('user-province')],
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
    if (this.stations.value.every(item => item.edit == false)) {
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

  startEdit(item): void {
    item.edit = true;
    this.isShowUpdate.next(true);
    item.fileContractEdited = false;
    if (item.provinceCode) {
      this.getListDistrict(item.provinceCode).subscribe(res => {
        item.listDistrictToUpdate = res.data;
      });
    }
  }

  stopEdit(item): void {
    item.edit = false;
    item.listDistrictToUpdate = [];
    item.fileContractEdited = false;
    if (this.stations.value.every(item => item.edit == false)) {
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
          // if (item.fileContract) {
          //   // const decode = decodeURIComponent(item.fileContractBase64); -- su dung trong truong hop server tra ve base64 dang byte ( da encode )
          //   // item.fileContractToDisplay = '<a download=\"contractFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ decode + '\">contractFile'+ item.siteOnNims + '.pdf</a>';
          //   item.fileContractToDisplay = '<a download=\"contractFile' + item.siteOnNims + '.pdf\" href=\"data:application/pdf;base64,' + item.fileContract + '\">contractFile' + item.siteOnNims + '.pdf</a>';
          //   item.fileContractBase64 = item.fileContract;
          // } else {
          //   item.fileContractBase64 = null;
          //   item.fileContract = null;
          //   item.fileContractToDisplay = '';
          // }
          // if (item.fileCR) {
          //   // const decode = decodeURIComponent(item.fileCRBase64); -- su dung trong truong hop server tra ve base64 dang byte ( da encode )
          //   // item.fileCRToDisplay = '<a download=\"CRFile'+ item.siteOnNims +'.pdf\" href=\"data:application/pdf;base64,'+ decode + '\">CRFile'+ item.siteOnNims + '.pdf</a>';
          //   item.fileCRToDisplay = '<a download=\"CRFile' + item.siteOnNims + '.pdf\" href=\"data:application/pdf;base64,' + item.fileCR + '\">CRFile' + item.siteOnNims + '.pdf</a>';
          //   item.fileCRBase64 = item.fileCR;
          // } else {
          //   item.fileCRBase64 = null;
          //   item.fileCR = null;
          //   item.fileCRToDisplay = '';
          // }
          if (item.startDatePayment) {
            item.startDateTypeDate = moment(item.startDatePayment, 'DD/MM/yyyy').format('yyyy-MM-DD');
          }
          if (item.endDatePayment) {
            item.endDateTypeDate = moment(item.endDatePayment, 'DD/MM/yyyy').format('yyyy-MM-DD');
          }
          if (item.startDateContract){
            item.startDateContractTypeDate = moment(item.startDateContract, 'DD/MM/yyyy').format('yyyy-MM-DD');
          }
          if (item.endDateContract){
            item.endDateContractTypeDate = moment(item.endDateContract, 'DD/MM/yyyy').format('yyyy-MM-DD');
          }
          if (item.signDateContract){
            item.signDateContractTypeDate = moment(item.signDateContract, 'DD/MM/yyyy').format('yyyy-MM-DD');
          }
          if (item.hasElectricity || item.hasElectricity == 0) {
            let electricObj = this.btsManagementService.listYesOrNo.value.find(type => type.value == item.hasElectricity);
            item.hasElectricityStr = electricObj.name;
            item.hasElectricityValue = electricObj.value;
          }
          if(item.provinceCode){
            item.provinceCodeStr = item.provinceCode;
          }
          if (item.district != '' || item.district != null || item.district != undefined) {
            item.districtStr = item.district;
          }
          if(item.fileContractPath){
            item.fileContract = item.fileContractPath;
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
    const blob = new Blob([int8Array.buffer], {type: 'application/pdf'});
    const blobURL = URL.createObjectURL(blob);
    return blobURL;
  }

  toBase64Contract(event, row) {
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
        province: this.searchForm.get('provinceSearch').value,
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

  formatStartDateToSend(event, row) {
    row.startDatePayment = moment(event.value).local().format('DD/MM/YYYY');
  }

  formatEndDateToSend(event, row) {
    row.endDatePayment = moment(event.value).local().format('DD/MM/YYYY');
  }

  setElectricStatus(event, row) {
    row.hasElectricity = event.target.value;
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

  clickAccept() {
    this.updateBTSStation().subscribe(res => {
      if (res.errorCode == 0) {
        this.btsManagementService.toastrService.success(res.description);
        this.modalService.dismissAll();
        this.isShowUpdate.next(false);
        this.eSearch();

      } else {
        this.modalService.dismissAll();
        this.btsManagementService.toastrService.error(res.description);

      }
    });
  }

  selectDistrictToUpdate(event, row) {
    row.provinceCode = event.target.value;
    let provinceObj = this.btsManagementService.listProvince.value.find(prov => prov.proCode == row.provinceCode);
    row.province = provinceObj.proId;
    row.listDistrictToUpdate = [];
    this.getListDistrict(event.target.value).subscribe(res => {
      row.listDistrictToUpdate = res.data;
    });
  }

  selectDistrictToUpdate1(event, row) {
    row.district = event.target.value;
  }

  updateBTSStation() {
    const lst = [];
    this.stations.value.forEach(item => {
      if (item.edit == true) {
        const obj = {
          id: item.id,
          siteOnNims: item.siteOnNims,
          siteOnContract: item.siteOnContract,
          latitude: item.latitude,
          longitude: item.longitude,
          contractNo: item.contractNo,
          approvedStatus: item.approvedStatus,
          status: item.status,
          createdUser: item.createdUser,
          createdDate: item.createdDate,
          approvedStatusName: item.approvedStatusName,
          statusName: item.statusName,
          notes: item.notes,
          fileCR: item.fileCR,
          name: item.name,
          address: item.address,
          district: item.district,
          telephone: item.telephone,
          periodOfRent: item.periodOfRent,
          startDateContract: item.startDateContract,
          endDateContract: item.endDateContract,
          signDateContract: item.signDateContract,
          btsAiredDate: item.btsAiredDate,
          rentalFee: item.rentalFee,
          paymentTime: item.paymentTime,
          hasElectricity: item.hasElectricity,
          turnOffDate: item.turnOffDate,
          lastModifiedUser: item.lastModifiedUser,
          lastModifiedDate: item.lastModifiedDate,
          startDatePayment: item.startDatePayment,
          endDatePayment: item.endDatePayment,
          provinceCode: item.provinceCode,
          province: item.province,
          fileContract: item.fileContract,
          amount: item.amount
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

  openShowApproveStation() {
    this.openModal(this.content);
  }

  getFile(filePath) {
    const request = {
      functionName: 'getFile',
      filePath: filePath
    };
    this.btsManagementService.callAPICommon(request as RequestApiModel).subscribe(res => {
      if (res.errorCode == '0') {
        const downloadLink = document.createElement('a');
        const fileName = `${filePath}.pdf`;
        downloadLink.href = 'data:application/pdf;base64,' + res.data.fileContent;
        downloadLink.download = fileName;
        downloadLink.click();
      }
    });
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

  changePeriodOfRent(event, row){
    if (event.target.value != null || event.target.value != "" || event.target.value != undefined){
      row.periodOfRent = event.target.value;
    }else row.periodOfRent = null;
  }

  formatStartDateContractToSend(event, row){
    row.startDateContract = moment(event.value).local().format('DD/MM/YYYY');
  }

  formatEndDateContractToSend(event, row){
    row.endDateContract = moment(event.value).local().format('DD/MM/YYYY');
  }

  formatSignDateContractToSend(event, row){
    row.signDateContract = moment(event.value).local().format('DD/MM/YYYY');
  }

  uploadFilePDF(files: any[], item: any, fileType: number) {
    if (files && files.length > 0) {
      const formData: FormData = new FormData();
      files.forEach(file => {
        formData.append('listFileImage', file);
      });
      this.btsManagementService.callAPIUploadFile(formData, 'uploadFile', item.id, fileType)
        .pipe(first())
        .subscribe(res => {
          if (res.errorCode === '0') {
            if (fileType == 1) {
              item.fileContractEdited = true;
              item.fileContract = res.data.filePath;
              item.fileContractPathTemp = res.data.filePath;
              item.fileContractNameTemp = res.data.fileName;
              this.isShowUpdate.next(true);
            }
            this.btsManagementService.toastrService.success(res.description);
          } else {
            // show error
            this.btsManagementService.toastrService.error(res.description);
          }
        });
    }
  }
}

