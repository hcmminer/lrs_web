import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RequestApiModel } from 'src/app/pages/_models/request-api.model';
import { BtsManagementService } from 'src/app/pages/_services/bts-management.service';
import {NgxSpinnerService} from 'ngx-spinner';


@Component({
  selector: 'app-init-bts',
  templateUrl: './station-rental-contract-bts.component.html',
  styleUrls: ['./station-rental-contract-bts.component.scss']
})
export class StationRentalContractBtsComponent implements OnInit {
  addForm: FormGroup;
  dataBase64: any;
  @ViewChild('addFormWrapper') addFormWrapper: ElementRef;
  @ViewChild('addFileWrapper') addFileWrapper: ElementRef;
  @ViewChild('inputsomething') inputsomething: ElementRef;
  @ViewChild('formSearch') formSearch: ElementRef;
  @ViewChild('test') test: ElementRef;

  files: File[] = [];
  fileUpload = [];
  fileToUpload =  new BehaviorSubject({});
  jstoday = '';
  today = new Date();
  stationCode = '';

  constructor(
    private fb: FormBuilder,
    private btsManagementService: BtsManagementService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    this.loadForm();
  }

  ngOnInit() {
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
      stationCode: ['', [Validators.required, Validators.maxLength(30), ]],
      Long: ['', [Validators.required,  Validators.maxLength(10), Validators.pattern('^[0-9]*\\.?[0-9]*$')]],
      Lat: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('^[0-9]*\\.?[0-9]*$')]],
    });
  }
  onSelect(event) {
    if (this.validateExtensions(event)) {
      if (this.files[0]) {
        this.files.splice(this.files.indexOf(this.files[0]), 1);
      }
      this.files.push(...event.addedFiles);
      this.fileToUpload.next(this.files[0]);
      this.toBase64(this.files[0]).then(res => {
        this.dataBase64 = res;
        this.fileUpload.push(this.dataBase64);
      });
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
    // tslint:disable-next-line:triple-equals
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
    const data = event.addedFiles[0];
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
    const check = new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', 'i').test(filename);
    return check;
  }
  toBase64 = (file: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  })

  submitBTSStation() {
    if (!this.isValidForm()) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.addForm.get('stationCode').setValue(this.addForm.get('stationCode').value.trim());
    this.addForm.get('Long').setValue(this.addForm.get('Long').value.trim());
    this.addForm.get('Lat').setValue(this.addForm.get('Lat').value.trim());
    this.createBTSStation().subscribe(res => {
      if (res.errorCode == '0') {
        this.btsManagementService.toastrService.success(res.description);
        this.addForm.reset();
        this.router.navigate(['bts-management/list-bts']);
      }
      else {
        this.btsManagementService.toastrService.error(res.description);
      }
    });
  }

  createBTSStation() {
    // debugger;
    const requestTarget = {
      functionName: 'createBTSStation',
      btsStationDTO: {
        siteOnNims: this.addForm.get('stationCode').value.trim(),
        longitude : this.addForm.get('Long').value.trim(),
        latitude : this.addForm.get('Lat').value.trim(),
      }
    };
    return this.btsManagementService.callAPICommon(requestTarget as any);
  }

  submitFile() {
    this.createBTSStationByFile().subscribe(res => {
      if (res.errorCode == '0'){
        this.btsManagementService.toastrService.success(res.description);
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.setAttribute('type', 'hidden');
        link.href = 'data:text/plain;base64,' + res.data.fileContent;
        link.download = res.data.name;
        link.click();
        document.body.removeChild(link);
        // this.router.navigate(['station-management/list-station']);
      }
      else {
        this.btsManagementService.toastrService.error(res.description);
      }
    });
  }
  createBTSStationByFile(){
    const dataForm: any = new FormData();
    dataForm.append('fileCreateRequest', this.fileToUpload.value);
    return this.btsManagementService.callAPICreateFile(dataForm, 'createBTSStationByFile');
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.addForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }
}

