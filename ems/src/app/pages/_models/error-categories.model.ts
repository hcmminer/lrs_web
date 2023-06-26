import {NgbDate} from '@ng-bootstrap/ng-bootstrap';

export class ErrorCategoriesModel {
  id?: number;
  code?: string;
  name?: string;
  status?: string;
  description?: string;
  createdBy?: string;
  createdDate?: NgbDate;
  lasrModifiedBy?: string;
  lasrModifiedDate?: NgbDate;
  checked?: boolean;
}

export class AlarmSeverityModel {
  alarmSeverityId?: number;
  code?: string;
  name?: string;
  status?: string;
  checked?: boolean;
  totalError?: number;
  colorCurrent?: string;
  colorCurrentType?: string;
}

export class AlarmDictionaryModel {
  id?: number;
  objectId?: number;
  objectType?: string;
  alarmCode?: string;
  alarmName?: string;
  alarmSeverityId?: number;
  alarmTypeCode?: string;
  alarmDesc?: string;
  alarmPattern?: string;
  probableCause?: string;
  suggestAction?: string;
  suggestSolotion?: string;
  status?: string;
  // add
  alarmType?: string;
  alarmSeverity?: string;
  object?: string;
}

export class AlarmColorModel {
  id?: number;
  alarmSeverityId?: number;
  colorDefault?: string;
  colorDefaultType?: string;
  colorCurrent?: string;
  colorCurrentType?: string;
  colorLast?: string;
  colorLastType?: string;
  status?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  alarmSeverityName?: string;
  colorCurrentInput?: string;
}

export class AlarmAudioModel {
  id?: number;
  systemId?: number;
  alarmSeverityId?: number;
  audioDefault?: string;
  audioCurrent?: string;
  audioLast?: string;
  threshold?: string;
  status?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  alarmSeverityName?: string;
  locationSelected?: number;
  isPlaying?: boolean;
  fileName?: string;
  fileType?: string;
  filePath?: string;
  file?: any;
  fileList?: any;
  fileURL?: any;
  isEdited?: boolean;
}
