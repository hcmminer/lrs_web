import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, Inject, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { RequestApiModel } from 'src/app/pages/_models/request-api.model';
import { CommuneManagementService } from 'src/app/pages/_services/commune-management.service';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';

const MAX_FILE_SIZE_TEMPLATE = 1024 * 1024 * 10;

@Component({
  selector: 'app-form-add-edit-commune',
  templateUrl: './form-add-edit-commune.component.html',
  styleUrls: ['./form-add-edit-commune.component.scss']
})
export class FormAddEditCommuneComponent implements OnInit {


  //biến
  req;
  isUpdate;
  isUpdateFile;
  item;
  @Output() closeContent = new EventEmitter<any>();
  @ViewChild('popupMessage') popupMessage: ElementRef;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  magicButtonUpdate: boolean = false;
  dataSource: MatTableDataSource<any>;
  isErrorFile: boolean = false;
  isHasSuccessFile: boolean = false;
  constructionDateErrorMsg = '';
  valueChange: boolean = false;
  dataNullErr: boolean = false;
  currentPage = 1;
  pageSize;
  resultDesc;
  resultCode: string;
  userName: any;
  addEditForm: FormGroup;
  addFileForm: FormGroup;
  addType: string = 'single';
  addTypeList = [
    {
      value: 'single',
      name: this.translate.instant('LABEL.INPUT_SINGLE'),
      checked: true,
    },
    {
      value: 'file',
      name: this.translate.instant('LABEL.UPLOAD_FILE'),
      checked: false,
    },
  ];
  private subscriptions: Subscription[] = [];
  selectedFile: any = null;
  resultFileData: any = null;
  totalSuccess: number = null;
  totalRecord: number = null;
  isHasResult: boolean = false;
  columnsToDisplay: any;
  modelChanged = new Subject<string>();
  //

  constructor(
    public fb: FormBuilder,
    // private globalService: GlobalService,
    public modalService: NgbModal,
    public translate: TranslateService,
    public toastrService: ToastrService,
    private activeModal: NgbActiveModal,
    public spinner: NgxSpinnerService,
    public communeManagementService: CommuneManagementService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector,
  ) {
  }


  ngOnInit(): void {
    this.loadAddForm();
    let requestListProvince = {
      functionName: "getListProvince",
      userName: this.userName,
      provinceName: "",
    };
    this.communeManagementService.getcbxProvinces(requestListProvince, true);
    // this.initCombobox();
    // this.modelChanged.pipe(debounceTime(800)).subscribe((str:any) => {     
    //   let tempAssetCode = !str.assetCode
    //   ? str
    //   : str.assetCode;
    //   let reqGetListStatus = {
    //     userName: this.userName,
    //     searchDTO: {
    //       assetCode: tempAssetCode,
    //       pageSize: 10,
    //       pageNumber: 1,
    //     },
    //   };
    //   this.openingBalanceService.getCbxBcParentAssetCode(reqGetListStatus, 'get-bc-parent-asset-code', tempAssetCode);
    // });
    // this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    // if (this.isUpdateFile) {
    //   this.columnsToDisplay = [
    //     'index',
    //     'assetCode',
    //     'materialTotalStr',
    //     'materialStr',
    //     'laborTotalStr',
    //     'laborStr',
    //     'constructionDateStr',
    //     'errorMsg',
    //   ];
    //   this.addType = 'file';
    //   this.loadAddFileForm();
    // } else {
    //   this.columnsToDisplay = [
    //     'index',
    //     'organisation',
    //     'parentAssetCode',
    //     'assetCode',
    //     'contract',
    //     'material',
    //     'labor',
    //     'constructionDateStr',
    //     'errorMsg',
    //   ];
    // }

  }

  loadAddForm() {
    this.addEditForm = this.fb.group({
      proId:[this.isUpdate ? this.item.proId : '', [Validators.required]],
      communeCode: [this.isUpdate ? this.item.distCode : '', [Validators.required]],
      communeName: [this.isUpdate ? this.item.distName : '', [Validators.required]],
    })
  }

  loadAddFileForm() {
    this.addFileForm = this.fb.group({
      chonFile: [null, [Validators.required]],
    });
  }


  //change page
  onPaginateChange(event) {
    if (event) {
      this.currentPage = event.pageIndex;
      this.pageSize = event.pageSize;
    }
  }

  handleClose() {
    this.closeContent.emit(true);
  }

