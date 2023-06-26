/* ts-lint:disabled */
import {AfterViewInit, Component, ElementRef, Injectable, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Station} from '../../_models/station.model';
import {RequestApiModel} from '../../_models/request-api.model';
import {StationManagementService} from '../../_services/station-management.service';
import {ConstructionDetailDTO} from '../../_models/construct-detail-dto.model';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {NgxSpinnerService} from 'ngx-spinner';
import * as moment from 'moment';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TreeChecklistComponent} from '../../tree/tree-checklist/tree-checklist.component';
import {SelectionModel} from '@angular/cdk/collections';
import {TreeConstructItemlDTO, TreeConstructItemlDTOFlat} from '../../tree/model/tree-construct-item-dto.model';
import {TreeConstructDetailDTO, TreeConstructDetailDTOFlat} from '../../tree/model/tree-construct-detail-dto.model';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';


@Injectable()
export class StationDetailService {
  treeDataAdd = [];
}

@Injectable()
export class StationDetailTableDatabase {
  dataChangeT = new BehaviorSubject<TreeConstructDetailDTO[]>([]);

  get data(): TreeConstructDetailDTO[] {
    return this.dataChangeT.value;
  }

  constructor() {
    // this.initialize();
  }
  treeDataT: any[];
  initialize( treeDataT: any) {
    this.treeDataT = treeDataT;
    // const data = this.buildFileTree(this.treeData, 0);

    // Notify the change.
    this.dataChangeT.next( this.treeDataT);
  }
}

@Component({
  selector: 'app-station-detail',
  templateUrl: './station-detail.component.html',
  styleUrls: ['./station-detail.component.scss'],
  providers: [StationDetailService, StationDetailTableDatabase]
})
export class StationDetailComponent implements OnInit {
  station = new BehaviorSubject<Partial<Station>>({});
  listStations = new BehaviorSubject<any>([]);
  listTasksGot = new BehaviorSubject([]);
  listTasksUsed = new BehaviorSubject([]);
  listConstructMenuDTO = new BehaviorSubject<ConstructionDetailDTO[]>([]);
  searchForm: FormGroup;
  private modal: any;
  @ViewChild('tasks') tasks: ElementRef;
  @ViewChild('assignPopup') assignPopup: ElementRef;
  color: 'primary';
  isChecked: boolean = false;
  isDisplay: boolean = false;
  stationID: any;
  taskSelected = [];

  // Tree
  flatNodeMapT = new Map<TreeConstructDetailDTOFlat, TreeConstructDetailDTO>();
  nestedNodeMapT = new Map<TreeConstructDetailDTO, TreeConstructDetailDTOFlat>();
  treeControlT: FlatTreeControl<TreeConstructDetailDTOFlat>;

  treeFlattenerT: MatTreeFlattener<TreeConstructDetailDTO, TreeConstructDetailDTOFlat>;

  dataSourceT: MatTreeFlatDataSource<TreeConstructDetailDTO, TreeConstructDetailDTOFlat>;

  constructor(
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public stationManagementService: StationManagementService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private stationDetailService: StationDetailService,
    private stationDetailTableDatabase: StationDetailTableDatabase
  ) {
    // Tree
    this.treeFlattenerT = new MatTreeFlattener(
        this.transformer,
        this.getLevel,
        this.isExpandable,
        this.getChildren
    );
    this.treeControlT = new FlatTreeControl<TreeConstructDetailDTOFlat>(
        this.getLevel,
        this.isExpandable
    );
    this.dataSourceT = new MatTreeFlatDataSource(
        this.treeControlT,
        this.treeFlattenerT
    );
    sessionStorage.removeItem('station_detail_tree');
    stationDetailTableDatabase.dataChangeT.subscribe((dataT) => {
      this.dataSourceT.data = dataT;
    });
  }

  getLevel = (node: TreeConstructDetailDTOFlat) => node.level;

  isExpandable = (node: TreeConstructDetailDTOFlat) => node.expandable;

  getChildren = (node: TreeConstructDetailDTO): TreeConstructDetailDTO[] => node.listItemDetailDTO;

