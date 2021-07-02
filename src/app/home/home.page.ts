import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/shared/services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(private router: Router, public authService: AuthenticationService) {}
  
  ngOnInit(): void {
    console.log("En home ngOnInit: " + this.authService.isLoggedIn);
  }

  public RegisterClicked()
  {
    this.router.navigate(['/registration']);
  }

  public LoginClicked()
  {
    this.router.navigate(['/login']);
  }

}
