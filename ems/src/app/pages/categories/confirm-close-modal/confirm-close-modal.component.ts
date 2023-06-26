import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ErrorCategoriesService} from '../../_services/error-categories.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, finalize} from 'rxjs/operators';
import {ResponseModel} from '../../_models/response.model';

@Component({
  selector: 'app-confirm-close-modal',
  templateUrl: './confirm-close-modal.component.html',
  styleUrls: ['./confirm-close-modal.component.scss']
})
export class ConfirmCloseModalComponent implements OnInit, OnDestroy {
  @Output() closeSuccess = new EventEmitter();
  subscriptions: Subscription[] = [];

  constructor(
      public modal: NgbActiveModal,
      public translateService: TranslateService
  ) { }

  ngOnInit(): void {
  }

  delete() {
    this.closeSuccess.emit(true);
    this.modal.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
