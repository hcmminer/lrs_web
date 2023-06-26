import {AfterViewInit, Component, ElementRef, Injectable, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbCarousel, NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { RaceSubscriber } from 'rxjs/internal/observable/race';
import { ProjectSupervision } from 'src/app/pages/_models/project-supervision.model';
import { RequestApiModel } from 'src/app/pages/_models/request-api.model';
import { Station } from 'src/app/pages/_models/station.model';
import { ProjectSupervisionService } from 'src/app/pages/_services/project-supervision.service';
import {ConstructionDetailDTO} from '../../../_models/construct-detail-dto.model';
// @ts-ignore
import * as moment from 'moment';
import {NgxSpinnerService} from 'ngx-spinner';
import {getDateInputWithFormat} from '../../../../utils/functions';
import {TreeConstructDetailDTO, TreeConstructDetailDTOFlat} from '../../../tree/model/tree-construct-detail-dto.model';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ActionConstructDetailModel} from '../../../_models/action-construct-detail.model';
import {CONFIG} from '../../../../utils/constants';


@Injectable()
export class ProjectDetailDBTablePGD {
  dataChange = new BehaviorSubject<TreeConstructDetailDTO[]>([]);

  get data(): TreeConstructDetailDTO[] {
    return this.dataChange.value;
  }

  constructor() {
    // this.initialize();
  }

  treeData: any[];

  initialize(treeData: any) {
    this.treeData = treeData;
    // const data = this.buildFileTree(this.treeData, 0);

    // Notify the change.
    this.dataChange.next(this.treeData);
  }
}

const queryInit = {
  startDate: '',
  iValidConstructionDetailDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
};
@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  providers: [ProjectDetailDBTablePGD]
})
export class ProjectDetailComponent implements OnInit, AfterViewInit {
  refuseForm: FormGroup;
  dateInputForm: FormGroup;
  isLoading$: boolean = false;
  startDateErrorMsg: string = '';
  query = {
    ...queryInit
  };
  dateSending: string  = '';
  station = new BehaviorSubject<Partial<ProjectSupervision>>({});
  listConstructMenuDTO = new BehaviorSubject<ConstructionDetailDTO[]>([]);
  imageSrc = new BehaviorSubject([]);
  imageApproveSrc = new BehaviorSubject([]);
  imageRefuseSrc = new BehaviorSubject([]);
  firstIndex = 0 ;
  lastIndex: number;
  paginator = {page: 1, pageSize: 10, total: 0};
  modalReference: any;
  imageId: number;

  records = [
    {id: 1, value: 10},
    {id: 2, value: 15},
    {id: 3, value: 20},
    {id: 4, value: 30},
    {id: 5, value: 50},
  ];

  name: string;
  refuseImageForm: FormGroup;
  valueRefuseImage = new BehaviorSubject(null);
  inputRefuseImage = new BehaviorSubject(null);
  errorValueRefuseImage = new BehaviorSubject<number>(0);
  actionImage = new BehaviorSubject(null);
  listReasonRefuseImage = new BehaviorSubject([]);
  CONSTANT_HTTP = 'https://10.120.137.100:8888';


  itemConstructionDetail: ConstructionDetailDTO;
  @ViewChild('refusal') refusal: ElementRef;
  @ViewChild('initPopup') initPopup: ElementRef;
  @ViewChild('approve') approve: ElementRef;
  @ViewChild('viewImg', {static: true}) viewImg: ElementRef;
  @ViewChild('steplist') steplist: ElementRef ;
  @ViewChild('importConstructionDate') importConstructionDate: ElementRef;
  @ViewChild('viewActionHis') viewActionHis: ElementRef;
  @ViewChild('reasonRefuseImage') reasonRefuseImage: ElementRef;
  @ViewChild('initPopupImage') initPopupImage: ElementRef;
  @ViewChild('carousel', { static: true }) carousel: NgbCarousel;
  @ViewChild('Image', { static: true }) Image: ElementRef;
  stationID: any;
  private modal: any;

