import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {Subscription} from 'rxjs';
import {ErrorCategoriesService} from '../../_services/error-categories.service';
import {EditErrorTypeCategoryModalComponent} from './edit-error-type-category-modal/edit-error-type-category-modal.component';
import {DeleteErrorTypeCategoryModalComponent} from './delete-error-type-category-modal/delete-error-type-category-modal.component';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  code: null,
  name: null,
  status: -1
};

@Component({
  selector: 'app-error-type-category',
  templateUrl: './error-type-category.component.html',
  styleUrls: ['./error-type-category.component.scss']
})
export class ErrorTypeCategoryComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  queryReset = {
    code: null,
    name: null,
    status: -1
  };
  activeStatus = CONFIG.STATUS.ACTIVE;
  inactiveStatus = CONFIG.STATUS.INACTIVE;
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  listStatus = CONFIG.LIST_STATUS;
  private subscriptions: Subscription[] = [];

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public errorCategoriesService: ErrorCategoriesService
  ) {
  }

  ngOnInit(): void {
    const pa = this.errorCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.errorCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.errorCategoriesService.getListErrorType(this.query);
    this.loadSearchForm();
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      errorTypeCodeSearch: [this.query.code],
      errorTypeNameSearch: [this.query.name],
      statusSearch: [this.query.status]
    });
  }

  eReset(){
    Object.assign(this.query, this.queryReset);
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.errorCategoriesService.getListErrorType(this.query);
  }

  private prepareSearch() {
    if (this.query.code != null && this.query.code !== '') {
      this.query.code = this.query.code.trim();
    }
    if (this.query.name != null && this.query.name !== '') {
      this.query.name = this.query.name.trim();
    }
  }

  create() {
    this.edit(undefined);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditErrorTypeCategoryModalComponent, { size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.errorCategoriesService.getListErrorType(this.query), () => { });
  }

  delete(rowdata: any): void {
    if(rowdata.status == 'O'){
      const modalRef = this.modalService.open(DeleteErrorTypeCategoryModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.id;
      modalRef.result.then(() => this.errorCategoriesService.getListErrorType(this.query), () => { });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.errorCategoriesService.getListErrorType(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
