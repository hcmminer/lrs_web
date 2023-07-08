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
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-edit-price-range',
  templateUrl: './add-edit-price-range.component.html',
  styleUrls: ['./add-edit-price-range.component.scss'],
})
export class AddEditPriceRangeComponent implements OnInit, OnDestroy {
  selectProvince(event) {
    let arrClone = [...this.configSystemService.cbxProvince.value];
    let arr = arrClone.shift();
    this.provinceCode = arrClone.find((i) => i.proId == event)?.proCode;
  }
  selectAreaCode(event) {
    let arrClone = [...this.configSystemService.cbxArea.value];
    let arr = arrClone.shift();
    this.areaCode = arrClone.find((i) => i.optionSetValueId == event)?.value;
  }
  // form
  provinceCode = null;
  areaCode = null;
  optionSetValueId = null;
  provinceId = null;
  proId = null;
  startDate = new Date();
  endDate = new Date();
  amount;
  description;
  // form
  t2msg = '';
  t3msg = '';
  propAction;
  propData;
  show: boolean = false;
  data: any;
  @Output() accept = new EventEmitter<any>();
  addEditForm: FormGroup;
  isAdmin = 0;
  isUpdate: boolean = false;

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
    this.optionSetValueId = this.propData.optionSetValueId;
    this.provinceId = this.propData.provinceId;
  }

  convertStringVNToUTCDate(vn) {
    let vnArr = vn.split('/');
    return new Date(vnArr[2], vnArr[1] - 1, vnArr[0]);
  }

  loadForm() {
    if (this.propAction == 'add') {
      this.addEditForm = this.fb.group({
        optionSetValueId: [this.optionSetValueId, [Validators.required]],
        provinceId: [this.provinceId, [Validators.required]],
        startDate: [this.startDate, [Validators.required]],
        endDate: [this.endDate, [Validators.required]],
        amount: [this.amount, [Validators.required]],
        description: [this.description, [Validators.required]],
      });
    } else {
      this.addEditForm = this.fb.group({
        optionSetValueId: [this.propData.optionSetValueId, [Validators.required]],
        provinceId: [this.propData.provinceId, [Validators.required]],
        startDate: [this.convertStringVNToUTCDate(this.propData.startDate), [Validators.required]],
        endDate: [this.convertStringVNToUTCDate(this.propData.expiredDate), [Validators.required]],
        amount: [this.propData.amount, [Validators.required]],
        description: [this.propData.description, [Validators.required]],
      });
    }
  }

  //thay đổi format date
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.addEditForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.addEditForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  loTrinhControl(controlName: string) {
    return this.addEditForm.controls[controlName];
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
      priceRangeDTO: {
        optionSetValueId: this.addEditForm.get('optionSetValueId').value,
        provinceId: this.addEditForm.get('provinceId').value,
        amount: this.addEditForm.get('amount').value,
        startDate: this.transform(this.addEditForm.get('startDate').value),
        expiredDate: this.transform(this.addEditForm.get('endDate').value),
        description: this.addEditForm.get('description').value.trim(),
      },
    };
    if (this.propAction == 'edit') {
      const requestTargetNew = {
        ...requestTarget,
        priceRangeDTO: {
          ...requestTarget.priceRangeDTO,
          priceRangeId: this.propData.priceRangeId,
        },
        functionName: 'editPriceRange',
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
        functionName: 'addPriceRange',
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

  eChangeDate2(event) {
    if (event.target.value === '') {
      this.t2msg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('cm.startDate'),
      });
      return;
    }

    let temp = this.transform(this.addEditForm.get('startDate').value);
    if (temp === null || temp === undefined) {
      this.t2msg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('cm.startDate'),
      });
      return;
    }

    this.t2msg = '';
  }

  eChangeDate3(event) {
    if (event.target.value === '') {
      this.t3msg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('cm.endDate'),
      });
      return;
    }
    let temp = this.transform(this.addEditForm.get('expiredDate').value);
    if (temp === null || temp === undefined) {
      this.t3msg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('cm.endDate'),
      });
      return;
    }
    this.t3msg = '';
  }
}
