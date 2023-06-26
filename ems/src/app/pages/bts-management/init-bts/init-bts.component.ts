import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestApiModel } from '../../_models/request-api.model';
import { BtsManagementService } from '../../_services/bts-management.service';

@Component({
  selector: 'app-init-bts',
  templateUrl: './init-bts.component.html',
  styleUrls: ['./init-bts.component.scss']
})
export class InitBtsComponent implements OnInit {
  addForm: FormGroup;
  dataBase64: any;
  @ViewChild('addFormWrapper') addFormWrapper: ElementRef;
  @ViewChild('addFileWrapper') addFileWrapper: ElementRef;
  @ViewChild('inputsomething') inputsomething: ElementRef;
  @ViewChild('formSearch') formSearch: ElementRef;
  @ViewChild('test') test: ElementRef;

  files: File[] = [];
  fileUpload = [];
  jstoday = '';
  today = new Date();
  stationCode = '';

  constructor(
    private fb: FormBuilder,
    private btsManagementService: BtsManagementService,
  ) {
    this.loadForm();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // console.log(this.test.nativeElement.innerText);
  }

  normalInput() {
    this.addFormWrapper.nativeElement.style.display = '';
    this.addFileWrapper.nativeElement.style.display = 'none';
    this.addForm.reset();
  }

  fileInput() {
    this.addFormWrapper.nativeElement.style.display = 'none';
    this.addFileWrapper.nativeElement.style.display = '';
    this.addForm.reset();
  }
  loadForm() {
    this.addForm = this.fb.group({
      stationCode: ['', Validators.required],
      contractNo: [''],
      Long: ['', Validators.required],
      Lat: ['', Validators.required],
      // hostName: ['', Validators.required],
      // cityProvince: ['', Validators.required],
      // district: ['', Validators.required],
      // village: ['', Validators.required],
      // phoneNumber: ['', Validators.required],
      // startTime: ['', Validators.required],
      // endTime: ['', Validators.required],
      // rentCost: ['', Validators.required],
      // paymentTime: ['', Validators.required],
      // electricity: ['', Validators.required],
      // contractNumber  : ['', Validators.required],
      // status: ['', Validators.required],
    });
    
  }
  onSelect(event) {
    if (this.validateExtensions(event)) {
      if (this.files[0]) {
        this.files.splice(this.files.indexOf(this.files[0]), 1);
      }
      this.files.push(...event.addedFiles);
      this.toBase64(this.files[0]).then(res => {
        this.dataBase64 = res;
        this.dataBase64 = this.dataBase64.replace('data:application/vnd.ms-excel;base64,', '');
        this.fileUpload.push(this.dataBase64);
      });
    }
    this.inputsomething.nativeElement.style.display = 'none';
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
    if (this.files.length == 0) {
      this.dataBase64 = null;
    } else {
      this.toBase64(this.files[0]).then(r => {
        this.dataBase64 = r;
        this.dataBase64 = this.dataBase64.replace('data:application/vnd.ms-excel;base64,', '');
      });
    }
  }

  validateExtensions(event) {
    let data = event.addedFiles[0];
    if (data) {
      if (data.name && this.hasExtension(data.name, ['.xlsx', '.xls'])) {
        return true;
      } else {
        this.btsManagementService.toastrService.error('Sai định dạnh file đính kèm');
        return false;
      }
    } else {
      this.btsManagementService.toastrService.error('Sai định dạnh file đính kèm');
      return false;
    }
  }
  hasExtension(filename, exts) {
    let check = new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', 'i').test(filename);
    return check;
  }
  toBase64 = (file: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  submitFile() {

    this.createBTSStation().subscribe(res => {
      if (res.errorCode == '0') {
        this.btsManagementService.toastrService.success(res.description);
      }
      else {
        this.btsManagementService.toastrService.error(res.description);
      }
    })
    // this.addFormWrapper.nativeElement.style.display = "none";
    // this.formSearch.nativeElement.style.display = "";
    this.searchBTSStation();
    this.btsManagementService.btnSave.next(true);
    // console.log(this.test.nativeElement.innerText)
  };

  createBTSStation() {
    // debugger;
    const requestTarget = {
      functionName: 'createBTSStation',
      btsStationDTO: {
        siteOnNims: this.addForm.get('stationCode').value,
        siteOnContract:this.test.nativeElement.innerText,
        contractNo: this.test.nativeElement.innerText,
        longitude : this.addForm.get('Long').value,
        latitude : this.addForm.get('Lat').value,
      }
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }
  searchBTSStation() {
    const requestTarget = {
      functionName: 'searchBTSStation'
    };
    return this.btsManagementService.callAPICommon(requestTarget as RequestApiModel);
  }
}

