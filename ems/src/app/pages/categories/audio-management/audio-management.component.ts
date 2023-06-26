import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorCategoriesService} from '../../_services/error-categories.service';
import {AlarmAudioModel} from '../../_models/error-categories.model';
import {UpdateAlarmAudioModalComponent} from './update-alarm-audio-modal/update-alarm-audio-modal.component';
import {ChooseFileAudioModalComponent} from './choose-file-audio-modal/choose-file-audio-modal.component';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  code: null,
  name: null
};

@Component({
  selector: 'app-alarm-audio',
  templateUrl: './audio-management.component.html',
  styleUrls: ['./audio-management.component.scss']
})
export class AudioManagementComponent implements OnInit, OnDestroy {
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
  audioPlay: any;

  constructor(
      private modalService: NgbModal,
      public errorCategoriesService: ErrorCategoriesService
  ) {
  }

  ngOnInit(): void {
    const sb = this.errorCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);
    const request = this.errorCategoriesService.getListAlarmAudio().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmAudio.next(response.data as AlarmAudioModel[]);
      }
      this.errorCategoriesService.listAlarmAudio.value.forEach(item => {
        item.locationSelected = 1;
        item.isEdited = false;
      });
    });
    this.subscriptions.push(request);
    // this.errorCategoriesService.isPlayAudio = false;
  }

  eReset() {
    Object.assign(this.query, this.queryReset);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
    if (typeof (this.audioPlay) !== 'undefined' && this.audioPlay !== null) {
      this.audioPlay.pause();
    }
  }

  loadLastAudio() {
    const request = this.errorCategoriesService.getListAlarmAudio().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmAudio.next(response.data as AlarmAudioModel[]);
      }
      this.errorCategoriesService.listAlarmAudio.value.forEach(item => {
        item.audioCurrent = item.audioLast;
        item.locationSelected = 1;
        item.isEdited = false;
      });
    });
    this.subscriptions.push(request);
  }

  loadDefaultAudio() {
    const request = this.errorCategoriesService.getListAlarmAudio().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmAudio.next(response.data as AlarmAudioModel[]);
      }
      this.errorCategoriesService.listAlarmAudio.value.forEach(item => {
        item.audioCurrent = item.audioDefault;
        item.locationSelected = 1;
        item.isEdited = false;
      });
    });
    this.subscriptions.push(request);
  }

  updateAudio() {
    const modalRef = this.modalService.open(UpdateAlarmAudioModalComponent, {backdrop: 'static', keyboard: false});
    // modalRef.componentInstance.id = id;
    modalRef.result.then(() => {
      this.callApigetListAlarmAudio();
    }, () => {
      this.callApigetListAlarmAudio();
    });
  }

  callApigetListAlarmAudio() {
    const request = this.errorCategoriesService.getListAlarmAudio().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmAudio.next(response.data as AlarmAudioModel[]);
      }
      this.errorCategoriesService.listAlarmAudio.value.forEach(item => {
        item.locationSelected = 1;
        item.isEdited = false;
      });
    });
    this.subscriptions.push(request);
  }

  async chooseFileServer(rowData: AlarmAudioModel) {
    const modalRef = this.modalService.open(ChooseFileAudioModalComponent, {
      size: 'lg',
      centered: true, backdrop: 'static', keyboard: false
    });
    // modalRef.componentInstance.id = id;
    let result = await modalRef.result;
    let listAudio = this.errorCategoriesService.listAlarmAudio.value;
    listAudio.forEach(element => {
      if (element.id == rowData.id) {
        element.fileName = result.fileName;
        element.fileType = result.fileType;
        element.filePath = result.filePath;
        element.isEdited = true;
      }
    });
    this.errorCategoriesService.listAlarmAudio.next(listAudio);
  }

  changeLocationType(rowData: AlarmAudioModel) {
    rowData.fileList = null;
    rowData.file = null;
    rowData.fileURL = null;
    rowData.fileName = null;
    rowData.fileType = null;
    rowData.filePath = null;
    rowData.isEdited = false;
  }

  chooseFileLocal(rowData: AlarmAudioModel, event: any) {
    if (event.target.files && event.target.files.length > 0) {
      var files = event.target.files;
      var fileURL = URL.createObjectURL(files[0]);
      rowData.fileURL = fileURL;
      rowData.fileList = event.target.files;
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {
        rowData.file = reader.result.toString().split(';')[1].substr(7);
      };

      let arr = event.target.files[0].name.split('.');
      rowData.fileName = arr[0];
      rowData.fileType = arr[1];
      rowData.isEdited = true;
    } else {
      event.target.files = rowData.fileList;
    }
  }

  playAudio(rowData: AlarmAudioModel) {
    if (rowData.isEdited) {
      if (rowData.locationSelected == 1) {
        if (rowData.fileName && rowData.fileType) {
          let fileName = rowData.fileName + '.' + rowData.fileType;
          const request = this.errorCategoriesService.getServerAudioContent(fileName).subscribe(response => {
            if (!response.status) {
              throw new Error(response.message);
            } else {
              if (typeof (this.audioPlay) !== 'undefined' && this.audioPlay !== null) {
                this.audioPlay.pause();
              }
              this.audioPlay = new Audio('data:audio/' + rowData.fileType + ';base64,' + response.data);
              this.audioPlay.play();
            }
          });
          this.subscriptions.push(request);
        } else {
          return;
        }
      } else {
        if (rowData.fileURL) {
          if (typeof (this.audioPlay) !== 'undefined' && this.audioPlay !== null) {
            this.audioPlay.pause();
          }
          this.audioPlay = new Audio();
          this.audioPlay.src = rowData.fileURL;
          this.audioPlay.load();
          this.audioPlay.play();
        }
      }
    } else {
      if (rowData.audioCurrent) {
        let regex = /.+?\/(?=[^\/]+$)/g;
        let fileName = rowData.audioCurrent.replace(/\\/gi, '/').split(regex);
        const request = this.errorCategoriesService.getServerAudioContent(fileName[1]).subscribe(response => {
          if (!response.status) {
            throw new Error(response.message);
          } else {
            if (typeof (this.audioPlay) !== 'undefined' && this.audioPlay !== null) {
              this.audioPlay.pause();
            }
            this.audioPlay = new Audio('data:audio/' + fileName[1].split(/\.(?=[^\.]+$)/g)[1] + ';base64,' + response.data);
            this.audioPlay.play();
          }
        });
        this.subscriptions.push(request);
      }
    }
  }


}
