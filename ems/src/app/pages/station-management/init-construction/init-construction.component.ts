/* tslint:disable */
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, RequiredValidator, ValidationErrors, Validators} from '@angular/forms';
import {ElementRef} from '@angular/core';
import {StationManagementService} from '../../_services/station-management.service';
import {RequestApiModel} from '../../_models/request-api.model';
import {BehaviorSubject, forkJoin, of} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../../environments/environment';
import {HttpHeaders} from '@angular/common/http';
import {catchError, finalize} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-init-construction',
  templateUrl: './init-construction.component.html',
  styleUrls: ['./init-construction.component.scss']
})
export class InitConstructionComponent implements OnInit, AfterViewInit {

  addForm: FormGroup;
  dataBase64: any;
  @ViewChild('addFormWrapper') addFormWrapper: ElementRef;
  @ViewChild('addFileWrapper') addFileWrapper: ElementRef;
  @ViewChild('inputsomething') inputsomething: ElementRef;
  provinceToInit = new BehaviorSubject('');
  stationCodeToInit =  new BehaviorSubject('');
  stationNameToInit =  new BehaviorSubject('');
  positionTypeToInit =  new BehaviorSubject('');
  stationTypeToInit =  new BehaviorSubject('');
  pillarTypeToInit =  new BehaviorSubject('');
  pillarHeightToInit =  new BehaviorSubject('');
  longToInit =  new BehaviorSubject('');
  latToInit =  new BehaviorSubject('');
  banToInit =  new BehaviorSubject('');
  villageToInit =  new BehaviorSubject('');
  consTypeToInit =  new BehaviorSubject('');
  networkToInit =  new BehaviorSubject('');
  vendorToInit =  new BehaviorSubject('');
  bandToInit =  new BehaviorSubject('');
  antenHeightToInit =  new BehaviorSubject('');
  azimuthToInit =  new BehaviorSubject('');
  tiltToInit =  new BehaviorSubject('');
  sectorToInit =  new BehaviorSubject('');
  trxToInit =  new BehaviorSubject('');
  startPointToInit =  new BehaviorSubject('');
  endPointToInit =  new BehaviorSubject('');
  cableLineToInit =  new BehaviorSubject('');
  cableDistanceToInit =  new BehaviorSubject('');
  pillarQuantityToInit =  new BehaviorSubject('');
  decisionToInit =  new BehaviorSubject('');
  noteToInit =  new BehaviorSubject('');
  files: File[] = [];
  fileUpload = [];
  fileToUpload =  new BehaviorSubject({});
  private modal: any;
  @ViewChild('initPopup') initPopup: ElementRef;
  @ViewChild('initPopup2') initPopup2: ElementRef;

