import { Component, Input, OnInit } from '@angular/core';
import { IParking } from 'src/shared/interfaces/interfaces'; //TODO: implement service

@Component({
  selector: 'app-list-park',
  templateUrl: './list-park.component.html',
  styleUrls: ['./list-park.component.scss'],
})
export class ListParkComponent implements OnInit {
  @Input() parking: IParking;

  constructor() { }

  ngOnInit() {}

  isIos() {
    const win = window as any;
    return win && win.Ionic && win.Ionic.mode === 'ios';
  }
}
