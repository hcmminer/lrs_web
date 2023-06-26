
// @ts-ignore
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Station} from '../../_models/station.model';
import {StationManagementService} from '../../_services/station-management.service';
import {RequestApiModel} from '../../_models/request-api.model';
import {ListStationComponent} from '../list-station/list-station.component';

@Component({
  selector: 'app-edit-construction',
  templateUrl: './edit-construction.component.html',
  styleUrls: ['./edit-construction.component.scss']
})
export class EditConstructionComponent implements OnInit, AfterViewInit {
  editForm: FormGroup;
  private modal: any;

  listDistrict = new BehaviorSubject([]);
  provinceToEdit = new BehaviorSubject('');
  stationCodeToEdit =  new BehaviorSubject('');
  stationNameToEdit =  new BehaviorSubject('');
  positionTypeToEdit =  new BehaviorSubject('');
  stationTypeToEdit =  new BehaviorSubject('');
  pillarTypeToEdit =  new BehaviorSubject('');
  pillarHeightToEdit =  new BehaviorSubject('');
  longToEdit =  new BehaviorSubject('');
  latToEdit =  new BehaviorSubject('');
  banToEdit =  new BehaviorSubject('');
  villageToEdit =  new BehaviorSubject('');
  consTypeToEdit =  new BehaviorSubject('');
  networkToEdit =  new BehaviorSubject('');
  vendorToEdit =  new BehaviorSubject('');
  bandToEdit =  new BehaviorSubject('');
  antenHeightToEdit =  new BehaviorSubject('');
  azimuthToEdit =  new BehaviorSubject('');
  tiltToEdit =  new BehaviorSubject('');
  sectorToEdit =  new BehaviorSubject('');
  trxToEdit =  new BehaviorSubject('');
  startPointToEdit =  new BehaviorSubject('');
  endPointToEdit =  new BehaviorSubject('');
  cableLineToEdit =  new BehaviorSubject('');
  cableDistanceToEdit =  new BehaviorSubject('');
  pillarQuantityToEdit =  new BehaviorSubject('');
  decisionToEdit =  new BehaviorSubject('');
  noteToEdit =  new BehaviorSubject('');
  @ViewChild('editPopup') editPopup: ElementRef;
  stationID: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public stationManagementService: StationManagementService
  ) {
    this.loadForm();
  }

  ngOnInit(): void {
    this.stationID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getConstructionDetail(this.stationID).subscribe(res => {
      if (res.errorCode === '0'){
        const initData = res.data;
        this.getListDistrict(initData.provinceCode).subscribe(response => {
          this.listDistrict.next(response.data);
          this.editForm.patchValue({
            stationCode: initData?.constructionCode,
            stationName: initData?.constructionName,
            positionType: initData.positionType ? initData.positionType.toString() : initData.positionType,
            provinceSearch: initData?.provinceCode,
            infrastructureType: initData?.constructionType,
            stationType: initData.stationType ? initData.stationType.toString() : initData.stationType,
            pillarType: initData.columnType ? initData.columnType.toString() : initData.columnType,
            pillarHeight: initData?.columnHeight,
            Long: initData?.constructionLong,
            Lat: initData?.constructionLat,
            Ban: initData?.district,
            village: initData?.village,
            network: initData?.network,
            vendor: initData?.vendor,
            band: initData?.band,
            antennaHeight: initData?.antenHeight,
            azimuth: initData?.azimuth,
            tilt: initData?.tilt,
            sector: initData?.sector,
            trx4g: initData?.trxMode,
            startPoint: initData?.startPoint,
            endPoint: initData?.endPoint,
            cableLine: initData?.cableRoute,
            cableDistance: initData?.distanceCable,
            concretePillarQuantity: initData?.columnNumber,
            decisionApplied: initData?.decisionDeploy,
            note: initData?.note
          });
        });
      }
    });
  }

  ngAfterViewInit(){
    this.editForm.get('provinceSearch').valueChanges.subscribe(value => {
      this.editForm.patchValue({
        Ban: ''
      });
      this.provinceToEdit.next(value);
      // tslint:disable-next-line:triple-equals
      if (value == '' || value == null || value == undefined) {
        return;
      }
      this.getListDistrict(value).subscribe(res => {
        // tslint:disable-next-line:triple-equals
        if (res.errorCode == '0') {
          this.stationManagementService.listDistrict.next(res.data);
        } else {
          this.stationManagementService.toastrService.error(res.description);
        }
      });
    });
    this.editForm.get('stationCode').valueChanges.subscribe(value => this.stationCodeToEdit.next(value));
    this.editForm.get('stationName').valueChanges.subscribe(value => this.stationNameToEdit.next(value));
    this.editForm.get('positionType').valueChanges.subscribe(value => this.positionTypeToEdit.next(value));
    this.editForm.get('stationType').valueChanges.subscribe(value => this.stationTypeToEdit.next(value));
    this.editForm.get('pillarType').valueChanges.subscribe(value => this.pillarTypeToEdit.next(value));
    this.editForm.get('pillarHeight').valueChanges.subscribe(value => this.pillarHeightToEdit.next(value));
    this.editForm.get('Long').valueChanges.subscribe(value => this.longToEdit.next(value));
    this.editForm.get('Lat').valueChanges.subscribe(value => this.latToEdit.next(value));
    this.editForm.get('Ban').valueChanges.subscribe(value => this.banToEdit.next(value));
    this.editForm.get('village').valueChanges.subscribe(value => this.villageToEdit.next(value));
    this.editForm.get('infrastructureType').valueChanges.subscribe(value => this.consTypeToEdit.next(value));
    this.editForm.get('network').valueChanges.subscribe(value => this.networkToEdit.next(value));
    this.editForm.get('vendor').valueChanges.subscribe(value => this.vendorToEdit.next(value));
    this.editForm.get('band').valueChanges.subscribe(value => this.bandToEdit.next(value));
    this.editForm.get('antennaHeight').valueChanges.subscribe(value => this.antenHeightToEdit.next(value));
    this.editForm.get('azimuth').valueChanges.subscribe(value => this.azimuthToEdit.next(value));
    this.editForm.get('tilt').valueChanges.subscribe(value => this.tiltToEdit.next(value));
    this.editForm.get('sector').valueChanges.subscribe(value => this.sectorToEdit.next(value));
    this.editForm.get('trx4g').valueChanges.subscribe(value => this.trxToEdit.next(value));
    this.editForm.get('startPoint').valueChanges.subscribe(value => this.startPointToEdit.next(value));
    this.editForm.get('endPoint').valueChanges.subscribe(value => this.endPointToEdit.next(value));
    this.editForm.get('cableLine').valueChanges.subscribe(value => this.cableLineToEdit.next(value));
    this.editForm.get('cableDistance').valueChanges.subscribe(value => this.cableDistanceToEdit.next(value));
    this.editForm.get('concretePillarQuantity').valueChanges.subscribe(value => this.pillarQuantityToEdit.next(value));
    this.editForm.get('note').valueChanges.subscribe(value => this.noteToEdit.next(value));
    this.editForm.get('decisionApplied').valueChanges.subscribe(value => this.decisionToEdit.next(value));
  }

  loadForm() {
    this.editForm = this.fb.group({
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

  submitForm(){
    if (!this.isValidForm()) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.editForm.get('stationCode').setValue(this.stationCodeToEdit.value.trim());
    this.editForm.get('stationName').setValue(this.stationNameToEdit.value.trim());
    this.editForm.get('pillarHeight').setValue(this.pillarHeightToEdit.value.trim());
    this.editForm.get('Long').setValue(this.longToEdit.value.trim());
    this.editForm.get('Lat').setValue(this.latToEdit.value.trim());
    this.editForm.get('village').setValue(this.villageToEdit.value.trim());
    this.editForm.get('network').setValue(this.networkToEdit.value.trim());
    this.editForm.get('vendor').setValue(this.vendorToEdit.value.trim());
    if (this.editForm.get('band').value) {this.editForm.get('band').setValue(this.bandToEdit.value.trim()); }
    this.editForm.get('antennaHeight').setValue(this.antenHeightToEdit.value.trim());
    this.editForm.get('azimuth').setValue(this.azimuthToEdit.value.trim());
    this.editForm.get('tilt').setValue(this.tiltToEdit.value.trim());
    this.editForm.get('sector').setValue(this.sectorToEdit.value);
    this.editForm.get('trx4g').setValue(this.trxToEdit.value.trim());
    this.editForm.get('startPoint').setValue(this.startPointToEdit.value.trim());
    this.editForm.get('endPoint').setValue(this.endPointToEdit.value.trim());
    this.editForm.get('cableLine').setValue(this.cableLineToEdit.value.trim());
    this.editForm.get('cableDistance').setValue(this.cableDistanceToEdit.value.trim());
    this.editForm.get('concretePillarQuantity').setValue(this.pillarQuantityToEdit.value);
    this.editForm.get('decisionApplied').setValue(this.decisionToEdit.value.trim());
    this.editForm.get('note').setValue(this.noteToEdit.value.trim());
    this.updateConstruction().subscribe(res => {
      // tslint:disable-next-line:triple-equals
      if (res.errorCode == '0'){
        this.stationManagementService.toastrService.success(res.description);
        this.editForm.reset();
        this.router.navigate(['station-management/list-station']);
      }
      else {
        this.stationManagementService.toastrService.error(res.description);
      }
    });
  }
  getConstructionDetail(_id){
    const requestTarget = {
      functionName: 'getConstructionDetail',
      constructionDTO: {
        constructionId: _id
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  // tslint:disable-next-line:variable-name
  getListDistrict(_proCode){
    const requestTarget = {
      functionName: 'getListDistrict',
      provinceDTO: {
        proCode: _proCode
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  updateConstruction() {
    const requestTarget = {
      functionName: 'updateConstruction',
      constructionDTO: {
        constructionId: this.stationID,
        provinceCode: this.provinceToEdit.value,
        constructionCode: this.stationCodeToEdit.value.trim(),
        constructionName: this.stationNameToEdit.value.trim(),
        positionType: this.positionTypeToEdit.value,
        stationType: this.stationTypeToEdit.value,
        columnType: this.pillarTypeToEdit.value,
        columnHeight: this.pillarHeightToEdit.value.trim(),
        constructionLong: this.longToEdit.value.trim(),
        constructionLat:  this.latToEdit.value.trim(),
        district: this.banToEdit.value,
        village: this.villageToEdit.value.trim(),
        constructionType: this.consTypeToEdit.value,
        network: this.networkToEdit.value.trim(),
        vendor:  this.vendorToEdit.value.trim(),
        band: this.bandToEdit.value.trim(),
        antenHeight: this.antenHeightToEdit.value.trim(),
        azimuth: this.azimuthToEdit.value.trim(),
        tilt: this.tiltToEdit.value.trim(),
        sector: this.sectorToEdit.value,
        trxMode:  this.trxToEdit.value.trim(),
        startPoint: this.startPointToEdit.value.trim(),
        endPoint: this.endPointToEdit.value.trim(),
        cableRoute: this.cableLineToEdit.value.trim(),
        distanceCable: this.cableDistanceToEdit.value,
        columnNumber: this.pillarQuantityToEdit.value,
        note: this.noteToEdit.value.trim(),
        decisionDeploy: this.decisionToEdit.value.trim()
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.editForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.editForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  redirectToListStation(){
    this.router.navigate(['station-management/list-station']);
  }

  clickAccept(){
    this.openModal(this.editPopup);
  }

  // tslint:disable-next-line:variable-name
  openModal(_content) {
    this.modal = this.modalService.open(_content, {
      centered: true,
    });
  }


}