  constructor(
    private fb: FormBuilder,
    public stationManagementService: StationManagementService,
    public spinner: NgxSpinnerService,
    public router: Router,
    private modalService: NgbModal,
    public toastrService: ToastrService
  ) {
    this.loadForm();
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.addForm.get('provinceSearch').valueChanges.subscribe(value => {
      this.provinceToInit.next(value);
      if (value == '' || value == null || value == undefined) {
        return;
      }
      this.getListDistrict(value).subscribe(res => {
        if (res.errorCode == '0') {
          this.stationManagementService.listDistrict.next(res.data);
          this.banToInit.next('');
        } else {
          this.stationManagementService.toastrService.error(res.description);
        }
      });
    });
    this.addForm.get('stationCode').valueChanges.subscribe(value => {
      this.stationCodeToInit.next(value);
    });
    this.addForm.get('stationName').valueChanges.subscribe(value => {
        this.stationNameToInit.next(value);
    });
    this.addForm.get('positionType').valueChanges.subscribe(value => this.positionTypeToInit.next(value));
    this.addForm.get('stationType').valueChanges.subscribe(value => this.stationTypeToInit.next(value));
    this.addForm.get('pillarType').valueChanges.subscribe(value => this.pillarTypeToInit.next(value));
    this.addForm.get('pillarHeight').valueChanges.subscribe(value => this.pillarHeightToInit.next(value));
    this.addForm.get('Long').valueChanges.subscribe(value => this.longToInit.next(value));
    this.addForm.get('Lat').valueChanges.subscribe(value => this.latToInit.next(value));
    this.addForm.get('Ban').valueChanges.subscribe(value => {
      if (value == '' || value == null || value == undefined) {
        return;
      }
      this.banToInit.next(value);
    });
    this.addForm.get('village').valueChanges.subscribe(value => this.villageToInit.next(value));
    this.addForm.get('infrastructureType').valueChanges.subscribe(value => this.consTypeToInit.next(value));
    this.addForm.get('network').valueChanges.subscribe(value => this.networkToInit.next(value));
    this.addForm.get('vendor').valueChanges.subscribe(value => this.vendorToInit.next(value));
    this.addForm.get('band').valueChanges.subscribe(value => this.bandToInit.next(value));
    this.addForm.get('antennaHeight').valueChanges.subscribe(value => this.antenHeightToInit.next(value));
    this.addForm.get('azimuth').valueChanges.subscribe(value => this.azimuthToInit.next(value));
    this.addForm.get('tilt').valueChanges.subscribe(value => this.tiltToInit.next(value));
    this.addForm.get('sector').valueChanges.subscribe(value => this.sectorToInit.next(value));
    this.addForm.get('trx4g').valueChanges.subscribe(value => this.trxToInit.next(value));
    this.addForm.get('startPoint').valueChanges.subscribe(value => this.startPointToInit.next(value));
    this.addForm.get('endPoint').valueChanges.subscribe(value => this.endPointToInit.next(value));
    this.addForm.get('cableLine').valueChanges.subscribe(value => this.cableLineToInit.next(value));
    this.addForm.get('cableDistance').valueChanges.subscribe(value => this.cableDistanceToInit.next(value));
    this.addForm.get('concretePillarQuantity').valueChanges.subscribe(value => this.pillarQuantityToInit.next(value));
    this.addForm.get('note').valueChanges.subscribe(value => this.noteToInit.next(value));
    this.addForm.get('decisionApplied').valueChanges.subscribe(value => this.decisionToInit.next(value));
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
      provinceSearch: ['', Validators.required],
      stationCode: ['', Validators.required],
      stationName: ['', Validators.required],
      positionType: ['', Validators.required],
      infrastructureType: ['', Validators.required],
      stationType: ['', Validators.required],
      pillarType: ['', Validators.required],
      pillarHeight: ['', [Validators.required, Validators.pattern('^[0-9]*\\.?[0-9]*\\+?[0-9]*\\.?[0-9]*$')]],
      Long: ['', [Validators.required, Validators.pattern('^[0-9]*\\.?[0-9]*$')]],
      Lat: ['', [Validators.required, Validators.pattern('^[0-9]*\\.?[0-9]*$')]],
      Ban: ['', [Validators.required]],
      village: ['', Validators.required],
      network: [''],
      vendor: [''],
      band: [''],
      antennaHeight: ['', Validators.pattern('^[0-9]*\\.?[0-9]*$')],
      azimuth: [''],
      tilt: [''],
      sector: ['', Validators.pattern('^[0-9]*\\.?[0-9]*$')],
      trx4g: [''],
      startPoint: [''],
      endPoint: [''],
      cableLine: [''],
      cableDistance: ['', Validators.pattern('^[0-9]*\\.?[0-9]*$')],
      concretePillarQuantity: ['', Validators.pattern('^[0-9]*\\.?[0-9]*$')],
      decisionApplied: ['', Validators.required],
      note: ['']
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
        this.stationManagementService.toastrService.error('Sai định dạnh file đính kèm');
        return false;
      }
    } else {
      this.stationManagementService.toastrService.error('Sai định dạnh file đính kèm');
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

  clickAccept(){
    this.openModal(this.initPopup);
  }

  clickAccept2(){
    this.openModal(this.initPopup2);
  }


  submitForm() {
    if (!this.isValidForm()) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.addForm.get('stationCode').setValue(this.stationCodeToInit.value.trim());
    this.addForm.get('stationName').setValue(this.stationNameToInit.value.trim());
    this.addForm.get('pillarHeight').setValue(this.pillarHeightToInit.value.trim());
    this.addForm.get('Long').setValue(this.longToInit.value.trim());
    this.addForm.get('Lat').setValue(this.latToInit.value.trim());
    this.addForm.get('village').setValue(this.villageToInit.value.trim());
    this.addForm.get('network').setValue(this.networkToInit.value.trim());
    this.addForm.get('vendor').setValue(this.vendorToInit.value.trim());
    this.addForm.get('band').setValue(this.bandToInit.value.trim());
    this.addForm.get('antennaHeight').setValue(this.antenHeightToInit.value.trim());
    this.addForm.get('azimuth').setValue(this.azimuthToInit.value.trim());
    this.addForm.get('tilt').setValue(this.tiltToInit.value.trim());
    this.addForm.get('sector').setValue(this.sectorToInit.value.trim());
    this.addForm.get('trx4g').setValue(this.trxToInit.value.trim());
    this.addForm.get('startPoint').setValue(this.startPointToInit.value.trim());
    this.addForm.get('endPoint').setValue(this.endPointToInit.value.trim());
    this.addForm.get('cableLine').setValue(this.cableLineToInit.value.trim());
    this.addForm.get('cableDistance').setValue(this.cableDistanceToInit.value.trim());
    this.addForm.get('concretePillarQuantity').setValue(this.pillarQuantityToInit.value.trim());
    this.addForm.get('decisionApplied').setValue(this.decisionToInit.value.trim());
    this.addForm.get('note').setValue(this.noteToInit.value.trim());

    this.createConstruction().subscribe(res => {
      if (res.errorCode == '0'){
        this.stationManagementService.toastrService.success(res.description);
        this.addForm.reset();
        this.router.navigate(['station-management/list-station']);
      }
      else {
        this.stationManagementService.toastrService.error(res.description);
      }
    });

  }

  submitFile() {
    this.createConstructionByFile().subscribe(res => {
      if(res.errorCode == '0'){
        this.stationManagementService.toastrService.success(res.description);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("type", "hidden");
        link.href = "data:text/plain;base64," + res.data.fileContent;
        link.download = res.data.name;
        link.click();
        document.body.removeChild(link);
        // this.router.navigate(['station-management/list-station']);
      }
      else {
        this.stationManagementService.toastrService.error(res.description);
      }
    });
  }

  createConstructionByFile(){
    var dataForm: any = new FormData();
    dataForm.append('fileCreateRequest', this.fileToUpload.value);
    return this.stationManagementService.callAPICreateFile(dataForm, 'createConstructionByFile');
  }

  getListDistrict(_proCode) {
    const requestTarget = {
      functionName: 'getListDistrict',
      provinceDTO: {
        proCode: _proCode
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  createConstruction() {
    const requestTarget = {
      functionName: 'createConstruction',
      constructionDTO: {
        provinceCode: this.provinceToInit.value,
        constructionCode:this.stationCodeToInit.value.trim(),
        constructionName: this.stationNameToInit.value.trim(),
        positionType: this.positionTypeToInit.value,
        stationType: this.stationTypeToInit.value,
        columnType: this.pillarTypeToInit.value,
        columnHeight: this.pillarHeightToInit.value.trim(),
        constructionLong: this.longToInit.value.trim(),
        constructionLat:  this.latToInit.value.trim(),
        district: this.banToInit.value,
        village: this.villageToInit.value.trim(),
        constructionType: this.consTypeToInit.value,
        network:this.networkToInit.value.trim(),
        vendor:  this.vendorToInit.value.trim(),
        band: this.bandToInit.value.trim(),
        antenHeight:this.antenHeightToInit.value.trim(),
        azimuth: this.azimuthToInit.value.trim(),
        tilt: this.tiltToInit.value.trim(),
        sector: this.sectorToInit.value.trim(),
        trxMode:  this.trxToInit.value.trim(),
        startPoint: this.startPointToInit.value.trim(),
        endPoint: this.endPointToInit.value.trim(),
        cableRoute:this.cableLineToInit.value.trim(),
        distanceCable: this.cableDistanceToInit.value.trim(),
        columnNumber:  this.pillarQuantityToInit.value.trim(),
        note:this.noteToInit.value.trim(),
        decisionDeploy: this.decisionToInit.value.trim()
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
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

  redirectToListStation(){
    this.router.navigate(['station-management/list-station']);
  }

  openModal(_content) {
    this.modal = this.modalService.open(_content, {
      centered: true,
    });
  }

}


