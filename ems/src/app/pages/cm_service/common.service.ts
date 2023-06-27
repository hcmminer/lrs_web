import { CONFIG } from "src/app/utils/constants";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { ApiService } from "../_http_service/api.service";
import { ToastrService } from "ngx-toastr";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RequestApiModel } from "../_models/request-api.model";
import { environment } from "src/environments/environment";
import { catchError, finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);

  header = {
    // 'Content-Type': 'application/json'
    "Accept-Language": localStorage.getItem(CONFIG.KEY.LOCALIZATION),
    Authorization: "Bearer " + localStorage.getItem(CONFIG.KEY.TOKEN),
  };
  constructor(
    public apiService: ApiService,
    public toastrService: ToastrService,
    public spinner: NgxSpinnerService
  ) {}
  callAPICommon(request): any {
    this.spinner.show();
    const url = `${environment.apiUrl}/redirectFunction`;
    return this.apiService
      .post(url, request, { headers: new HttpHeaders(this.header) })
      .pipe(
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
  // bandv
  callApi(request, redirectFunction: String): Observable<any> {
    Object.assign(request, {
      userName: localStorage.getItem(CONFIG.KEY.USER_NAME),
    });
    if (!request.isNotShowSpinner) this.spinner.show();
    const url = `${environment.apiUrl}/` + redirectFunction;
    switch (request.method?.toUpperCase()) {
      case "GET":
        return this.apiService
          .get(url, request, { headers: new HttpHeaders(this.header) })
          .pipe(
            catchError((err) => {
              this.toastrService.error(err.error?.message || err.message);
              if (!request.isNotShowSpinner) this.spinner.hide();
              return of(undefined);
            }),
            finalize(() => {
              this.isLoading.next(false);
              if (!request.isNotShowSpinner) this.spinner.hide();
            })
          );
      default:
        return this.apiService
          .post(
            url,
            request.formData ? request.formData : request,
            { headers: new HttpHeaders(this.header) },
            request.formData ? request.params : null,
            request.responseType ? request.responseType : null,
            request.observe ? request.observe : null
          )
          .pipe(
            catchError((err) => {
              this.toastrService.error(err.error?.message || err.message);
              if (!request.isNotShowSpinner) this.spinner.hide();
              return of(undefined);
            }),
            finalize(() => {
              this.isLoading.next(false);
              if (!request.isNotShowSpinner) this.spinner.hide();
            })
          );
    }
  }
}
