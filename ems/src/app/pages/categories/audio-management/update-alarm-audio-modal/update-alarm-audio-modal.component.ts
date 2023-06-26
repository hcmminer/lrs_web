import { AlarmAudioModel } from './../../../_models/error-categories.model';
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ErrorCategoriesService} from '../../../_services/error-categories.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, finalize} from 'rxjs/operators';
import {ResponseModel} from '../../../_models/response.model';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'app-update-alarm-audio-modal',
  templateUrl: './update-alarm-audio-modal.component.html',
  styleUrls: ['./update-alarm-audio-modal.component.scss']
})
export class UpdateAlarmAudioModalComponent implements OnInit, OnDestroy {
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
    var listFileServer: AlarmAudioModel[] = [];
    var listFileLocal: AlarmAudioModel[] = [];
    this.errorCategoriesService.listAlarmAudio.value.forEach(item => {
      if(item.locationSelected == 2){
        if(item.file){
          listFileLocal.push(item);
        }else{
          listFileServer.push(item);
        }
      }else{
        listFileServer.push(item);
      }
    });
    this.updateServerFile(listFileServer, listFileLocal);
  }

  updateServerFile(listFileServer: AlarmAudioModel[], listFileLocal: AlarmAudioModel[]){
    this.isLoading = true;

    const sb = this.errorCategoriesService.updateAlarmAudioServer(listFileServer).pipe(
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        this.modal.dismiss(err);
        return of(undefined);
      })
    ).subscribe((res: ResponseModel) => {
      if (res.status) {
        this.updateLocalFile(listFileLocal);
      } else if (res.message) {
        this.toastrService.error(res.message, 'Error');
      }
    });
    this.subscriptions.push(sb);
  }

  updateLocalFile(listFileLocal: AlarmAudioModel[]){
    const sb = this.errorCategoriesService.updateAlarmAudioLocal(listFileLocal).pipe(
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
        this.toastrService.success(this.translate.instant('CATEGORY.AUDIO_MANAGEMENT.UPDATE.SUCCESS'), 'Success');
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
