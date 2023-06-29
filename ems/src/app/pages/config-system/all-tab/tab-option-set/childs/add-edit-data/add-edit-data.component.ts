import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";
import { CommonAlertDialogComponent } from "src/app/pages/materials/common-alert-dialog/common-alert-dialog.component";
import { ToastrService } from "ngx-toastr";
import { ConfigSystemService } from "src/app/pages/cm_service/config-system.service";
import { CommonService } from "src/app/pages/cm_service/common.service";

@Component({
  selector: "app-add-edit-data",
  templateUrl: "./add-edit-data.component.html",
  styleUrls: ["./add-edit-data.component.scss"],
})
export class AddEditDataComponent implements OnInit, OnDestroy {
  propAction;
  propData;
  optionSetCode;
  description;
  show: boolean = false;
  showHide() {
    this.show = !this.show;
  }
  showPassword = false;
  data: any;
  @Output() accept = new EventEmitter<any>();
  addEditForm: FormGroup;
  isAdmin = 0;
  id;
  isUpdate: boolean = false;

  constructor(
    public configSystemService: ConfigSystemService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private fb: FormBuilder,
    private commonService: CommonService,
    @Inject(Injector) private readonly injector: Injector,
    public spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    if (this.isUpdate) {
      this.id = this.data.id;
    } else {
    }
    this.loadForm();
  }

  loadForm() {
    if (this.propAction == "add") {
      this.addEditForm = this.fb.group({
        optionSetCode: [this.optionSetCode, [Validators.required]],
        description: [this.description, [Validators.required]],
      });
    } else {
      this.addEditForm = this.fb.group({
        optionSetCode: [this.propData.optionSetCode, [Validators.required]],
        description: [this.propData.description, [Validators.required]],
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
      type: "warning",
      title: "cm.warning",
      message:
        this.propAction == "add"
          ? this.translate.instant("cm.confirmAdd")
          : this.translate.instant("cm.confirmEdit"),
      continue: true,
      cancel: true,
      btn: [
        { text: "cancel", className: "btn-outline-warning btn uppercase mx-2" },
        { text: "continue", className: "btn btn-warning uppercase mx-2" },
      ],
    };
    modalRef.result.then(
      (result) => {
        if (result == "cancel") {
          return false;
        }
        if (result == "continue") {
          this.addEditStaff();
        }
      },
      (reason) => {
        return false;
      }
    );
  }

  addEditStaff() {
    const requestTarget = {
      optionSetV1DTO: {
        optionSetCode: this.addEditForm.get("optionSetCode").value,
        description: this.addEditForm.get("description").value,
      },
    };
    if (this.propAction == "edit") {
      const requestTargetNew = {
        ...requestTarget,
        optionSetV1DTO: {
          ...requestTarget.optionSetV1DTO,
          optionSetId: this.propData.optionSetId,
        },
        functionName: "editOptionSet",
      };
      this.commonService.callAPICommon(requestTargetNew).subscribe((res) => {
        this.spinner.hide();
        if (res && res.errorCode == "0") {
          this.toastService.success(this.translate.instant("cm.editSuccess"));
          this.eClose();
        } else {
          this.toastService.error(res.description);
        }
      });
    } else {
      const requestTargetNew = {
        ...requestTarget,
        functionName: "addOptionSet",
      };
      this.commonService.callAPICommon(requestTargetNew).subscribe((res) => {
        this.spinner.hide();
        if (res && res.errorCode == "0") {
          this.toastService.success(this.translate.instant("cm.addSuccess"));
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
