import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActionCategoriesService} from '../../_services/action-categories.service';
import {EditActionCategoryModalComponent} from './edit-action-category-modal/edit-action-category-modal.component';
import {DeleteActionCategoryModalComponent} from './delete-action-category-modal/delete-action-category-modal.component';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  code: null,
  name: null,
  status: -1
};

@Component({
  selector: 'app-action-category',
  templateUrl: './action-category.component.html',
  styleUrls: ['./action-category.component.scss']
})
export class ActionCategoryComponent implements OnInit, OnDestroy {
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
      public actionCategoriesService: ActionCategoriesService
  ) {
  }

  ngOnInit(): void {
    const pa = this.actionCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.actionCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.actionCategoriesService.getListActionCategory(this.query);
    this.loadSearchForm();
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      actionCategoryCodeSearch: [this.query.code],
      actionCategoryNameSearch: [this.query.name],
      statusSearch: [this.query.status]
    });
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.actionCategoriesService.getListActionCategory(this.query);
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
    const modalRef = this.modalService.open(EditActionCategoryModalComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.actionCategoriesService.getListActionCategory(this.query), () => {
    });
  }

  delete(rowdata: any): void {
    if (rowdata.status === 'O') {
      const modalRef = this.modalService.open(DeleteActionCategoryModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.categoryId;
      modalRef.result.then(() => this.actionCategoriesService.getListActionCategory(this.query), () => {
      });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.actionCategoriesService.getListActionCategory(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
