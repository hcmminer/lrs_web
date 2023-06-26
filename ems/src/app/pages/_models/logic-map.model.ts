export class LogicMapModel {
  listLogicMaps?: ListLogicMap[];
}

export class ListLogicMap {
  logicMapDTOS?: LogicMapDTO[];
  serviceGoc?: LogicMapDTO;
  serviceMapping?: LogicMapDTO[];
}

export class LogicMapDTO {
  mapId?: number;
  serviceId?: number;
  secondServiceId?: number;
  orderNo?: number;
  status?: string;

  // add
  serviceCode?: string;
  serviceName?: string;
  secondServiceCode?: string;
  secondServiceName?: string;
  ipPort?: string;
  capBac?: number;
  classBorder?: string;
  src?: string;

  // service loi
  alarmNorClearByServiceDTO?: AlarmNorClearByServiceDTO;

  nodeMapDTOS?: NodeMapDTO[];
}

export class NodeMapDTO {
  serviceId?: number;
  serviceCode?: string;
  serviceName?: string;
  ipPort?: string;
  status?: string;
  classBorder?: string;
  src?: string;

  // service loi
  alarmNorClearByServiceDTO?: AlarmNorClearByServiceDTO;
}

export class AlarmNorClearByServiceDTO {
  AlarmSeverityId?: number;
  colorType?: string;
  color?: string;
  shadow?: string;
}
