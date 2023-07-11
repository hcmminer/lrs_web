import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ElementRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CommonAlertDialogComponent } from 'src/app/pages/materials/common-alert-dialog/common-alert-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ConfigSystemService } from 'src/app/pages/cm_service/config-system.service';
import { CommonService } from 'src/app/pages/cm_service/common.service';
import { DatePipe, formatNumber } from '@angular/common';

@Component({
  selector: 'app-add-edit-unit',
  templateUrl: './add-edit-unit.component.html',
  styleUrls: ['./add-edit-unit.component.scss'],
})
export class AddEditUnitComponent implements OnInit, OnDestroy {
  // form
  proId = null;
  provinceId = null;
  unitCode;
  unitNameVi;
  unitNameEn;
  unitNameLa;

  propAction;
  propData;
  show: boolean = false;
  data: any;
  @Output() accept = new EventEmitter<any>();
  addEditForm: FormGroup;

  constructor(
    public configSystemService: ConfigSystemService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private fb: FormBuilder,
    private commonService: CommonService,
    @Inject(Injector) private readonly injector: Injector,
    public spinner: NgxSpinnerService,
  ) {}

  ngOnInit() {
    this.loadForm();
    this.provinceId = this.propData.provinceId || null;
    this.unitCode = this.propData?.unitCode || null;
    this.unitNameVi = this.propData?.unitNameVi || null;
    this.unitNameEn = this.propData?.unitNameEn || null;
    this.unitNameLa = this.propData?.unitNameLa || null;
  }

  loadForm() {
    if (this.propAction == 'add') {
      this.addEditForm = this.fb.group({
        provinceId: [this.provinceId, [Validators.required]],
        unitCode: [this.unitCode, [Validators.required]],
        unitNameVi: [this.unitNameVi, [Validators.required]],
        unitNameEn: [this.unitNameEn, [Validators.required]],
        unitNameLa: [this.unitNameLa, [Validators.required]],
      });
    } else {
      this.addEditForm = this.fb.group({
        provinceId: [this.propData.provinceId, [Validators.required]],
        unitCode: [this.propData.unitCode, [Validators.required]],
        unitNameVi: [this.propData.unitNameVi, [Validators.required]],
        unitNameEn: [this.propData.unitNameEn, [Validators.required]],
        unitNameLa: [this.propData.unitNameLa, [Validators.required]],
      });
    }
  }

  

  isControlInvalid(controlName: string): boolean {
    const control = this.addEditForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.addEditForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }


  private subscriptions: Subscription[] = [];

  eClose() {
    this.activeModal.close();
  }

  eCloseWithoutEdit() {
    this.activeModal.dismiss();
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addEditForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addEditForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  isNotSame: boolean = false;

  eSave() {
    if (!this.isValidForm()) {
      this.addEditForm.markAllAsTouched();
      return;
    }
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: false,
    });
    modalRef.componentInstance.data = {
      type: 'warning',
      title: 'cm.warning',
      message:
        this.propAction == 'add' ? this.translate.instant('cm.confirmAdd') : this.translate.instant('cm.confirmEdit'),
      continue: true,
      cancel: true,
      btn: [
        { text: 'cancel', className: 'btn-outline-warning btn uppercase mx-2' },
        { text: 'continue', className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        if (result == 'cancel') {
          return false;
        }
        if (result == 'continue') {
          this.addEdit();
        }
      },
      (reason) => {
        return false;
      },
    );
  }
  // optionSetValueId
  addEdit() {
    const requestTarget = {
      unitDTO: {
        provinceId: this.addEditForm.get('provinceId').value,
        unitCode: this.addEditForm.get('unitCode').value.trim(),
        unitNameVi: this.addEditForm.get('unitNameVi').value.trim(),
        unitNameEn: this.addEditForm.get('unitNameEn').value.trim(),
        unitNameLa: this.addEditForm.get('unitNameLa').value.trim(),
      },
    };
    if (this.propAction == 'edit') {
      const requestTargetNew = {
        ...requestTarget,
        unitDTO: {
          ...requestTarget.unitDTO,
          unitId: this.propData.unitId,
        },
        functionName: 'editUnit',
      };
      this.commonService.callAPICommon(requestTargetNew).subscribe((res) => {
        this.spinner.hide();
        if (res && res.errorCode == '0') {
          this.toastService.success(this.translate.instant('cm.editSuccess'));
          this.eClose();
        } else {
          this.toastService.error(res.description);
        }
      });
    } else {
      const requestTargetNew = {
        ...requestTarget,
        functionName: 'addUnit',
      };
      this.commonService.callAPICommon(requestTargetNew).subscribe((res) => {
        this.spinner.hide();
        if (res && res.errorCode == '0') {
          this.toastService.success(this.translate.instant('cm.addSuccess'));
          this.eClose();
        } else {
          this.toastService.error(res.description);
        }
      });
    }
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  
}
