import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFunctionCategoryModalComponent} from './components/edit-function-category-modal/edit-function-category-modal.component';
import {ICreateAction, IDeleteAction, IEditAction, PaginatorState} from '../../_metronic/shared/crud-table';
import {FunctionCategoriesService} from '../_services/function-categories.service';
import {Subscription} from 'rxjs';
import {DeleteFunctionCategoryModalComponent} from './components/delete-function-category-modal/delete-function-category-modal.component';
import { CONFIG } from '../../utils/constants';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {getDateInputWithFormat, getDateInput} from '../../utils/functions';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  categoryCode: null,
  categoryName: null,
  validFromDate: '',
  validFrom: undefined,
  validToDate: '',
  validTo: undefined,
  status: -1,
};

@Component({
  selector: 'app-function-category',
  templateUrl: './function-category.component.html',
  styleUrls: ['./function-category.component.scss']
})
export class FunctionCategoryComponent implements
  OnInit,
  OnDestroy,
  ICreateAction,
  IEditAction,
  IDeleteAction {
  query = {
    ...queryInit
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
    public functionCategoriesService: FunctionCategoriesService
  ) { }

  ngOnInit(): void {
    const pa = this.functionCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.functionCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.functionCategoriesService.getList(this.query);
    this.loadSearchForm();
  }

  create() {
    this.edit(undefined);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditFunctionCategoryModalComponent, { size: 'lg' });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
  }

  delete(id: number): void {
    const modalRef = this.modalService.open(DeleteFunctionCategoryModalComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(() => this.functionCategoriesService.getList(this.query), () => { });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.functionCategoriesService.getList(this.query);
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.functionCategoriesService.getList(this.query);
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      categoryCodeSearch: [this.query.categoryCode],
      categoryNameSearch: [this.query.categoryName],
      validFromSearch: [this.query.validFromDate],
      validToSearch: [this.query.validToDate],
      statusSearch: [this.query.status]
    });
  }

  private prepareSearch() {
    const searchFormValue = this.searchForm.value;
    const validFrom = searchFormValue.validFromSearch;
    const validTo = searchFormValue.validToSearch;
    this.query.validFromDate = getDateInputWithFormat(validFrom, CONFIG.FORMAT_DATE.NORMAL);
    this.query.validToDate = getDateInputWithFormat(validTo, CONFIG.FORMAT_DATE.NORMAL);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
