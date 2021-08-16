import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { PushNotifService } from 'src/shared/services/push-notif.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(
    private router: Router,
    public authService: AuthenticationService,
    public pushNotifService: PushNotifService,
    public translate: TranslateService
    ) {
      this.translate.use('es');
    }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.pushNotifService.registerNotifEnvDisp();     // register to push-notifications
      console.log('home.page.ts: isLoggedIn registerNotifEnvDisp: after!' );
      this.router.navigate(['/tabs']);
    }
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