  closeDialog() {
    this.activeModal.close();
  }

  openModal(_content) {
    this.modalService.open(_content, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      centered: true,
    });
  }
  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addEditForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addEditForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    if (this.constructionDateErrorMsg !== '') {
      isValid = false;
    }
    return isValid;
  }

  changeState() {
    if (this.addType == 'single') {
      this.loadAddForm();
    } else {
      this.loadAddFileForm();
    }
  }

  conditionAddEdit() {
    const requestTarget = {
      functionName: this.isUpdate ? 'updateDistrict' : 'addDistrict',
      userName: this.userName,
      districtDTO: {
        proId: +this.addEditForm.get("proId").value,
        distName: this.addEditForm.get("communeName").value,
        distCode: this.addEditForm.get("communeCode").value,
        distId: this.isUpdate ? this.item.distId : null
      },
    };
    return this.communeManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  //add hoặc edit
  save() {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.isUpdate
        ? this.translate.instant('COMMUNE_MANAGEMENT.CONFIRM_UPDATE')
        : this.translate.instant('COMMUNE_MANAGEMENT.CONFIRM_UPDATE'),
      continue: true,
      cancel: true,
      btn: [
        { text: this.translate.instant('CANCEL'), className: 'btn-outline-warning btn uppercase mx-2' },
        { text: this.translate.instant('CONTINUE'), className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        let request = this.conditionAddEdit().subscribe((res) => {
          if (res.errorCode === '0') {
            this.toastrService.success(
              this.isUpdate
                ? this.translate.instant('COMMUNE_MANAGEMENT.UPDATE_SUCCESS')
                : this.translate.instant('COMMUNE_MANAGEMENT.ADD_SUCCESS'),
            );
            this.activeModal.close();
            this.handleClose();
          } else {
            this.toastrService.error(res.description);
            this.handleClose();
          }
        });
        this.subscriptions.push(request);
      },
      (reason) => {},
    );
  }


  //theo file
  // apiGetTemplate() {
  //   let req;
  //   if (this.isUpdateFile) {
  //     req = this.req;
  //   } else {
  //     req = {
  //       userName: this.userName,
  //     };
  //   }
  //   return this.globalService.globalApi(
  //     req,
  //     this.isUpdateFile ? 'down-temp-update-bc-opening' : 'down-temp-add-bc-opening',
  //   );
  // }
  // getTemplate() {
  //   const sub = this.apiGetTemplate().subscribe((res) => {
  //     if (res.errorCode == '0') {
  //       this.toastService.success(this.translate.instant('COMMON.MESSAGE.DOWNLOAD_SUCCESS'));
  //       this.spinner.hide();
  //       const byteCharacters = atob(res.dataExtension);
  //       const byteNumbers = new Array(byteCharacters.length);
  //       for (let i = 0; i < byteCharacters.length; i++) {
  //         byteNumbers[i] = byteCharacters.charCodeAt(i);
  //       }
  //       const byteArray = new Uint8Array(byteNumbers);
  //       const file = new Blob([byteArray], { type: res.extension });
  //       const urlDown = URL.createObjectURL(file);
  //       const link = document.createElement('a');
  //       link.href = urlDown;
  //       link.download = `Template_${timeToName(new Date())}.${res.extension}`; // đặt tên file tải về
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     } else {
  //       this.toastService.error(res.description);
  //     }
  //   });
  //   this.subscriptions.push(sub);
  // }

  // eUpdateFromFile() {
  //   if (!this.isValidFileForm()) {
  //     this.addFileForm.markAllAsTouched();
  //     return;
  //   }
  //   const modalRef = this.modalService.open(CommonAlertDialogComponent, {
  //     centered: true,
  //     backdrop: 'static',
  //   });
  //   modalRef.componentInstance.data = {
  //     type: 'WARNING',
  //     title: 'MODAL_WARNING',
  //     message: this.translate.instant('MESSAGE.CF_UPLOAD_FILE'),
  //     continue: true,
  //     cancel: true,
  //     btn: [
  //       {
  //         text: 'CANCEL',
  //         className: 'btn-outline-warning btn uppercase mx-2',
  //       },
  //       { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
  //     ],
  //   };
  //   modalRef.result.then(
  //     (result) => {
  //       this.isHasResult = false;
  //       this.resultFileData = null;
  //       const formData: FormData = new FormData();
  //       formData.append('fileCreateRequest', this.selectedFile);
  //       const requestTarget = {
  //         params: {
  //           userName: this.userName,
  //         },
  //         formData: formData,
  //       };

  //       this.dataSource = new MatTableDataSource([]);
  //       let request = this.globalService
  //         .globalApi(requestTarget, this.isUpdateFile ? 'update-bc-opening-by-file' : 'add-bc-opening-by-file')
  //         .subscribe(
  //           (res) => {
  //             if (res.errorCode == '0') {
  //               this.toastService.success(this.translate.instant('MESSAGE.UPLOAD_FILE_SC'));
  //               this.openingBalanceService.errOpeningBalanceList.next(res.data);
  //               this.dataSource = new MatTableDataSource(this.openingBalanceService.errOpeningBalanceList.value);
  //               this.dataSource.paginator = this.paginator;
  //               this.dataSource.sort = this.sort;
  //               let isError = res.data.find((item) => item.errorMsg != '');
  //               this.totalSuccess = res.data.filter((item) => item.errorMsg == '').length;
  //               this.totalRecord = res.data.length;
  //               this.isHasResult = true;
  //               if (isError) {
  //                 this.openingBalanceService.getErrOpeningBalanceFile.next(res);
  //                 this.isErrorFile = true;
  //               } else {
  //                 this.openingBalanceService.getErrOpeningBalanceFile.next(null);
  //                 this.isErrorFile = false;
  //               }
  //               this.magicButtonUpdate = isError ? false : true;
  //               this.dataNullErr = false;
  //             } else if (res.errorCode == '1') {
  //               this.isHasResult = true;
  //               this.totalSuccess = 0;
  //               this.totalRecord = 0;
  //               this.isErrorFile = true;
  //               this.dataNullErr = true;
  //               this.toastService.error(res.description);
  //             } else {
  //               this.toastService.error(res.description);
  //             }
  //           },
  //           (error) => {
  //             this.toastService.error(this.translate.instant('SYSTEM_ERROR'));
  //           },
  //         );
  //       this.subscriptions.push(request);
  //     },
  //     (reason) => {},
  //   );
  // }

  //confirm file
  // apiCofirmUpdateByFile() {
  //   const req = {
  //     userName: this.userName,
  //     listConstructionDTO: this.openingBalanceService.errOpeningBalanceList.value,
  //   };
  //   return this.globalService.globalApi(
  //     req,
  //     this.isUpdateFile ? 'confirm-update-bc-opening-by-file' : 'confirm-add-bc-opening-by-file',
  //   );
  // }

  // eDownloadFileSuccess() {
  //   const sub = this.openingBalanceService.getSuccessOpeningBalanceFile.subscribe((res) => {
  //     if (res.errorCode == '0' || res.errorCode == '3') {
  //       this.toastService.success(this.translate.instant('COMMON.MESSAGE.DOWNLOAD_SUCCESS'));
  //       this.spinner.hide();
  //       const byteCharacters = atob(res.data);
  //       const byteNumbers = new Array(byteCharacters.length);
  //       for (let i = 0; i < byteCharacters.length; i++) {
  //         byteNumbers[i] = byteCharacters.charCodeAt(i);
  //       }
  //       const byteArray = new Uint8Array(byteNumbers);
  //       const file = new Blob([byteArray], { type: res.extension });
  //       const urlDown = URL.createObjectURL(file);
  //       const link = document.createElement('a');
  //       link.href = urlDown;
  //       link.download = `file_success_${timeToName(new Date())}.${res.extension}`; // đặt tên file tải về
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     } else {
  //       this.toastService.error(res.description);
  //     }
  //   });
  //   this.subscriptions.push(sub);
  // }

  // eCofirmUpdateByFile() {
  //   const modalRef = this.modalService.open(CommonAlertDialogComponent, {
  //     centered: true,
  //     backdrop: 'static',
  //   });
  //   modalRef.componentInstance.data = {
  //     type: 'WARNING',
  //     title: 'MODAL_WARNING',
  //     message: this.isUpdateFile
  //       ? this.translate.instant('MESSAGE.CF_UPDATE_OP_BL_BY_FILE')
  //       : this.translate.instant('MESSAGE.CF_ADD_OP_BL_BY_FILE'),
  //     continue: true,
  //     cancel: true,
  //     btn: [
  //       {
  //         text: 'CANCEL',
  //         className: 'btn-outline-warning btn uppercase mx-2',
  //       },
  //       { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
  //     ],
  //   };
  //   modalRef.result.then(
  //     (result) => {
  //       if (this.openingBalanceService.errOpeningBalanceList.value.find((item) => item.errorMsg == '')) {
  //         const sub = this.apiCofirmUpdateByFile().subscribe((res) => {
  //           if (res.errorCode == '0') {
  //             this.isHasSuccessFile = true;
  //             this.openingBalanceService.getSuccessOpeningBalanceFile.next(res);
  //             this.resultDesc = res.description;
  //             this.resultCode = 'success';
  //             this.toastService.success(
  //               this.isUpdateFile
  //                 ? this.translate.instant('MESSAGE.UPDATE_OP_BL_FROM_FILE_SC')
  //                 : this.translate.instant('MESSAGE.ADD_OP_BL_FROM_FILE_SC'),
  //             );
  //           } else if (res.errorCode == '3') {
  //             this.resultDesc = res.description;
  //             this.resultCode = 'warning';
  //             this.isHasSuccessFile = true;
  //             this.openingBalanceService.getSuccessOpeningBalanceFile.next(res);
  //             this.toastService.warning(this.resultDesc);
  //           } else {
  //             this.isHasSuccessFile = false;
  //             this.openingBalanceService.getSuccessOpeningBalanceFile.next(null);
  //             this.toastService.error(this.translate.instant('SYSTEM_ERROR'));
  //           }
  //         });
  //         this.subscriptions.push(sub);
  //       }
  //     },
  //     (reason) => {},
  //   );
  // }

  // eDownloadErrFile() {
  //   const sub = this.openingBalanceService.getErrOpeningBalanceFile.subscribe((res) => {
  //     if (res.errorCode == '0') {
  //       this.toastService.success(this.translate.instant('COMMON.MESSAGE.DOWNLOAD_SUCCESS'));
  //       this.spinner.hide();
  //       const byteCharacters = atob(res.dataExtension);
  //       const byteNumbers = new Array(byteCharacters.length);
  //       for (let i = 0; i < byteCharacters.length; i++) {
  //         byteNumbers[i] = byteCharacters.charCodeAt(i);
  //       }
  //       const byteArray = new Uint8Array(byteNumbers);
  //       const file = new Blob([byteArray], { type: res.extension });
  //       const urlDown = URL.createObjectURL(file);
  //       const link = document.createElement('a');
  //       link.href = urlDown;
  //       link.download = `file_error_${timeToName(new Date())}.${res.extension}`; // đặt tên file tải về
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     } else {
  //       this.toastService.error(res.description);
  //     }
  //   });
  //   this.subscriptions.push(sub);
  // }

  onFileSelected(event: any): void {
    this.validateFile(event);
    this.selectedFile = event.target.files[0] ?? null;
    this.resultFileData = null;
    this.magicButtonUpdate = false;
    this.totalRecord = 0;
    this.dataSource = new MatTableDataSource([]);
    this.isHasResult = false;
  }

  validateFile(event: any) {
    let file = event.target.files[0];

    //check định dạng
    let allowedType: string[] = ['xls', 'xlsx'];
    let fileExtension: string = file.name.substring(file.name.lastIndexOf('.') + 1);
    if (!allowedType.includes(fileExtension)) {
      this.toastService.error(
        this.translate.instant('VALIDATION.FILE_INVALID_EXTENSION', {
          0: '.xls, .xlsx',
        }),
      );
      return;
    }
    //check dung luong
    if (file.size > MAX_FILE_SIZE_TEMPLATE) {
      this.toastService.error(this.translate.instant('VALIDATION.FILE_MAX_SIZE', { 0: 10 }));
      return;
    }
    // // check up trung file
    // if(file){
    //   file.name === null ? this.flag = true : this.flag = false;
    // }

    // this.fileNameTemplate = file.name;
    // this.file = file;
  }

  isValidFileForm(): boolean {
    let isValid = true;
    Object.keys(this.addFileForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addFileForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  //check number
  isNumber(amountApproved: any) {
    return Number(amountApproved);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  eCloseAndReRender() {
    this.activeModal.close();
  }

  onFileResset(event: any): void {
    event.target.value = null;
  }

  eCloseWithoutEdit() {
    this.activeModal.close();
  }

  isControlInvalidFile(controlName: string): boolean {
    const control = this.addFileForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasErrorFile(validation, controlName): boolean {
    const control = this.addFileForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
