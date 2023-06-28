
import { Component, ElementRef, Inject, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Subscription, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/pages/cm_service/common.service';
import { ConfigSystemService } from 'src/app/pages/cm_service/config-system.service';
import { AddEditDataComponent } from './childs/add-edit-data/add-edit-data-problem.component';
import { RequestApiModel } from 'src/app/pages/_model_api/request-api.model';
import { CommonAlertDialogComponent } from 'src/app/pages/materials/common-alert-dialog/common-alert-dialog.component';
import { cm } from '../../lang';

@Component({
  selector: 'app-tab-option-set',
  templateUrl: './tab-option-set.component.html',
  styleUrls: ['./tab-option-set.component.scss']
})
export class TabOptionSetComponent implements OnInit, OnDestroy {
  cm = cm;
  applyFilter(event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  searchForm: FormGroup;
  dataSource: MatTableDataSource<any>;
  @ViewChild('formSearch') formSearch: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  columnsToDisplay = ['index', 'typeCbx', 'valueVn', 'valueEn', 'valueLa', 'description', 'createdBy', 'createdDatetime', 'action'];

  constructor(
    public configSystemService : ConfigSystemService,
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public commonService: CommonService,
    public toastrService: ToastrService,
    public spinner: NgxSpinnerService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector,
  ) {}
  loadSearchForm() {
    this.searchForm = this.fb.group({
      problem: [this.problem],
    });
  }
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadSearchForm();
    this.eSearch();
    this.configSystemService.getListOptionSet({ functionName: 'listOptionSet' }, true);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  eResetForm() {
    this.loadSearchForm();
  }
  // tim kiem nhan vien theo truong
  eSearch() {
    if (!this.isValidForm()) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.conditionSearch().subscribe((res) => {
      if (res.errorCode == '0') {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.toastService.error(res.description);
      }
    });
  }

  openModal(item, action) {
    // if (this.searchForm.get('problem').value == '') {
    //   this.searchForm.controls['problem'].setValue('COLUMN_TYPE');
    // }
    const modalRef = this.modalService.open(AddEditDataComponent, {
      centered: true,
      backdrop: false,
      size: 'xl',
    });
    modalRef.componentInstance.propData = item;
    modalRef.componentInstance.propAction = action;
    modalRef.componentInstance.typeCbx = this.searchForm.get('problem').value;

    modalRef.result.then(() => {
      this.eSearch();
    });
  }

  getListTypeProblemBox = new BehaviorSubject<any[]>([
    {
      value: '',
      name: this.translate.instant('LIST_STATUS.ALL'),
    },
    {
      value: 'COLUMN_TYPE',
      name: this.translate.instant('LABEL.COLUMN_TYPE'),
    },
    {
      value: 'MASTER_COLUMN',
      name: this.translate.instant('LABEL.MASTER_COLUMN'),
    },
    {
      value: 'FREQUENCY_BAND',
      name: this.translate.instant('LABEL.frequencyBand'),
    },
    {
      value: 'ANTEN_TYPE',
      name: this.translate.instant('LABEL.antenType'),
    },
    {
      value: 'STATION_HOUSE_PROBLEM',
      name: this.translate.instant('LABEL.STATION_HOUSE_PROBLEM'),
    },
    {
      value: 'CELL_SECTOR_PROBLEM',
      name: this.translate.instant('LABEL.CELL_SECTOR_PROBLEM'),
    },
  ]);

  problem = '';

  conditionSearch() {
    const requestTarget = {
      functionName: 'getListRootCbx',
      isAdmin: 1,
      typeCbx: this.searchForm.get('problem').value == '' ? null : this.searchForm.get('problem').value,
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: false,
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('confirmDel'),
      continue: true,
      cancel: true,
      btn: [
        { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
        { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        const requestTarget = {
          functionName: 'deleteRootCbx',
          id: item.id,
        };
        this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
          this.spinner.hide();
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('FUNCTION.SUCCSESS_DELETE'));
            this.eSearch();
          } else {
            this.toastService.error(res.description);
            this.eSearch();
          }
        });
      },
      (reason) => {},
    );
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.searchForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.searchForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }
  public get toastService() {
    return this.injector.get(ToastrService);
  }
  isControlInvalid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }


  // helpers for View
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }
}

