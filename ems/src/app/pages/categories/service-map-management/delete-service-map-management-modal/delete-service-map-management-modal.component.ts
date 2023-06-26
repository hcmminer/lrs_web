import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {catchError, finalize} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {ServiceManagementService} from '../../../_services/service-management.service';

@Component({
  selector: 'app-delete-service-map-management-modal',
  templateUrl: './delete-service-map-management-modal.component.html',
  styleUrls: ['./delete-service-map-management-modal.component.scss']
})
export class DeleteServiceMapManagementModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
      public modal: NgbActiveModal,
      private toastrService: ToastrService,
      public serviceManagementService: ServiceManagementService,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
  }

  delete() {
    this.isLoading = true;
    const sb = this.serviceManagementService.deleteServiceMap(this.id).pipe(
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          this.modal.dismiss(err);
          return of(undefined);
        }),
        finalize(() => {
          this.isLoading = false;
        })
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.toastrService.success(this.translateService.instant('COMMON.MESSAGE.DELETE_SUCCESS'), 'Success');
        this.modal.close();
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });
    this.subscriptions.push(sb);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
