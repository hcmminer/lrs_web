import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorCategoriesService} from '../../_services/error-categories.service';
import {EditAlarmSeverityModalComponent} from './edit-alarm-severity-modal/edit-alarm-severity-modal.component';
import {DeleteAlarmSeverityModalComponent} from './delete-alarm-severity-modal/delete-alarm-severity-modal.component';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  code: null,
  name: null
};

@Component({
  selector: 'app-alarm-severity',
  templateUrl: './alarm-severity.component.html',
  styleUrls: ['./alarm-severity.component.scss']
})
export class AlarmSeverityComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  queryReset = {
    code: null,
    name: null
  };
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
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
    this.errorCategoriesService.getListAlarmSeverity(this.query);
    this.loadSearchForm();
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      alarmSeverityCodeSearch: [this.query.code],
      alarmSeverityNameSearch: [this.query.name]
    });
  }

  eReset(){
    Object.assign(this.query, this.queryReset);
  }

  search() {
    this.prepareSearch();
    this.query.currentPage = CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    this.errorCategoriesService.getListAlarmSeverity(this.query);
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
    const modalRef = this.modalService.open(EditAlarmSeverityModalComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.query = this.query;
    modalRef.result.then(() => this.errorCategoriesService.getListAlarmSeverity(this.query), () => {
    });
  }

  delete(rowdata: any): void {
    if(rowdata.status == 'O'){
      const modalRef = this.modalService.open(DeleteAlarmSeverityModalComponent, {backdrop: 'static', keyboard: false});
      modalRef.componentInstance.id = rowdata.alarmSeverityId;
      modalRef.result.then(() => this.errorCategoriesService.getListAlarmSeverity(this.query), () => {
      });
    }
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.query.currentPage = paginator.page;
    this.query.pageLimit = paginator.pageSize;
    this.errorCategoriesService.getListAlarmSeverity(this.query);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
