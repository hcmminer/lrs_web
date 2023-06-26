import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {Subscription} from 'rxjs';
import {SystemCategoriesService} from '../../_services/system-categories.service';
import {TranslateService} from '@ngx-translate/core';
import {EditSystemManagementModalComponent} from './edit-system-management-modal/edit-system-management-modal.component';
import {DeleteSystemManagementModalComponent} from './delete-system-management-modal/delete-system-management-modal.component';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  systemCode: null,
  systemName: null,
  systemCategoryId: -1,
  collectType: -1,
  status: -1
};

@Component({
  selector: 'app-system-management',
  templateUrl: './system-management.component.html',
  styleUrls: ['./system-management.component.scss']
})
export class SystemManagementComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  queryReset = {
    systemCode: null,
    systemName: null,
    systemCategoryId: -1,
    collectType: -1,
    status: -1
  };
  activeStatus = CONFIG.STATUS.ACTIVE;
  inactiveStatus = CONFIG.STATUS.INACTIVE;
  collectypeAuto = CONFIG.COLLECT_TYPE.AUTO;
  collectypeManual = CONFIG.COLLECT_TYPE.MANUAL;
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  listCollectType = CONFIG.LINE_COLLECT_TYPE;
  listStatus = CONFIG.LIST_STATUS;
  private subscriptions: Subscription[] = [];

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public systemCategoriesService: SystemCategoriesService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    const pa = this.systemCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.systemCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.systemCategoriesService.getListSystemManagement(this.query);
    const requestSystemCategory = this.systemCategoriesService.getListSystemCategoryBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe();
    this.subscriptions.push(requestSystemCategory);
    this.loadSearchForm();
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      systemCodeSearch: [this.query.systemCode],
      systemNameSearch: [this.query.systemName],
      systemCategorySearch: [this.query.systemCategoryId],
      collectTypeSearch: [this.query.collectType],
      statusSearch: [this.query.status]
    });
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.systemCategoriesService.getListSystemManagement(this.query);
  }

  private prepareSearch() {
    if (this.query.systemCode != null && this.query.systemCode !== '') {
      this.query.systemCode = this.query.systemCode.trim();
    }
    if (this.query.systemName != null && this.query.systemName !== '') {
      this.query.systemName = this.query.systemName.trim();
    }
  }

  create() {
    this.edit(undefined);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditSystemManagementModalComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.systemCategoriesService.getListSystemManagement(this.query), () => {
    });
  }

  delete(rowdata: any): void {
    if (rowdata.status == 'O') {
      const modalRef = this.modalService.open(DeleteSystemManagementModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.systemId;
      modalRef.result.then(() => this.systemCategoriesService.getListSystemManagement(this.query), () => {
      });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.systemCategoriesService.getListSystemManagement(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
