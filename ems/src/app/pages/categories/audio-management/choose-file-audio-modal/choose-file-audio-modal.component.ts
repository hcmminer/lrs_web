import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ErrorCategoriesService} from '../../../_services/error-categories.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, finalize} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AlarmAudioModel } from 'src/app/pages/_models/error-categories.model';

@Component({
  selector: 'app-choose-file-audio-modal',
  templateUrl: './choose-file-audio-modal.component.html',
  styleUrls: ['./choose-file-audio-modal.component.scss']
})
export class ChooseFileAudioModalComponent implements OnInit, OnDestroy {
  @Input() id: number;
  isLoading = false;
  subscriptions: Subscription[] = [];
  selectedFile: AlarmAudioModel;

  constructor(
      public modal: NgbActiveModal,
      private toastrService: ToastrService,
      public errorCategoriesService: ErrorCategoriesService,
      public translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    const request = this.errorCategoriesService.getListServerAudio().pipe(
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        this.modal.dismiss(err);
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmAudioServer.next(response.data as AlarmAudioModel[]);
      }
    });
    this.subscriptions.push(request);
  }

  changeFile(rowData: any){
    this.selectedFile = rowData;
  }

  choose() {
    this.modal.close(this.selectedFile);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

}
