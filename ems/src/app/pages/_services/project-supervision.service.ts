import {Injectable} from '@angular/core';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {Station} from '../_models/station.model';
import {HTTPService} from './http.service';
import {ToastrService} from 'ngx-toastr';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { ProjectSupervision } from '../_models/project-supervision.model';
import { RequestApiModel } from '../_models/request-api.model';
import { environment } from 'src/environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})

export class ProjectSupervisionService{
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  listStation = new BehaviorSubject<ProjectSupervision[]>([]);
  listProvince = new BehaviorSubject([]);
  listConstructionStatus = new BehaviorSubject([]);
  listStationType = new BehaviorSubject([]);
  listPillarType = new BehaviorSubject([]);
  conId = new BehaviorSubject(null);
  conDetailID = new BehaviorSubject(null);
  imageID = new BehaviorSubject(null);
  valueRefuseImage = new BehaviorSubject(null);
  inputRefuseImage = new BehaviorSubject(null);
  startDate = new BehaviorSubject('');
  // listReasonRefuseImage = new BehaviorSubject([]);
  header = {
    'Content-Type': 'application/json'
  };
  constructor(
    public httpService: HTTPService,
    public toastrService: ToastrService,
    public http: HttpClient,
    public spinner: NgxSpinnerService
  )
  {
  }
  callAPICommon(request: RequestApiModel): any {
    this.spinner.show();
    const url = `${environment.apiUrl}/redirectFunction`;
    return this.httpService.post(url, request, {headers: new HttpHeaders(this.header)}).pipe(
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message);
        this.spinner.hide();
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading.next(false);
        this.spinner.hide();
      })
    );
  }
}
