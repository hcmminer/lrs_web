import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {ActionCategoriesService} from '../../_services/action-categories.service';
import {EditActionManagementModalComponent} from './edit-action-management-modal/edit-action-management-modal.component';
import {DeleteActionManagementModalComponent} from './delete-action-management-modal/delete-action-management-modal.component';
import {ResponseModel} from '../../_models/response.model';
import {ActionCategoriesModel} from '../../_models/action-categories.model';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  actionCode: null,
  actionName: null,
  categoryId: -1,
  actionType: 'A',
  referActionCode: null,
  status: -1
};

@Component({
  selector: 'app-action-management',
  templateUrl: './action-management.component.html',
  styleUrls: ['./action-management.component.scss']
})
export class ActionManagementComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  queryReset = {
    actionCode: null,
    actionName: null,
    categoryId: -1,
    actionType: 'A',
    referActionCode: null,
    status: -1
  };
  activeStatus = CONFIG.STATUS.ACTIVE;
  inactiveStatus = CONFIG.STATUS.INACTIVE;
  actionTypeProduct = CONFIG.ACTION_TYPE.PRODUCT;
  actionTypeAction = CONFIG.ACTION_TYPE.ACTION;
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  listActionType = CONFIG.LINE_ACTION_TYPE;
  listStatus = CONFIG.LIST_STATUS;
  private subscriptions: Subscription[] = [];

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public actionCategoriesService: ActionCategoriesService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    const pa = this.actionCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.actionCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.actionCategoriesService.getListActionManagement(this.query);
    const getCbx = this.actionCategoriesService.getListCategoryBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.actionCategoriesService.cbxCategory.next([]);
        if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
          this.actionCategoriesService.cbxCategory.next(res.data as ActionCategoriesModel[]);
        }
        this.actionCategoriesService.cbxCategory.value.unshift({
          categoryId: -1,
          categoryName: this.translateService.instant('LIST_STATUS.ALL')
        });
      }
    });
    this.subscriptions.push(getCbx);
    this.loadSearchForm();
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      actionCodeSearch: [this.query.actionCode],
      actionNameSearch: [this.query.actionName],
      categoryIdSearch: [this.query.categoryId],
      actionTypeSearch: [this.query.actionType],
      referActionCodeSearch: [this.query.referActionCode],
      statusSearch: [this.query.status]
    });
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.actionCategoriesService.getListActionManagement(this.query);
  }

  private prepareSearch() {
    if (this.query.actionCode != null && this.query.actionCode !== '') {
      this.query.actionCode = this.query.actionCode.trim();
    }
    if (this.query.actionName != null && this.query.actionName !== '') {
      this.query.actionName = this.query.actionName.trim();
    }
    if (this.query.referActionCode != null && this.query.referActionCode !== '') {
      this.query.referActionCode = this.query.referActionCode.trim();
    }
  }

  create() {
    this.edit(undefined);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditActionManagementModalComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.actionCategoriesService.getListActionManagement(this.query), () => {
    });
  }

  delete(rowdata: any): void {
    if (rowdata.status == 'O') {
      const modalRef = this.modalService.open(DeleteActionManagementModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.actionId;
      modalRef.result.then(() => this.actionCategoriesService.getListActionManagement(this.query), () => {
      });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.actionCategoriesService.getListActionManagement(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
