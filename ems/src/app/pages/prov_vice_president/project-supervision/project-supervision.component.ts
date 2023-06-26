import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';

@Component({
  selector: 'app-project-supervision',
  templateUrl: './project-supervision.component.html',
  styleUrls: ['./project-supervision.component.scss']
})
export class ProjectSupervisionComponent implements OnInit {
    constructor() {
    }

    ngOnInit(): void {
    }
}
