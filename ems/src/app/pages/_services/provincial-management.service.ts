import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/modules/auth';
import { BehaviorSubject, of } from 'rxjs';
import { RequestApiModel } from '../_models/request-api.model';
import { environment } from 'src/environments/environment';
import { catchError, finalize } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ProvincialManagementService {
  isLoading = new BehaviorSubject<boolean>(false);
  public listProvice = new BehaviorSubject<any[]>([]);


  header = {
    'Content-Type': 'application/json'
  };
  constructor(
    public httpService: HTTPService,
    public toastrService: ToastrService,
    public http: HttpClient,
    public spinner: NgxSpinnerService,
    public authService: AuthService
  ) {
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
