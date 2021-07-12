import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser } from 'src/shared/interfaces/interfaces';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreUserService } from 'src/shared/services/firestore-user.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit, OnDestroy {
  @Input() user: IUser;
  id: any;
  backRoute = '';
  public modifyForm: FormGroup;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private firestoreUserService: FirestoreUserService,
    public formBuilder: FormBuilder
  ) {
    // this.id = this.activatedRoute.snapshot.paramMap.get('id');
    // this.activatedRoute.parent.url.subscribe(
    //   (urlSegment) => { this.backRoute = urlSegment[urlSegment.length - 1].path; }
    // ) ;
    // this.getBackRoute();
    this.modifyForm = this.formBuilder.group({
      // idUser : [ '' ],
      name      : [ '' ],
      surname   : [ '' ],
      email       : [ '' ],
      // password      : [ 0 ],
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
      // idUser    : [ pdata.idUser],
      name      : [ pdata.name ],
      surname   : [ pdata.surname ],
      email     : [ pdata.email ],
      // password  : [ pdata.password],
      envioDisponibilidad  : [ pdata.envioDisponibilidad ],
      envioInformes   : [ pdata.envioInformes ]
    });
  }

  // Load info of current user
  ngOnInit( ) {
    // TODO : get the id of the current user
    this.id = 'GzELohIVXZXZaFOvqdB3XBwAUZf2' ;    // TODO: eliminate this hardcode
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
  onSubmitModify() {
    this.extractModifyForm(); // get modifications in this.user
    this.firestoreUserService.update(this.id, this.user);
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    // return mode === 'ios' ? 'Back' : 'Back';
    return 'Back';  //no 'Back' text for the moment
  }

  ngOnDestroy(){
    this.router.navigate(['/tabs/tab2']);
  }
  getBackRoute(){
    // return this.backRoute ;
    return '/tabs/tab1';
  }

}