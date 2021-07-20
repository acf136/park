import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from 'src/shared/interfaces/interfaces';
import { FirestoreUserService } from 'src/shared/services/firestore-user.service';
import { LoadingService } from 'src/shared/services/Loading.service';

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
    public authService: AuthenticationService) {
  }

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
   *
   * @returns
   */
  async submitForm(){
    this.loadingService.present();        //init spinner
    this.isSubmitted = true;
    //Form invalid
    if ( !this.ionicForm.valid ) {
      this.loadingService.dismiss();    //stop spinner
      console.log('Please provide all the required values!');
      return false;
    }
    //Form valid
    console.log(this.ionicForm.value);
    const newUser: IUser = this.getUserFromForm() ;

    // Step 1 : Register the new Firestore authentication user
    let newUid = '';
    let newPassword =  this.ionicForm.get('password').value;
    await this.signUp(newUser, newPassword).then(
        (resolve) =>  newUid = resolve.user.uid ,                //onfulfilled
        (reject)  => window.alert(reject.message)                //onrejected
    );
    // Step 2: Firestore database create user if don't exist
    let userPrevious = false;
    if ( newUid !== '')
      await this.firestoreUserService.getUserSync(newUid).then(
        (resolve) => userPrevious = true ,                                              //onfulfilled
        (reject)  => console.log('Reject on firestoreUserService.getUser :  ' +reject)  //onrejected
      );
    let userSet = false;
    if ( !userPrevious )
      await this.firestoreUserService.setUser(newUser, newUid).then(
        (resolve) => userSet = true ,                                                   //onfulfilled
        (reject)  => console.log('Reject on firestoreUserService.setUser :  ' +reject)  //onrejected
      );
    // Step 3: sig in with the new user and set the localstorage
    if ( userSet )
      await this.authService.signIn(newUser.email, newPassword).then(
        (resolve) => {                                                      //onfulfilled
          localStorage.setItem('user', JSON.stringify(resolve.user));
          this.router.navigate(['list-map/Map']);
        } ,
        (reject)  => console.log('Reject authService.signIn :  ' +reject)   //onrejected
      );
    // end of registration transaction
    this.loadingService.dismiss();    //stop spinner
  }

}   // end of class RegistrationComponent
