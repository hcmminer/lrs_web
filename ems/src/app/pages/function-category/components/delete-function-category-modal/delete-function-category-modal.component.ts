import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {FunctionCategoriesService} from '../../../_services/function-categories.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {catchError, delay, finalize, tap} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-delete-function-category-modal',
  templateUrl: './delete-function-category-modal.component.html',
  styleUrls: ['./delete-function-category-modal.component.scss']
})
export class DeleteFunctionCategoryModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private functionCategoriesService: FunctionCategoriesService,
    public modal: NgbActiveModal,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
  }

  delete() {
    this.isLoading = true;
    const sb = this.functionCategoriesService.delete(this.id).pipe(
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
        this.toastrService.success(res.message, 'Success');
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
