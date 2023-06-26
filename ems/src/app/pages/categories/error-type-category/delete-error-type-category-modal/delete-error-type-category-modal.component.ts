import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {catchError, finalize} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ErrorCategoriesService} from '../../../_services/error-categories.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-delete-error-type-category-modal',
  templateUrl: './delete-error-type-category-modal.component.html',
  styleUrls: ['./delete-error-type-category-modal.component.scss']
})
export class DeleteErrorTypeCategoryModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
      public modal: NgbActiveModal,
      private toastrService: ToastrService,
      private errorCategoriesService: ErrorCategoriesService,
      public translateService: TranslateService
  ) { }

  ngOnInit(): void {
  }

  delete() {
    this.isLoading = true;
    const sb = this.errorCategoriesService.deleteErrorType(this.id).pipe(
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
