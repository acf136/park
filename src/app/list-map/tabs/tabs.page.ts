import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthenticationService } from 'src/shared/services/authentication.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit{
  constructor(private menu: MenuController,
    public authService: AuthenticationService) { }

  ngOnInit(): void {
  }

  ionViewWillEnter(){
  }

  ionViewDidEnter(){
  }

  ionViewWillLeave(){
  }

  ionViewDidLeave(){
  }

}
