import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ServiceManagementService} from '../../_services/service-management.service';
import {EditServiceMapManagementModalComponent} from './edit-service-map-management-modal/edit-service-map-management-modal.component';
// tslint:disable-next-line:max-line-length
import {DeleteServiceMapManagementModalComponent} from './delete-service-map-management-modal/delete-service-map-management-modal.component';
import {ResponseModel} from '../../_models/response.model';
import {ServiceModel} from '../../_models/service.model';
import {TranslateService} from '@ngx-translate/core';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  serviceId: -1,
  secondServiceId: -1,
  status: 'A'
};

const serviceNames = {
  serviceName1: '',
  serviceName2: ''
};

@Component({
  selector: 'app-service-map-management',
  templateUrl: './service-map-management.component.html',
  styleUrls: ['./service-map-management.component.scss']
})
export class ServiceMapManagementComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  serviceName = {
    ...serviceNames
  };
  queryReset = {
    serviceId: -1,
    secondServiceId: -1,
    status: 'A'
  };
  activeStatus = CONFIG.STATUS_SERVICE.ACTIVE;
  inactiveStatus = CONFIG.STATUS_SERVICE.INACTIVE;
  disconnectStatus = CONFIG.STATUS_SERVICE.DISCONNECT;
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  listServiceMapStatus = CONFIG.LINE_SERVICE_STATUS;
  private subscriptions: Subscription[] = [];

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public translateService: TranslateService,
      public serviceManagementService: ServiceManagementService
  ) {
  }

  ngOnInit(): void {
    const pa = this.serviceManagementService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.serviceManagementService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    this.serviceManagementService.getListServiceMap(this.query);
    const seb = this.serviceManagementService.getListServiceBox({
      pageLimit: 1000,
      currentPage: 1,
      status: 'O',
      typeRequest: 'COMBOBOX'
    }).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.serviceManagementService.cbxService.next([]);
        if (typeof (res.data) !== 'undefined' && res.data !== null && res.data.toString().length > 0) {
          this.serviceManagementService.cbxService.next(res.data as ServiceModel[]);
        }
        this.serviceManagementService.cbxService.value.unshift({
          serviceId: -1,
          serviceCode: this.translateService.instant('LIST_STATUS.ALL'),
          serviceName: this.translateService.instant('LIST_STATUS.ALL')
        });
      }
    });
    this.subscriptions.push(seb);
    this.loadSearchForm();
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
    this.onChangeService(1);
    this.onChangeService(2);
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      service1: [this.query.serviceId],
      service2: [this.query.secondServiceId],
      serviceName1: [this.serviceName.serviceName1],
      serviceName2: [this.serviceName.serviceName2],
      statusSearch: [this.query.status]
    });
  }

  onChangeService(type: number) {
    if (type === 1) {
      const index = this.serviceManagementService.cbxService.value.findIndex(
          service => service.serviceId === +this.query.serviceId);
      if (index > -1 && +this.query.serviceId !== -1) {
        this.serviceName.serviceName1 = this.serviceManagementService.cbxService.value[index].serviceName;
      } else {
        this.serviceName.serviceName1 = '';
      }
    } else {
      const index2 = this.serviceManagementService.cbxService.value.findIndex(
          service2 => +this.query.secondServiceId === service2.serviceId);
      if (index2 > -1 && +this.query.secondServiceId !== -1) {
        this.serviceName.serviceName2 = this.serviceManagementService.cbxService.value[index2].serviceName;
      } else {
        this.serviceName.serviceName2 = '';
      }
    }
  }

  search() {
    // this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.serviceManagementService.getListServiceMap(this.query);
  }

  create() {
    this.edit(undefined);
  }

  edit(id: number): void {
    const modalRef = this.modalService.open(EditServiceMapManagementModalComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.serviceManagementService.getListServiceMap(this.query), () => {
    });
  }

  delete(rowdata: any): void {
    if (rowdata.status != 'C') {
      const modalRef = this.modalService.open(DeleteServiceMapManagementModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.mapId;
      modalRef.result.then(() => this.serviceManagementService.getListServiceMap(this.query), () => {
      });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.serviceManagementService.getListServiceMap(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
