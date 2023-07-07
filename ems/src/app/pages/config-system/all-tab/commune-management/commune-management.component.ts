import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, ValidationErrors } from "@angular/forms";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BehaviorSubject, Subscription } from "rxjs";
import { RequestApiModel } from "src/app/pages/_models/request-api.model";
import { ProvincialManagementService } from "src/app/pages/_services/provincial-management.service";
import { CONFIG } from "src/app/utils/constants";
import { FormAddEditCommuneComponent } from "./form-add-edit-commune/form-add-edit-commune.component";
import { DatePipe } from "@angular/common";
import { CommuneManagementService } from "src/app/pages/_services/commune-management.service";
import { ToastrService } from "ngx-toastr";
import { CommonAlertDialogComponent } from "src/app/pages/common/common-alert-dialog/common-alert-dialog.component";
import { TranslateService } from "@ngx-translate/core";

const queryInit = {
  communeName: "",
  proId: "",
};

@Component({
  selector: "app-commune-management",
  templateUrl: "./commune-management.component.html",
  styleUrls: ["./commune-management.component.scss"],
})
export class CommuneManagementComponent implements OnInit {
  public currentPage = 0;
  public pageSize: number = 10;
  public dataChange = false;
  public recordTotal  = new BehaviorSubject<any>(0);
  public showTotalPages = new BehaviorSubject<any>(0);
  public searchForm: FormGroup;
  private subscriptions: Subscription[] = [];
  userName: string;
  public query = {
    ...queryInit,
  };
  @ViewChild("formSearch") formSearch: ElementRef;
  @ViewChild(MatSort) sort: MatSort;
  public dataSource: MatTableDataSource<any>;
  public columnsToDisplay = ["index", "provinceCode", "communeName", "action"];
  constructor(
    public communeManagementService: CommuneManagementService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    public translate: TranslateService
  ) {
    this.loadSearchForm();
  }

  initCombobox(){
    let requestListProvince = {
      functionName: "getListProvince",
      userName: this.userName,
      provinceName: "",
    };
    this.communeManagementService.getcbxProvinces(requestListProvince, true);
    this.eSearch();
  }
  ngOnInit(): void {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
   this.initCombobox();
  }

  doSearch() {
    this.currentPage = 0;
    this.dataChange = !this.dataChange;
    this.eSearch();
  }

  // init data for view form search
  loadSearchForm() {
    this.searchForm = this.fb.group({
      proId: [this.query.proId],
      communeName: [this.query.communeName],
    });
  }

  //search data
  eSearch() {
    if (!this.isValidForm()) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const rq = this.conditionSearch().subscribe((res) => {
      if (res.errorCode == "0") {
        this.dataChange = !this.dataChange;
        this.communeManagementService.listCommune.next(res.data);
        this.dataSource = new MatTableDataSource(
          this.communeManagementService.listCommune.value
        );
        this.dataSource.sort = this.sort;
        this.recordTotal .next(
          this.communeManagementService.listCommune.value.length
        );
        this.recordTotal.next(
          Math.ceil(res.totalSuccess / this.pageSize) <= 5
            ? Math.ceil(res.totalSuccess / this.pageSize)
            : 5
        );
      } else {
        this.communeManagementService.listCommune.next([]);
        this.dataSource = new MatTableDataSource(
          this.communeManagementService.listCommune.value
        );
        this.recordTotal .next(1);
        this.showTotalPages.next(1);
      }
    });
    this.subscriptions.push(rq);
  }

  conditionSearch() {
    const requestTarget = {
      functionName: "searchDistrict",
      userName: this.userName,
      districtDTO:
      {
        proId:
        this.searchForm.get("proId").value == ""
          ? null
          : +this.searchForm.get("proId").value,
          distName: this.searchForm.get("communeName").value
      },
      dataParams: {
        currentPage: this.currentPage + 1,
        pageLimit: this.pageSize      }


    };
    return this.communeManagementService.callAPICommon(
      requestTarget as RequestApiModel
    );
  }

  //display form add
  displayFormAdd(item: any, isUpdate, isUpdateFile) {
    const modalRef = this.modalService.open(FormAddEditCommuneComponent, {
      centered: true,
      backdrop: "static",
      size: "xl",
    });
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.isUpdate = isUpdate;
    modalRef.componentInstance.isUpdateFile = isUpdateFile;
    const requestTarget = {
      userName: this.userName,

      // provinceCode: this.searchForm.get("provinceCode").value,
      distName: this.searchForm.get("communeName").value,
      // fromConstructionDateStr: this.transform(
      //   this.searchForm.get("start").value
      // ),
      // toConstructionDateStr: this.transform(this.searchForm.get("end").value),
      // pageSize: this.pageSize,
      // pageNumber: this.currentPage + 1,
    };
    modalRef.componentInstance.req = requestTarget;
    modalRef.result.then((result) => {
      this.initCombobox();
      this.eSearch();
    });
  }

  deleteCommune(item: any){
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: "static",
    });
    modalRef.componentInstance.data = {
      type: "WARNING",
      title: "COMMON_MODAL.WARNING",
      message: this.translate.instant("COMMUNE_MANAGEMENT.CONFIRM_DELETE"),
      continue: true,
      cancel: true,
      btn: [
        {
          text: this.translate.instant("CANCEL"),
          className: "btn-outline-warning btn uppercase mx-2",
        },
        {
          text: this.translate.instant("CONTINUE"),
          className: "btn btn-warning uppercase mx-2",
        },
      ],
    };
    modalRef.result.then(
      (result) => {
        const requestTarget = {
          functionName: "deleteDistrict",
          userName: this.userName,
          districtDTO: {
            proId: item.proId,
            distId: item.distId
        }
        };
        let rq = this.communeManagementService.callAPICommon(requestTarget as RequestApiModel)
          .subscribe((res) => {
            if (res.errorCode == "0") {
              this.toastrService.success(
                this.translate.instant("COMMUNE_MANAGEMENT.DELETE_SUCCESS")
              );
              this.eSearch();
              this.initCombobox();
            } else {
              this.toastrService.error(res.description);
            }
          });
          this.subscriptions.push(rq);
      },
      (reason) => {}
    );

  }

  transform(value: string) {
    let datePipe = new DatePipe("en-US");
    value = datePipe.transform(value, "dd/MM/yyyy");
    return value;
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.searchForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.searchForm.controls[controlName];
    return control.dirty || control.touched;
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.searchForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.searchForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    // if (this.startDateErrorMsg !== '' || this.endDateErrorMsg !== '') {
    //   isValid = false;
    // }

    return isValid;
  }

  searchControl(controlName: string) {
    return this.searchForm.controls[controlName];
  }

  onPaginateChange(event) {
    if (event) {
      this.currentPage = event.pageIndex;
      console.log("🚀evnent (page) :", event);
      this.pageSize = event.pageSize;
      this.eSearch();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
