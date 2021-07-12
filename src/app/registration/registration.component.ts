import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from 'src/shared/interfaces/interfaces';
import { LoadingService } from 'src/shared/services/Loading.service';
import { UserService } from 'src/shared/services/user.service';

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
    private userService: UserService,
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
    });
  }

  submitForm(){
    //init spinner
    this.loadingService.present();
    this.isSubmitted = true;
    //Form invalid
    if ( !this.ionicForm.valid ) {
      this.loadingService.dismiss();     //stop spinner
      console.log('Please provide all the required values!');
      return false;
    } else {
      //Form valid
      console.log(this.ionicForm.value)

      const newAuthUser: IUser = {
        name: this.ionicForm.get('name').value,
        surname: this.ionicForm.get('surname').value,
        email: this.ionicForm.get('email').value,
        envioDisponibilidad: true,
        envioInformes: true
      }

      //Register the new user
      this.signUp(newAuthUser, this.ionicForm.get('password').value)    }
  }

  signUp(newAuthUser: IUser, password: string) {
    // build new FirestoreUser
    const newFirestoreUser: IUser = {
      name: this.ionicForm.get('name').value,
      surname: this.ionicForm.get('surname').value,
      email: this.ionicForm.get('email').value,
      envioDisponibilidad : true,
      envioInformes : false
    };
    //Authentication database
    this.authService.RegisterUser(newAuthUser.email, password)      
    .then((res) => {
      //stop spinner
      this.loadingService.dismiss();
      this.router.navigate(['/tabs']);
    }).catch((error) => {
      //stop spinner
      this.loadingService.dismiss();
      window.alert(error.message)
    })
  }
  
}
