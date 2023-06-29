import { CommonService } from "./common.service";
import { EventEmitter, Injectable, OnDestroy } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import { RequestApiModel } from "../_models/request-api.model";
import { NgxSpinnerService } from "ngx-spinner";
import { CONFIG } from "src/app/utils/constants";
import { ApiService } from "../_http_service/api.service";
import { ResponseModel } from "../_model_api/response.model";

@Injectable({
  providedIn: "root",
})
export class ConfigSystemService implements OnDestroy {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  initHeader: {};
  header = {
    "Content-Type": "application/json",
  };

  constructor(
    private apiService: ApiService,
    private toastrService: ToastrService,
    public translateService: TranslateService,
    private commonService: CommonService,
    public spinner: NgxSpinnerService,
  ) {
    const token = localStorage.getItem(CONFIG.KEY.TOKEN);
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    this.initHeader = {
      Authorization: `Bearer ${token}`,
      "Accept-Language": language,
      ...this.header,
    };
  }

  get isLoading$() {
    return this.isLoading.asObservable();
  }

  // store ...
  cbxOptionSet = new BehaviorSubject<any[]>([]);
  cbxOptionSetValue = new BehaviorSubject<any[]>([]);
  // ...store

  getListOptionSet(query: RequestApiModel, allowDefault: boolean): void {
    this.isLoading.next(true);
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != "0") {
            this.cbxOptionSet.next([]);
            throw new Error(response.message);
          }
          if (typeof response.data !== "undefined" && response.data !== null) {
            this.cbxOptionSet.next(response.data as any);
          } else {
            this.cbxOptionSet.next([]);
          }
          if (allowDefault)
            this.cbxOptionSet.value.unshift({
              optionSetId: null,
              optionSetCode: this.translateService.instant("LIST_STATUS.ALL"),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, "Error");
          return of(undefined);
        }),
        finalize(() => {})
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListOptionSetValue(query: RequestApiModel, allowDefault: boolean): void {
    this.isLoading.next(true);
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != "0") {
            this.cbxOptionSetValue.next([]);
            throw new Error(response.message);
          }
          if (typeof response.data !== "undefined" && response.data !== null) {
            this.cbxOptionSetValue.next(response.data as any);
          } else {
            this.cbxOptionSetValue.next([]);
          }
          if (allowDefault)
            this.cbxOptionSetValue.value.unshift({
              optionSetValueId: null,
              value: this.translateService.instant("LIST_STATUS.ALL"),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, "Error");
          return of(undefined);
        }),
        finalize(() => {})
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