  // Tree
  flatNodeMap = new Map<TreeConstructDetailDTOFlat, TreeConstructDetailDTO>();
  nestedNodeMap = new Map<TreeConstructDetailDTO, TreeConstructDetailDTOFlat>();
  treeControl: FlatTreeControl<TreeConstructDetailDTOFlat>;

  treeFlattener: MatTreeFlattener<TreeConstructDetailDTO, TreeConstructDetailDTOFlat>;

  dataSource: MatTreeFlatDataSource<TreeConstructDetailDTO, TreeConstructDetailDTOFlat>;
  // View history
  lstAction = new BehaviorSubject<ActionConstructDetailModel[]>([]);
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public fb: FormBuilder,
    public translate: TranslateService,
    public modalService: NgbModal,
    public projectSupervisionService: ProjectSupervisionService,
    private spinner: NgxSpinnerService,
    private database: ProjectDetailDBTablePGD,
    private translateService: TranslateService
    )
  {
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    translateService.setDefaultLang(language);
    this.loadForm();
    // Tree
    this.treeFlattener = new MatTreeFlattener(
        this.transformer,
        this.getLevel,
        this.isExpandable,
        this.getChildren
    );
    this.treeControl = new FlatTreeControl<TreeConstructDetailDTOFlat>(
        this.getLevel,
        this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener
    );
    sessionStorage.removeItem('project_detail_tree_vice');
    database.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }
  getLevel = (node: TreeConstructDetailDTOFlat) => node.level;

  isExpandable = (node: TreeConstructDetailDTOFlat) => node.expandable;

  getChildren = (node: TreeConstructDetailDTO): TreeConstructDetailDTO[] => node.listItemDetailDTO;

  hasChild = (_: number, _nodeData: TreeConstructDetailDTOFlat) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TreeConstructDetailDTOFlat) =>  _nodeData.name === '';

  transformer = (node: TreeConstructDetailDTO, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
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
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  ngOnInit() {
    this.stationID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getConstructionDetail(this.stationID).subscribe(res => {
      // tslint:disable-next-line:triple-equals
      if (res.errorCode == '0'){
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
          listConstructionItemName: res.data.listConstructionItemName ? res.data.listConstructionItemName : [],
          completeDateStr: res.data.completeDateStr ? res.data.completeDateStr : '',
          startDateStr: res.data.startDateStr ? res.data.startDateStr : '',

        });
        this.listConstructMenuDTO.next(res.data.listConstructionDetailDTO);
        this.database.initialize(this.listConstructMenuDTO.value);
      }
    });
  }
  shouldRender(node: TreeConstructDetailDTOFlat) {
    const parent = this.getParentNode(node);
    return !parent || parent.expandable;
  }

  getParentNode(node: TreeConstructDetailDTOFlat): TreeConstructDetailDTOFlat | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
  loadForm(){
    this.refuseForm = this.fb.group({
      inputRefuse: ['', Validators.required],
    });
    this.dateInputForm = this.fb.group({
      iValidConstructionDetailDate: [this.query.startDate]
    });
    this.refuseImageForm = this.fb.group({
      valueRefuseImage: ['', Validators.required],
      inputRefuseImage: ['', Validators.required],
    });
  }

  showReasonRefusalAcceptance(id) {
    this.projectSupervisionService.conDetailID.next(id);
    this.refuseForm.reset();
    this.openModal(this.refusal);
  }
  checkApproveParent(item) {
    if (item && item.listItemDetailDTO && item.listItemDetailDTO.length > 0){
      if (item.listItemDetailDTO.some(child => child.status !== 5)) {
        return false;
      }
    }
    return true;
  }
  showApproveItem(item){
    if (!this.checkApproveParent(item)){
      this.projectSupervisionService.toastrService.error(this.translateService.instant(`POPUP.APPROVE.CHILD_APPROVE_REQUIRED`));
    }
    else if (this.showIconGreen(item)){
      this.projectSupervisionService.conDetailID.next(item.constructionDetailId);
      this.openModal(this.approve);
    } else {
      this.projectSupervisionService.toastrService.error(this.translateService.instant(`IMAGE.ERROR.LEAST_APPROVE_IMAGE`));
    }
  }

  openModal(content) {
    this.modal = this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  ngAfterViewInit(): void {
    // this.eSearch();
  }

  viewImage(id){
    this.getImageList(id).subscribe(res => {
      if (res.errorCode === '0'){
          this.imageSrc.next(res.data.listImageActive);
          this.imageApproveSrc.next(res.data.listImageApproved);
          this.imageRefuseSrc.next(res.data.listImageReject);
          this.modalService.open(this.Image, {
            size: 'xl',
            centered: true,
            backdrop: 'static'
          });
        } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }
    });
  }
  openConstructionDate(id) {
    this.projectSupervisionService.conDetailID.next(id);
    this.modalService.open(this.importConstructionDate, {
      size: '600px',
      centered: true,
    });
  }

  getConstructionDetail(_id) {
    const requestTarget = {
      functionName: 'getConstructionDetail',
      constructionDTO: {
        constructionId: _id
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  // tslint:disable-next-line:variable-name
  getImageList(id) {
    const requestTarget = {
      functionName: 'getImageList',
      constructionDetailDTO: {
        constructionDetailId: id
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }
  updateConstructionItemStartDate(_date) {
    const requestTarget = {
      functionName: 'updateConstructionItemStartDate ',
      constructionDetailDTO: {
        constructionDetailId: this.projectSupervisionService.conDetailID.value,
        constructionId: this.stationID,
        startDateStr: _date
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  OnDateChange(event) {
    this.projectSupervisionService.startDate.next(moment.utc(event, 'DD-MM-YYYY').local().format('DD/MM/YYYY'));
  }

  saveContructionDate() {
    if (!this.isValidDateForm()) {
      return;
    }
    this.dateSending = getDateInputWithFormat(this.query.iValidConstructionDetailDate);
    this.updateConstructionItemStartDate(this.dateSending).subscribe(res => {
      if (res.errorCode === '0') {
        this.projectSupervisionService.toastrService.success(res.description);
        this.modalService.dismissAll();
        this.getConstructionDetail(this.stationID).subscribe(response => {
          if (response.errorCode == '0'){
            this.listConstructMenuDTO.next(response.data.listConstructionDetailDTO);
            this.database.initialize(this.listConstructMenuDTO.value);
            this.expandNode();
          } else {
            this.projectSupervisionService.toastrService.error(response.description);
          }
        });
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }

    });
  }

  approveItem() {
    this.approveConstructionItem().subscribe(res => {
      if (res.errorCode == '0') {
        // this.refusal.nativeElement.style.display='none';
        this.projectSupervisionService.toastrService.success(res.description);
        this.getConstructionDetail(this.stationID).subscribe(response => {
          if (response.errorCode == '0'){
            this.listConstructMenuDTO.next(response.data.listConstructionDetailDTO);
            this.database.initialize(this.listConstructMenuDTO.value);
            this.expandNode();
          } else {
            this.projectSupervisionService.toastrService.error(response.description);
          }
        });
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }
    });
  }

  approveConstructionItem() {
    const requestTarget = {
      functionName: 'approveConstructionItem',
      constructionDetailDTO: {
        constructionDetailId: this.projectSupervisionService.conDetailID.value,
        approveType: 1
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  clickAcceptRefusal(){
    if (!this.isValidForm()) {
      this.refuseForm.markAllAsTouched();
      return;
    }
    this.openModal(this.initPopup);
  }

  clickAcceptApproved(){
    this.openModal(this.approve);
  }

  rejectItem() {
    this.rejectConstructionItem().subscribe(res => {
      if (res.errorCode == '0') {
        this.projectSupervisionService.toastrService.success(res.description);
        this.modalService.dismissAll();
        this.getConstructionDetail(this.stationID).subscribe(response => {
          if (response.errorCode == '0'){
            this.listConstructMenuDTO.next(response.data.listConstructionDetailDTO);
            this.database.initialize(this.listConstructMenuDTO.value);
            this.expandNode();
          } else {
            this.projectSupervisionService.toastrService.error(response.description);
          }
        });
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }
    });
  }

  rejectConstructionItem() {
    const requestTarget = {
      functionName: 'approveConstructionItem',
      constructionDetailDTO: {
        constructionDetailId: this.projectSupervisionService.conDetailID.value,
        approveType: 2,
        rejectReason: this.refuseForm.get('inputRefuse').value,
      }
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.refuseForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.refuseForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  isValidDate(dateString): boolean {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split('/');
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    // tslint:disable-next-line:triple-equals
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
      return false;
    }

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    // tslint:disable-next-line:triple-equals
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  }

  isControlInvalid(controlName: string): boolean {
    switch (controlName) {
      case 'iValidConstructionDetailDate':
        return this.startDateErrorMsg && this.startDateErrorMsg.length > 0;
    }
  }

  resetError(controlName: string) {
    switch (controlName) {
      case 'iValidConstructionDetailDate':
        this.startDateErrorMsg = '';
        break;
    }
  }

  isValidDateForm(): boolean {
    this.startDateErrorMsg = '';
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let isValidAllDate = true;

    // required
    // if(this.query.iValidConstructionDetailDate == null){
    //   this.startDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED',
    //     {name: this.translate.instant('REPORTS.REPORT_ERROR_OCCURRED_RESOLVED.TABLE_TITLE.FROM_DATE')});
    //   isValidAllDate = false;
    // }

    // validate format and value
    let iValidStartDateStr;
    if (typeof (this.query.iValidConstructionDetailDate) == 'string') {
      iValidStartDateStr = this.query.iValidConstructionDetailDate;
      if (/^[0-9]{8}$/.test(iValidStartDateStr)) {
        this.query.iValidConstructionDetailDate = new NgbDate(parseInt(iValidStartDateStr.substr(4, 4)),
          parseInt(iValidStartDateStr.substr(2, 2)),
          parseInt(iValidStartDateStr.substr(0, 2)));
      }
    }
    if (typeof this.query.iValidConstructionDetailDate == 'object') {
      iValidStartDateStr = this.query.iValidConstructionDetailDate.day + '/' + this.query.iValidConstructionDetailDate.month + '/' + this.query.iValidConstructionDetailDate.year;
    }

    if (!this.isValidDate(iValidStartDateStr)) {
      this.startDateErrorMsg = this.translate.instant('VALIDATION.INCORRECT' , {
        name: this.translate.instant('LIST_CATEGORY_WORK.CON_DATE')
      });
      isValidAllDate = false;
    } else {
      if (new Date(this.query.iValidConstructionDetailDate['year'], this.query.iValidConstructionDetailDate['month'] - 1, this.query.iValidConstructionDetailDate['day']) < currentDate) {
        this.startDateErrorMsg = this.translate.instant('VALIDATION.BEFORE_CURRENT_DATE',
          {name: this.translate.instant('LIST_CATEGORY_WORK.CON_DATE')});
        isValidAllDate = false;
      }
    }

    return isValidAllDate;
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
          // 2.3.  Nếu Ngày hoàn thành =null và thirdApprovedDateStr ==null thì click lấy ngày hiện tại (check html)
      // 2.4.  Nếu Ngày hoàn thành =null và thirdApprovedDateStr ==null và không có quyền -> trả về ''
      else {
        return '';
      }
    }
  }
  showButtonApproveDate(item: any): boolean {
    if (item.level === 0 && item.status === 7 && !item.completeDateStr && this.checkRole()) {
      return true;
    }
    return false;
  }

  updateThirdApprovedDateStr(constructionDetailId: number) {
    // console.log(constructionDetailId);
    const constructionDetailIdUpdate = new BehaviorSubject(constructionDetailId);
    const requestTarget = {
      functionName: 'approvedFinishConstructionItem',
      constructionDetailDTO: {
        constructionDetailId: constructionDetailIdUpdate.value
      }
    };
    this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      if (res.errorCode == '0') {
        this.projectSupervisionService.toastrService.success(res.description);
        this.modalService.dismissAll();
        this.getConstructionDetail(this.stationID).subscribe(response => {
          if (response.errorCode == '0'){
            this.listConstructMenuDTO.next(response.data.listConstructionDetailDTO);
            this.database.initialize(this.listConstructMenuDTO.value);
            this.expandNode();
          } else {
            this.projectSupervisionService.toastrService.error(response.description);
          }
        });
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }
    });
  }

  // Check role
  checkRole() {
    const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
    if (userPermission === CONFIG.USER_ROLE.CMS_CORP_STAFF ) {
      return true;
    }
    return false;
  }

  // View history action
  viewHistoryAction(constructionDetailId: any) {
    const conDetailID = new BehaviorSubject(null);
    conDetailID.next(constructionDetailId);
    const requestTarget = {
      functionName: 'getConstructionItemHistory',
      constructionDetailDTO: {
        constructionDetailId: conDetailID.value,
      }
    };
    this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      if (res.errorCode === '0') {
        this.lstAction.next(res.data);
        this.modalService.open(this.viewActionHis);
      }
    });
  }
  //View img
  showIconGreen(item: any): boolean {
    let isShow = false;
    if(item && item.listImageDTO && item.listImageDTO.length > 0 ){
      item.listImageDTO.forEach(img => {
        if(img.status === 4) {
          isShow = true;
        }
      });
    }

    return isShow;
  }

  showIconBlue(item: any): boolean {
    let isShow = false;
    if(item && item.listImageDTO && item.listImageDTO.length > 0 ){
      item.listImageDTO.forEach(img => {
        if(img.status === 1) {
          isShow = true;
        }
      });
    }
    return isShow;
  }

  showIconRed(item: any): boolean {
    let isShow = false;
    if(item && item.listImageDTO && item.listImageDTO.length > 0 ){
      item.listImageDTO.forEach(img => {
        if(img.status === 3) {
          isShow = true;
        }
      });
    }
    return isShow;
  }

  onChangeValueRefuseImage() {
    this.valueRefuseImage.next(this.refuseImageForm.get('valueRefuseImage').value);
    this.errorValueRefuseImage.next(0);
  }

  showInitPopupApproveImage(imageId) {
    this.projectSupervisionService.imageID.next(imageId);
    this.actionImage.next('APPROVE');
    this.openModal(this.initPopupImage);
  }

  clickAcceptApproveImage(){
    this.approveImage().subscribe(res => {
      if (res.errorCode == '0') {
        this.projectSupervisionService.toastrService.success(res.description);
        this.getImageList(this.itemConstructionDetail.constructionDetailId)
        .subscribe(resp => {
          if (resp.errorCode == '0'){
            this.imageSrc.next(resp.data.listImageActive);
            this.imageApproveSrc.next(resp.data.listImageApproved);
            this.imageRefuseSrc.next(resp.data.listImageReject);
          }
        });
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }
    });
  }

  approveImage(){
    const requestTarget = {
      functionName: 'approvedImage',
      imageId: this.projectSupervisionService.imageID.value,
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  showReasonRefuseImage(id) {
    this.projectSupervisionService.imageID.next(id)
    this.getListRejectReasonImage(id).subscribe(res => {
      if (res.errorCode === '0') {
        if (res.data.length != 0) {
          this.listReasonRefuseImage.next(res.data);
        }
        else {
          this.projectSupervisionService.toastrService.error('Danh sách ly do trống');
        }
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }
    });
   this.modalReference = this.modalService.open(this.reasonRefuseImage, {
            centered: true,
            backdrop: 'static'
   });
    
  }

  getListRejectReasonImage(_id) {
    const requestTarget = {
      functionName: 'getListRejectReasonImage',
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  clickAcceptRefuseImage() {
    const value = parseInt(this.refuseImageForm.get('valueRefuseImage').value);
    if (!Number.isInteger(value)) {
      this.errorValueRefuseImage.next(1);
      return;
    }

    this.projectSupervisionService.valueRefuseImage.next(value);
    const input = this.refuseImageForm.get('inputRefuseImage').value;
    if (value === 4 && input === '') {
      this.errorValueRefuseImage.next(2);
      return;
    }

    this.projectSupervisionService.inputRefuseImage.next(input);
    this.actionImage.next('REFUSE');
    this.openModal(this.initPopupImage);
  }

  rejectItemImage() {
    this.rejectImage().subscribe(res => {
      if (res.errorCode == '0') {
        this.projectSupervisionService.toastrService.success(res.description);
        this.modalReference.close();
        this.getImageList(this.itemConstructionDetail.constructionDetailId)
        .subscribe(resp => {
          if (resp.errorCode == '0'){
            this.imageSrc.next(resp.data.listImageActive);
            this.imageApproveSrc.next(resp.data.listImageApproved);
            this.imageRefuseSrc.next(resp.data.listImageReject);
          }
        });
      } else {
        this.projectSupervisionService.toastrService.error(res.description);
      }
    });
  }
  rejectImage() {
    const requestTarget = {
      functionName: 'rejectImage',
      imageId: this.projectSupervisionService.imageID.value,
      rejectReason: this.projectSupervisionService.valueRefuseImage.value,
      description: this.projectSupervisionService.inputRefuseImage.value,
    };
    return this.projectSupervisionService.callAPICommon(requestTarget as RequestApiModel);
  }

  HandleGetListImage(item){
    this.name = item.name;
    this.viewImage(item.constructionDetailId);
    this.itemConstructionDetail = item;
  }

  closeModal(){
    this.stationID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getConstructionDetail(this.stationID).subscribe(res => {
      // tslint:disable-next-line:triple-equals
      if (res.errorCode == '0'){
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
          listConstructionItemName: res.data.listConstructionItemName ? res.data.listConstructionItemName : [],
          completeDateStr: res.data.completeDateStr ? res.data.completeDateStr : '',
          startDateStr: res.data.startDateStr ? res.data.startDateStr : '',

        });
        this.listConstructMenuDTO.next(res.data.listConstructionDetailDTO);
        this.database.initialize(this.listConstructMenuDTO.value);
      }
    });
  }

  saveCacheExpandNode(){
    sessionStorage.setItem('project_detail_tree_vice', JSON.stringify(this.treeControl.dataNodes));
  }
  getNodeExpand(): TreeConstructDetailDTOFlat[]{
    let expands = [];
    const dataTreeInStorage = JSON.parse(sessionStorage.getItem('project_detail_tree_vice'));
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
    const dataTree = this.treeControl.dataNodes;
    if (expands && expands.length > 0 && dataTree && dataTree.length > 0) {
      expands.forEach(expanNode => {
        const expanNodeId = expanNode.constructionDetailId;
        this.treeControl.dataNodes.forEach(node => {
          if (node.constructionDetailId === expanNodeId){
            const index = this.treeControl.dataNodes.indexOf(node);
            this.treeControl.dataNodes[index].isExpanded = true;
            this.treeControl.expand(node);
          }
        });
      });
    }
  }
}




