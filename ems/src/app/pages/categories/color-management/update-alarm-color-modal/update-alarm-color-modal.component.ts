import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ErrorCategoriesService} from '../../../_services/error-categories.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, finalize} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import { AlarmColorModel } from 'src/app/pages/_models/error-categories.model';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-update-alarm-color-modal',
  templateUrl: './update-alarm-color-modal.component.html',
  styleUrls: ['./update-alarm-color-modal.component.scss']
})
export class UpdateAlarmColorModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
      public modal: NgbActiveModal,
      private toastrService: ToastrService,
      private errorCategoriesService: ErrorCategoriesService,
      public translate: TranslateService
  ) {
  }

  ngOnInit(): void {
  }

  update() {
    this.isLoading = true;

    const sb = this.errorCategoriesService.updateAlarmColor(this.errorCategoriesService.listAlarmColor.value).pipe(
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
        this.toastrService.success(this.translate.instant('CATEGORY.COLOR_MANAGEMENT.UPDATE.SUCCESS'), 'Success');
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
