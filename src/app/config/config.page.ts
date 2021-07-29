import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser } from 'src/shared/interfaces/interfaces';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreUserService } from 'src/shared/services/firestore-user.service';
import { NavigationService } from 'src/shared/services/navigation.service';
import { PushNotifService } from 'src/shared/services/push-notif.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit {
  @Input() user: IUser;
  id: any;
  public modifyForm: FormGroup;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private firestoreUserService: FirestoreUserService,
    public formBuilder: FormBuilder,
    private navigation: NavigationService,
    public pushNotifService: PushNotifService
  ) {
      this.modifyForm = this.formBuilder.group({
        name      : [ '' ],
        surname   : [ '' ],
        email       : [ '' ],
        envioDisponibilidad   : [ false ],
        envioInformes   : [ true ]
      });
  }

    /**
  *
  * @param pdata : IUser
  */
  fillModifyForm(pdata: IUser) {
    this.modifyForm = this.formBuilder.group({
      name      : [ pdata.name ],
      surname   : [ pdata.surname ],
      email     : [ pdata.email ],
      envioDisponibilidad  : [ pdata.envioDisponibilidad ],
      envioInformes   : [ pdata.envioInformes ]
    });
  }

  // Load info of current user
  ngOnInit( ) {
    //  get the id of the current user
    this.id = JSON.parse(localStorage.getItem('user')).uid;
    this.loadData();
  }

  /**
   * Get 1st level user attributes from Form
   */
  extractModifyForm(){
    this.user.name = this.modifyForm.value.name ;
    this.user.surname = this.modifyForm.value.surname ;
    this.user.email = this.modifyForm.value.email ;
    this.user.envioDisponibilidad = this.modifyForm.value.envioDisponibilidad ;
    this.user.envioInformes = this.modifyForm.value.envioInformes ;
  }

  // Load current user info
  loadData() {
    this.firestoreUserService.getUser(this.id)
      .subscribe(
        (puser) => {
          this.user = puser as IUser;
          this.fillModifyForm(this.user);
        },
        (err) => { alert('Error caught at subscribe on Firebase url "' + err.url + '" '); },   //2nd subscribe param
        () => {} //Complete
      );
  }

    /**
   *  Modify the data in Firestore
   */
  async onSubmitModify() {
    this.extractModifyForm(); // get modifications in this.user
    await this.firestoreUserService.updateSync(this.id, this.user).then(
      () => console.log('User with id = '+ this.id +' updated') ,            //onfulfilled
      () => console.log('User with id = '+ this.id +' REJECTED to update')   //onrejected
    );
    this.pushNotifService.registerNotifEnvDisp();     // register to push-notifications
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    // return mode === 'ios' ? 'Back' : 'Back';
    return 'Back';  //no 'Back' text for the moment
  }

  // [defaultHref]="getBackRoute()"
  getBackRoute(){
    // use the navigationService to get the last route into backRoute
    const backRoute = this.navigation.history[this.navigation.history.length - 2];
    if ( !backRoute ) {
    //  console.log('getBackRoute /');
      return '/' ; // only one route in history
    }
    else {
      // console.log('getBackRoute '+backRoute);
      return backRoute;
    }
  }

}
