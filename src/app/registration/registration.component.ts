import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { IUser } from 'src/shared/interfaces/interfaces';
import { UserService } from 'src/shared/services/user.service';


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
    private router: Router) { 
  }

  ngOnInit() {
    console.log("Registration loaded");

    this.ionicForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(2)]],
    })
  }

  submitForm(){
    this.isSubmitted = true;
    if (!this.ionicForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      console.log(this.ionicForm.value)

      const newUser: IUser = {
        //id: this.ionicForm..length + 1, //AÑADIMOS AUTOMÁTICAMENTE EL ID AL NUEVO USUARIO
        name: this.ionicForm.get('name').value,
        surname: this.ionicForm.get('surname').value,
        email: this.ionicForm.get('email').value,
        password: this.ionicForm.get('password').value
      }

      this.userService.setUser(newUser).subscribe((user: IUser) => {
        const newus = user;
        this.router.navigate(['/home']);
      });
    }
  }

}
