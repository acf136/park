import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from 'src/shared/interfaces/interfaces';
import { FirestoreUserService } from 'src/shared/services/firestore-user.service';
import { LoadingService } from 'src/shared/services/Loading.service';
import { PushNotifService } from 'src/shared/services/push-notif.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {

  ionicForm: FormGroup;
  isSubmitted = false;

  constructor(private formBuilder: FormBuilder,
    private firestoreUserService: FirestoreUserService,
    private router: Router,
    private loadingService: LoadingService,
    public authService: AuthenticationService,
    public pushNotifService: PushNotifService
    ) {  }

  ngOnInit() {
    console.log('Registration loaded');

    this.ionicForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(2)]],
      envioDisponibilidad   : [ false ],
      envioInformes   : [ true ]
    });
  }

  getUserFromForm(): IUser {
    const newUser: IUser = {
      name: this.ionicForm.get('name').value,
      surname: this.ionicForm.get('surname').value,
      email: this.ionicForm.get('email').value,
      envioDisponibilidad: this.ionicForm.get('envioDisponibilidad').value,
      envioInformes: this.ionicForm.get('envioInformes').value
    };
    return newUser;
  }

  async signUp(newUser: IUser, password: string): Promise<any> {  //Promise<firebase.auth.UserCredential>
    //Authentication database
    return this.authService.registerUser(newUser.email, password);
  }

  /**
   *  Submit form on registration
   * @returns
   */
  async submitForm(){
    this.loadingService.present();        //init spinner
    this.isSubmitted = true;
    //Form invalid
    if ( !this.ionicForm.valid ) {
      this.loadingService.dismiss();    //stop spinner
      window.alert('Please provide all the required values!');
      return false;
    }
    //Form valid
    // console.log(this.ionicForm.value);
    const newUser: IUser = this.getUserFromForm() ;

    // Step 1 : Register the new Firestore authentication user
    let newUid = '';
    const newPassword =  this.ionicForm.get('password').value;
    await this.signUp(newUser, newPassword).then(
        (resolve) =>  newUid = resolve.user.uid ,                               //onfulfilled
        (reject)  => window.alert('Unable to Register user: '+reject.message)   //onrejected
    );
    if ( newUid === '') { this.loadingService.dismiss();  return false; }
    // Step 2: Firestore database create user if don't exist in User collection of Firestore database
    let userPrevious = false;
    await this.firestoreUserService.getUsersByEmail(newUser.email).then(
      (resolve) => userPrevious = (resolve.length > 0) ,                                   //onfulfilled
      (reject)  => window.alert('Error retrieving user by email : ' +reject)              //onrejected
    );
    if ( userPrevious ) {
      window.alert('User with email '+newUser.email+' already exist');
      this.loadingService.dismiss();
      return false;
    }
    let userSet = false;
    await this.firestoreUserService.setUser(newUser, newUid).then(
      (resolve) => userSet = true ,                                         //onfulfilled
      (reject)  => window.alert('Unable to set user : ' +reject)            //onrejected
    );
    if ( !userSet ) { this.loadingService.dismiss();  return false; }
    // Step 3: sig in with the new user and set the localstorage
    let signInComplete = false;
    await this.authService.signIn(newUser.email, newPassword).then(
      (resolve) => {                                                      //onfulfilled
        localStorage.setItem('user', JSON.stringify(resolve.user));
        signInComplete = true;
        this.router.navigate(['list-map/Map']);
      } ,
      (reject)  =>  window.alert('Unable to signIn : ' +reject)   //onrejected
    );
    if ( signInComplete ) this.pushNotifService.registerNotifEnvDisp();                    // register to push-notifications
    // end of registration transaction
    this.loadingService.dismiss();
    return false;
  }

}   // end of class RegistrationComponent
