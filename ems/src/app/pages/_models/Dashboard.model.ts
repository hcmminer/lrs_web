export class DashboardDetailModel {
  alarmId?: number;
  alarmCode?: string;
  alarmName?: string;
  faultId?: number;
  systemCode?: string;
  serviceCode?: string;
  actionType?: string;
  actionCode?: string;
  actionName?: string;
  alarmDetail?: string;
  functionName?: string;
  DestinationService?: string;
  alarmSeverityId?: number;
  clearStatus?: string;
  alarmType?: string;
  eventTime?: string;
  receiveTime?: string;
  emsTime?: string;
  clearTime?: string;

  // add
  systemName?: string;
  serviceName?: string;
  alarmSeverity?: string;
  actionCategory?: string;

  // detail
  ipPort?: string;
  rootAlarmId?: number;
  extendInfo?: string;
  typeName?: string;
  listTypeCode?: string;

  // color
  colorCurrentType?: string;
  colorCurrent?: string;
}
