import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {ServiceManagementService} from '../../_services/service-management.service';
import {EditServiceManagementModalComponent} from './edit-service-management-modal/edit-service-management-modal.component';
import {DeleteServiceManagementModalComponent} from './delete-service-management-modal/delete-service-management-modal.component';
import {ResponseModel} from '../../_models/response.model';
import {ServiceModel} from '../../_models/service.model';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  serviceCode: null,
  serviceName: null,
  serviceType: 'A',
  systemId: -1,
  status: -1
};

@Component({
  selector: 'app-service-management',
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss']
})
export class ServiceManagementComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  queryReset = {
    serviceCode: null,
    serviceName: null,
    serviceType: 'A',
    systemId: -1,
    status: -1
  };
  activeStatus = CONFIG.STATUS.ACTIVE;
  inactiveStatus = CONFIG.STATUS.INACTIVE;
  // disconnectStatus = CONFIG.STATUS_SERVICE.DISCONNECT;
  serviceTypeFE = CONFIG.SERVICE_TYPE.FRONTEND;
  serviceTypeBE = CONFIG.SERVICE_TYPE.BACKEND;
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  listServiceType = CONFIG.LINE_SERVICE_TYPE;
  listServiceStatus = CONFIG.LIST_STATUS;
  private subscriptions: Subscription[] = [];

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public serviceManagementService: ServiceManagementService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    const pa = this.serviceManagementService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.serviceManagementService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.serviceManagementService.getListServiceManagement(this.query);
    const lsb = this.serviceManagementService.getListSystemBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe(
        (res: ResponseModel) => {
          if (!res.status) {
            throw new Error(res.message);
          } else {
            this.serviceManagementService.cbxSystem.next([]);
            if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
              this.serviceManagementService.cbxSystem.next(res.data as ServiceModel[]);
            }
            this.serviceManagementService.cbxSystem.value.unshift({
              systemId: -1,
              systemName: this.translateService.instant('LIST_STATUS.ALL')
            });
          }
        });
    this.subscriptions.push(lsb);
    this.loadSearchForm();
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      serviceCodeSearch: [this.query.serviceCode],
      serviceNameSearch: [this.query.serviceName],
      serviceTypeSearch: [this.query.serviceType],
      systemSearch: [this.query.systemId],
      statusSearch: [this.query.status]
    });
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.serviceManagementService.getListServiceManagement(this.query);
  }

  private prepareSearch() {
    if (this.query.serviceCode != null && this.query.serviceCode !== '') {
      this.query.serviceCode = this.query.serviceCode.trim();
    }
    if (this.query.serviceName != null && this.query.serviceName !== '') {
      this.query.serviceName = this.query.serviceName.trim();
    }
  }

  create() {
    this.edit(undefined);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditServiceManagementModalComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.serviceManagementService.getListServiceManagement(this.query), () => {
    });
  }

  delete(rowdata: any): void {
    if (rowdata.status == 'O') {
      const modalRef = this.modalService.open(DeleteServiceManagementModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.serviceId;
      modalRef.result.then(() => this.serviceManagementService.getListServiceManagement(this.query), () => {
      });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.serviceManagementService.getListServiceManagement(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