  hasChild = (_: number, _nodeData: TreeConstructDetailDTOFlat) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TreeConstructDetailDTOFlat) =>  _nodeData.name === '';

  transformer = (node: TreeConstructDetailDTO, level: number) => {
    const existingNode = this.nestedNodeMapT.get(node);
    const flatNode =
        existingNode && existingNode.constructionDetailId === node.constructionDetailId
            ? existingNode
            : new TreeConstructDetailDTOFlat();
    flatNode.constructionDetailId = node.constructionDetailId;
    flatNode.constructionId = node.constructionId;
    flatNode.constructionItemId = node.constructionItemId;
    flatNode.startDate = node.startDate;
    flatNode.startDateStr = node.startDateStr;
    flatNode.createdBy = node.createdBy;
    flatNode.status = node.status;
    flatNode.name = node.name;
    flatNode.statusName = node.statusName;
    flatNode.acceptanceDate = node.acceptanceDate;
    flatNode.acceptanceDateStr = node.acceptanceDateStr;
    flatNode.acceptanceBy = node.acceptanceBy;
    flatNode.firstApprovedDate = node.firstApprovedDate;
    flatNode.firstApprovedDateStr = node.firstApprovedDateStr;
    flatNode.firstApprovedBy = node.firstApprovedBy;
    flatNode.firstRejectDateStr = node.firstRejectDateStr;
    flatNode.firstRejectBy = node.firstRejectBy;
    flatNode.firstRejectReason = node.firstRejectReason;
    flatNode.secondApprovedDate = node.secondApprovedDate;
    flatNode.secondApprovedDateStr = node.secondApprovedDateStr;
    flatNode.secondApprovedBy = node.secondApprovedBy;
    flatNode.secondRejectDate = node.secondRejectDate;
    flatNode.secondRejectBy = node.secondRejectBy;
    flatNode.secondRejectReason = node.secondRejectReason;
    flatNode.thirdApprovedDate = node.thirdApprovedDate;
    flatNode.thirdApprovedDateStr = node.thirdApprovedDateStr;
    flatNode.thirdApprovedBy = node.thirdApprovedBy;
    flatNode.thirdRejectDate = node.thirdRejectDate;
    flatNode.thirdRejectBy = node.thirdRejectBy;
    flatNode.thirdRejectReason = node.thirdRejectReason;
    flatNode.listImageDTO = node.listImageDTO;
    flatNode.listItemDetailDTO = node.listItemDetailDTO;
    flatNode.completeDate = node.completeDate;
    flatNode.completeDateStr = node.completeDateStr;
    flatNode.level = level;
    flatNode.expandable = !!node.listItemDetailDTO;
    flatNode.rejectDateStr = node.rejectDateStr;
    flatNode.rejectBy = node.rejectBy;
    flatNode.rejectReason = node.rejectReason;
    this.flatNodeMapT.set(flatNode, node);
    this.nestedNodeMapT.set(node, flatNode);
    return flatNode;
  };
  ngOnInit(): void {
    this.stationID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getConstructionDetail(this.stationID).subscribe(res => {
      if(res.errorCode == '0'){
        this.station.next({
          province: ( res.data.provinceCode && res.data.provinceName ) ? (res.data.provinceCode + '-' + res.data.provinceName ) : '',
          constructionCode: res.data.constructionCode ? res.data.constructionCode : '',
          constructionName: res.data.constructionName ? res.data.constructionName : '',
          constructionTypeName: res.data.constructionTypeName ? res.data.constructionTypeName : '',
          stationTypeName: res.data.stationTypeName ? res.data.stationTypeName : '',
          columnTypeName: res.data.columnTypeName ? res.data.columnTypeName : '',
          positionTypeName: res.data.positionTypeName ? res.data.positionTypeName : '',
          pillarHeight: res.data.columnHeight ? res.data.columnHeight : '',
          Long: res.data.constructionLong ? res.data.constructionLong : '',
          Lat: res.data.constructionLat ? res.data.constructionLat : '',
          Ban: res.data.districtName ? res.data.districtName : '',
          village: res.data.village ? res.data.village : '',
          network: res.data.network ? res.data.network : '',
          vendor: res.data.vendor ? res.data.vendor : '',
          band: res.data.band ? res.data.band : '',
          antennaHeight: res.data.antenHeight ? res.data.antenHeight : '',
          azimuth: res.data.azimuth ? res.data.azimuth : '',
          tilt: res.data.tilt ? res.data.tilt : '',
          sector: res.data.sector ? res.data.sector : '',
          trx4g: res.data.trxMode ? res.data.trxMode : '',
          startPoint: res.data.startPoint ? res.data.startPoint : '',
          endPoint: res.data.endPoint ? res.data.endPoint : '',
          cableLine: res.data.cableRoute ? res.data.cableRoute : '',
          cableDistance: res.data.distanceCable ? res.data.distanceCable : '',
          concretePillarQuantity: res.data.columnNumber ? res.data.columnNumber : '',
          decisionApplied: res.data.decisionDeploy ? res.data.decisionDeploy : '',
          note: res.data.note ? res.data.note : '',
          statusName: res.data.statusName ? res.data.statusName : '',
          startDate: res.data.startDate ? res.data.startDate : '',
          listItemMenu: res.data.listConstructionItemName ? res.data.listConstructionItemName : [],
          completeDateStr: res.data.completeDateStr ? res.completeDateStr : '',
          startDateStr: res.data.startDateStr ? res.startDateStr : '',

        });
        if(res.data.status == "1"){
          this.isDisplay = true;
        } else this.isDisplay = false;
        this.listConstructMenuDTO.next(res.data.listConstructionDetailDTO);
        this.stationDetailTableDatabase.initialize(this.listConstructMenuDTO.value);
      }
    });
  }

  openModal(_content) {
    this.modal = this.modalService.open(_content, {
      centered: true,
      size: 'xl'
    });
  }

  clickAccept(){
      this.assignConstruction(this.stationID).subscribe(res => {
        if (res.errorCode == '0'){
          this.stationManagementService.toastrService.success(res.description);
          this.router.navigate(['station-management/list-station']);
        }
        else {
          this.stationManagementService.toastrService.error(res.description);

        }
      });
  }

  addTasks(){
    this.getListConstructionItem(this.stationID).subscribe(res => {
      this.listTasksGot.next(res.data);
      this.openModal(this.tasks);
    });
  }
  assignJob(){
    this.openModal(this.assignPopup);
  }

  getConstructionDetail(_id){
    const requestTarget = {
      functionName: 'getConstructionDetail',
      constructionDTO: {
        constructionId: _id
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  getListConstructionItem(_id){
    const requestTarget = {
      functionName: 'getListConstructionItem',
      constructionDTO: {
        constructionId: _id
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  assignConstruction(_id){
    const requestTarget = {
      functionName: 'assignConstruction',
      constructionDTO: {
        constructionId: _id
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  // toggle(item, event: MatCheckboxChange) {
  //   if (event.checked) {
  //     this.listTasksGot.value.forEach(task =>
  //     {
  //       if(task.constructionItemId == item.constructionItemId){
  //         task.chosen = 1;
  //       }
  //     });
  //   } else {
  //     this.listTasksGot.value.forEach(task =>
  //     {
  //       if(task.constructionItemId == item.constructionItemId){
  //         task.chosen = 0;
  //       }
  //     });
  //   }
  // }

  // updateAllComplete() {
  //   this.isChecked = this.listTasksGot.value.every(t => t.chosen == 1);
  // }

  // toggleAll(event: MatCheckboxChange) {
  //   if ( event.checked ) {
  //     this.taskSelected = this.listTasksGot.value;
  //     this.isChecked = true;
  //     this.listTasksGot.value.forEach(row => {
  //       row.chosen = 1;
  //     });
  //   }else {
  //     this.isChecked = false;
  //     this.listTasksGot.value.forEach(row => {
  //       row.chosen = 0;
  //     });
  //   }
  // }

  convertToTreeData(data: any): TreeConstructItemlDTO[]{
    data.forEach(parentOld => {
      const indexP = data.indexOf(parentOld);
      data[indexP] = {
        constructionItemId : parentOld.constructionItemId,
        constructionItemName : parentOld.constructionItemName,
        step : parentOld.step,
        status : parentOld.status,
        chosen : parentOld.chosen,
        lastModifiedBy : parentOld.lastModifiedBy,
        type : parentOld.type,
        lstConstructionItem2 : parentOld.lstConstructionItem2
      };
      if (parentOld.lstConstructionItem2 && parentOld.lstConstructionItem2.length > 0) {
        parentOld.lstConstructionItem2.forEach(childOld => {
          const indexC =  parentOld.lstConstructionItem2.indexOf(childOld);
          data[indexP].lstConstructionItem2[indexC] = {
            constructionItemId : childOld.constructionItemId,
            constructionItemName : childOld.constructionItemName,
            step : childOld.step,
            status : childOld.status,
            chosen : childOld.chosen,
            lastModifiedBy : childOld.lastModifiedBy,
            type : childOld.type
          };
        });
      }
    });
    return data;
  }
  addConstructionItem(){
    const requestTarget = {
      functionName: 'addConstructionItem',
      constructionDTO: {
        constructionId: this.stationID,
        listConstructionItemDTO: this.convertToTreeData( this.stationDetailService.treeDataAdd)
      }
    };
    return this.stationManagementService.callAPICommon(requestTarget as RequestApiModel);
  }

  addItem(){
    this.addConstructionItem().subscribe(res => {
      if (res.errorCode == '0') {
        this.stationManagementService.toastrService.success(res.description);
        this.getConstructionDetail(this.stationID).subscribe(response => {
          if (response.errorCode == '0'){
            this.listConstructMenuDTO.next(response.data.listConstructionDetailDTO);
            this.stationDetailTableDatabase.initialize(this.listConstructMenuDTO.value);
            this.expandNode();
          } else {
            this.stationManagementService.toastrService.error(res.description);
          }
        });
        this.modal.close();
      } else {
        this.stationManagementService.toastrService.error(res.description);
      }
    });
  }
  // Tree view ngày nghiệm thu hoàn thành
  showThirdApproveDateStrChild(item: any): string {
    // 1. Nếu là con = thirdApprovedDateStr(chỉ view)
    if (item.level > 0){
      return item.thirdApprovedDateStr ? item.thirdApprovedDateStr : '';
    } else {  // 2. Nếu là cha không có con
      // 2.1. Nếu Ngày hoàn thành !null thì lấy ngày hoàn thành
      if (item.completeDateStr){
        return item.completeDateStr;
      }
      // 2.2.  Nếu Ngày hoàn thành =null và thirdApprovedDateStr !=null thì lấy thirdApprovedDateStr
      else if (item.thirdApprovedDateStr) {
        return item.thirdApprovedDateStr;
      }
      // 2.3.  Nếu Ngày hoàn thành =null và thirdApprovedDateStr ==null = ''
      else {
        return '';
      }
    }
  }
  // Lấy ngày nghiệm thu hoàn thành lớn nhất trong list giai đoạn
  viewThirdApproveDateStr(listItemDetailDTO: any): string {
    let thirdApprovedDateTemp;
    let thirdApprovedDateTempStr = '';
    listItemDetailDTO.forEach(item => {
      const thirdApprovedDateStr = item.thirdApprovedDateStr;
      const thirdApprovedDate = item.thirdApprovedDate ? new Date(item.thirdApprovedDate) : null;
      if (listItemDetailDTO.indexOf(item) === 0 || thirdApprovedDateTemp < thirdApprovedDate) {
        thirdApprovedDateTemp = thirdApprovedDate;
        thirdApprovedDateTempStr = thirdApprovedDateStr;
      }
    });
    return thirdApprovedDateTempStr;
  }
  saveCacheExpandNode(){
    sessionStorage.setItem('station_detail_tree', JSON.stringify(this.treeControlT.dataNodes));
  }
  getNodeExpand(): TreeConstructDetailDTOFlat[]{
    let expands = [];
    const dataTreeInStorage = JSON.parse(sessionStorage.getItem('station_detail_tree'));
    if (dataTreeInStorage && dataTreeInStorage.length > 0){
      dataTreeInStorage.forEach(node => {
        if (node.isExpanded){
          expands.push(node);
        }
      });
    }
    return expands;
  }
  expandNode(){
    const expands = this.getNodeExpand();
    const dataTree = this.treeControlT.dataNodes;
    if (expands && expands.length > 0 && dataTree && dataTree.length > 0) {
      expands.forEach(expanNode => {
        const expanNodeId = expanNode.constructionDetailId;
        this.treeControlT.dataNodes.forEach(node => {
          if (node.constructionDetailId === expanNodeId){
            const index = this.treeControlT.dataNodes.indexOf(node);
            this.treeControlT.dataNodes[index].isExpanded = true;
            this.treeControlT.expand(node);
          }
        });
      });
    }
  }
  ngOnDestroy(){

  }

}
