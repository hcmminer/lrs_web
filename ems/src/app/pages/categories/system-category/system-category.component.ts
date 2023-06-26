import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {Subscription} from 'rxjs';
import {SystemCategoriesService} from '../../_services/system-categories.service';
import {EditSystemCategoryModalComponent} from './edit-system-category-modal/edit-system-category-modal.component';
import {DeleteSystemCategoryModalComponent} from './delete-system-category-modal/delete-system-category-modal.component';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  code: null,
  name: null,
  status: -1
};

@Component({
  selector: 'app-system-category',
  templateUrl: './system-category.component.html',
  styleUrls: ['./system-category.component.scss']
})
export class SystemCategoryComponent implements OnInit, OnDestroy {
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
      public systemCategoriesService: SystemCategoriesService
  ) { }

  ngOnInit(): void {
    const pa = this.systemCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.systemCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.systemCategoriesService.getListSystemCategory(this.query);
    this.loadSearchForm();
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      systemCategoryCodeSearch: [this.query.code],
      systemCategoryNameSearch: [this.query.name],
      statusSearch: [this.query.status]
    });
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.systemCategoriesService.getListSystemCategory(this.query);
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
    const modalRef = this.modalService.open(EditSystemCategoryModalComponent, { size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.systemCategoriesService.getListSystemCategory(this.query), () => { });
  }

  delete(rowdata: any): void {
    if(rowdata.status == 'O'){
      const modalRef = this.modalService.open(DeleteSystemCategoryModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.id;
      modalRef.result.then(() => this.systemCategoriesService.getListSystemCategory(this.query), () => { });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.systemCategoriesService.getListSystemCategory(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
