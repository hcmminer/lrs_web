import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {WEBSOCKET_ENDPOINT, WEBSOCKET_NOTIFY_TOPIC} from '../../utils/constants';
import {DashboardOnlineService} from './dashboard-online.service';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject} from 'rxjs';
import {PaginatorState} from '../../_metronic/shared/crud-table';

// import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  stompClient: any;
  ws: any;

  // check run time
  checkRunTime = new BehaviorSubject<boolean>(false);
  checkConnect = false;

  constructor(
      public dashboardOnlineService: DashboardOnlineService,
      private toastrService: ToastrService,
      public translateService: TranslateService,
  ) {
  }

  connect(): void {
    console.log('webSocket Connection');
    this.ws = new SockJS(WEBSOCKET_ENDPOINT, null, {timeout: 15000});
    this.stompClient = Stomp.over(this.ws);
    const _this = this;
    _this.stompClient.connect({}, async function(frame) {
      _this.checkRunTime.next(true);
      _this.checkConnect = true;
      _this.toastrService.success(_this.translateService.instant('NOTI.PERFORM_ALARM'), 'Success');
      _this.stompClient.subscribe(WEBSOCKET_NOTIFY_TOPIC, function(sdkEvent) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  }


  disconnect(): void {
    this.ws.onclose = function() {
      console.log('close');
      const _this = this;
      if (typeof (_this.stompClient) !== 'undefined' && _this.stompClient !== null) {
        _this.stompClient.disconnect();
        _this.stompClient = null;
        _this.checkRunTime.next(false);
        _this.checkConnect = false;
        _this.toastrService.success(_this.translateService.instant('NOTI.PAUSE_ALARM'), 'Success');
      }
      console.log('Disconnected');
    };
  }


  // disconnect(): void {
  //   if (typeof (this.stompClient) !== 'undefined' && this.stompClient !== null) {
  //     this.stompClient.disconnect();
  //     this.stompClient = null;
  //     this.checkRunTime.next(false);
  //     this.checkConnect = false;
  //     this.toastrService.success(this.translateService.instant('NOTI.PAUSE_ALARM'), 'Success');
  //   }
  //   console.log('Disconnected');
  // }

  // on error, schedule a reconnection attempt
  errorCallBack(error) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this.connect();
    }, 5000);
  }

  onMessageReceived(message) {
    console.log('Message Recieved from Server :: ' + message);
    const newAlarm = JSON.parse(message.body);
    const newMess = {
      actionCode: newAlarm.unifiedAlarmInfo.action_code,
      actionName: newAlarm.unifiedAlarmInfo.action_name,
      actionType: newAlarm.unifiedAlarmInfo.action_type,
      alarmCode: newAlarm.unifiedAlarmInfo.alarm_code,
      alarmDetail: newAlarm.unifiedAlarmInfo.Alarm_detail,
      alarmId: newAlarm.unifiedAlarmInfo.alarm_id,
      alarmName: newAlarm.unifiedAlarmInfo.Alarm_name,
      alarmSeverityId: +newAlarm.unifiedAlarmInfo.alarm_severity_id,
      alarmType: newAlarm.unifiedAlarmCategory.alarm_type,
      clearStatus: newAlarm.unifiedAlarmClear.clear_status,
      destinationService: newAlarm.unifiedAlarmLocation.destination_service,
      faultId: newAlarm.unifiedAlarmFilter.fault_id,
      functionName: newAlarm.unifiedAlarmLocation.function_name,
      serviceCode: newAlarm.unifiedAlarmLocation.service_code,
      systemCode: newAlarm.unifiedAlarmLocation.system_code
    };
    if (newAlarm.unifiedAlarmTime.event_time != null && newAlarm.unifiedAlarmTime.event_time !== '') {
      const dateFormat = newAlarm.unifiedAlarmTime.event_time.split(/(\s+)/);
      const format = dateFormat[0].split('/').reverse().join('-') + 'T' + dateFormat[2];
      Object.assign(newMess, {eventTime: format});
    }
    if (newAlarm.unifiedAlarmTime.ems_time != null && newAlarm.unifiedAlarmTime.ems_time !== '') {
      const dateFormat = newAlarm.unifiedAlarmTime.ems_time.split(/(\s+)/);
      const format = dateFormat[0].split('/').reverse().join('-') + 'T' + dateFormat[2];
      Object.assign(newMess, {emsTime: format});
    }
    if (newAlarm.unifiedAlarmTime.clear_time != null && newAlarm.unifiedAlarmTime.clear_time !== '') {
      const dateFormat = newAlarm.unifiedAlarmTime.clear_time.split(/(\s+)/);
      const format = dateFormat[0].split('/').reverse().join('-') + 'T' + dateFormat[2];
      Object.assign(newMess, {clearTime: format});
    }
    if (newAlarm.unifiedAlarmTime.receive_time != null && newAlarm.unifiedAlarmTime.receive_time !== '') {
      const dateFormat = newAlarm.unifiedAlarmTime.receive_time.split(/(\s+)/);
      const format = dateFormat[0].split('/').reverse().join('-') + 'T' + dateFormat[2];
      Object.assign(newMess, {receiveTime: format});
    }
    if (newAlarm.unifiedAlarmCategory.alarm_type != null && newAlarm.unifiedAlarmCategory.alarm_type !== '') {
      const indexType = this.dashboardOnlineService.cbxAlarmType.value.findIndex(
          type => type.code === newAlarm.unifiedAlarmCategory.alarm_type);
      if (indexType > -1) {
        Object.assign(newMess, {typeName: this.dashboardOnlineService.cbxAlarmType.value[indexType].name});
      }
    }
    if (newAlarm.unifiedAlarmInfo.action_code != null && newAlarm.unifiedAlarmInfo.action_code !== '') {
      const indexAction = this.dashboardOnlineService.cbxAction.value.findIndex(
          action => action.actionCode === newAlarm.unifiedAlarmInfo.action_code);
      if (indexAction > -1) {
        const indexCat = this.dashboardOnlineService.cbxCategory.value.findIndex(
            cate => cate.categoryId === this.dashboardOnlineService.cbxAction.value[indexAction].categoryId);
        if (indexCat > -1) {
          Object.assign(newMess, {actionCategory: this.dashboardOnlineService.cbxCategory.value[indexCat].categoryName});
        }
      }
    }
    if (newAlarm.unifiedAlarmLocation.service_code != null && newAlarm.unifiedAlarmLocation.service_code !== '') {
      const indexService = this.dashboardOnlineService.cbxService.value.findIndex(
          service => service.serviceCode === newAlarm.unifiedAlarmLocation.service_code
      );
      if (indexService > -1) {
        Object.assign(newMess, {serviceName: this.dashboardOnlineService.cbxService.value[indexService].serviceName});
      }
    }
    if (newAlarm.unifiedAlarmLocation.system_code != null && newAlarm.unifiedAlarmLocation.system_code !== '') {
      const indexSys = this.dashboardOnlineService.cbxSystem.value.findIndex(
          system => system.systemCode === newAlarm.unifiedAlarmLocation.system_code
      );
      if (indexSys > -1) {
        Object.assign(newMess, {systemName: this.dashboardOnlineService.cbxSystem.value[indexSys].systemName});
      }
    }
    if (newAlarm.unifiedAlarmInfo.alarm_severity_id != null && newAlarm.unifiedAlarmInfo.alarm_severity_id !== '') {
      const indexSeverity = this.dashboardOnlineService.cbxAlarmSeverity.value.findIndex(
          severity => severity.alarmSeverityId.toString() === newAlarm.unifiedAlarmInfo.alarm_severity_id
      );
      if (indexSeverity > -1) {
        Object.assign(newMess, {alarmSeverity: this.dashboardOnlineService.cbxAlarmSeverity.value[indexSeverity].name});
      }
    }
    const indexSer = this.dashboardOnlineService.listAlarmColor.value.findIndex(
        value1 => value1.alarmSeverityId.toString() === newAlarm.unifiedAlarmInfo.alarm_severity_id);
    if (indexSer > -1) {
      Object.assign(newMess, {
        colorCurrentType: this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrentType,
        colorCurrent: this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrent
      });
    }
    this.dashboardOnlineService.cbxAlarmSeverity.value.forEach((item) => {
      if (item.alarmSeverityId.toString() === newAlarm.unifiedAlarmInfo.alarm_severity_id) {
        item.totalError++;
      }
    });
    this.dashboardOnlineService.listDashboardDetail.value.unshift(newMess);
    // this.setColorInRow();
    this.dashboardOnlineService.listDashboardDetail.next(this.dashboardOnlineService.listDashboardDetail.value);
    console.log(this.dashboardOnlineService.listDashboardDetail);
    this.dashboardOnlineService.paginatorState.next({
      total: this.dashboardOnlineService.listDashboardDetail.value.length,
      page: this.dashboardOnlineService.paginatorState.value.page,
      pageSize: this.dashboardOnlineService.paginatorState.value.pageSize
    } as PaginatorState);
    // Emits the event.
    // this.notificationService.notificationMessage.emit(JSON.parse(message.body));

    // play audio
    this.playAudio();
  }

  playAudio() {
    if (this.dashboardOnlineService.isPlayAudio) {
      if (this.dashboardOnlineService.listDashboardDetail.value[0] &&
          this.dashboardOnlineService.listDashboardDetail.value[0].alarmSeverityId) {
        const serId = this.dashboardOnlineService.listDashboardDetail.value[0].alarmSeverityId;
        const audioIndex = this.dashboardOnlineService.listAlarmAudioServer.value.findIndex(audio => audio.alarmSeverityId === serId);
        if (audioIndex > -1) {
          const linkFile = this.dashboardOnlineService.listAlarmAudioServer.value[audioIndex].audioCurrent;
          if (linkFile != null) {
            const regex = /.+?\/(?=[^\/]+$)/g;
            const fileName = linkFile.replace(/\\/gi, '/').split(regex);
            const fileTypeArray = linkFile.split('.');
            if (fileTypeArray !== null){
              const len = fileTypeArray.length;
              const fileType = fileTypeArray[len - 1];
              if (linkFile) {
                this.dashboardOnlineService.getServerAudioContent(fileName[1]).subscribe(response => {
                  if (!response.status) {
                    throw new Error(response.message);
                  } else {
                    if (typeof (this.dashboardOnlineService.audioPlay) !== 'undefined' && this.dashboardOnlineService.audioPlay !== null) {
                      this.dashboardOnlineService.audioPlay.pause();
                    }
                    this.dashboardOnlineService.audioPlay = new Audio('data:audio/' + fileType + ';base64,' + response.data);
                    this.dashboardOnlineService.audioPlay.play();
                  }
                });
              }
            }
          }
        }
      }
    }
  }
}
