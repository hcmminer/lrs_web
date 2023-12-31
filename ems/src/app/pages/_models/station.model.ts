import {Validators} from '@angular/forms';

export class Station {
  province: string;
  constructionId: number;
  constructionCode: string;
  constructionName: string;
  constructionTypeName: string ;
  // stationTypeId: string ;
  stationTypeName: string;
  columnTypeName: string;
  positionTypeName: string;
  // columnType: string ;
  pillarHeight?: string ;
  Long?: string ;
  Lat?: string ;
  Ban?: string ;
  village?: string ;
  network?: string ;
  vendor?: string ;
  band?: string ;
  antennaHeight?: string ;
  azimuth?: string ;
  tilt?: string ;
  sector?: string ;
  trx4g?: string ;
  startPoint?: string ;
  endPoint?: string ;
  cableLine?: string ;
  cableDistance?: string ;
  concretePillarQuantity?: string ;
  decisionApplied?: string ;
  note?: string;
  status?: string;
  statusName?: string;
  startDate?: string;
  startDateStr?: string;
  categories?: string;
  listItemMenu?: string[];
  completeDateStr?: string;
}
