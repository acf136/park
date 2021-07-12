import { Component } from '@angular/core';
import { AuthenticationService } from 'src/shared/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'List', url: '/list-map/List', icon: 'list' },
    { title: 'Map', url: '/list-map/Map', icon: 'map' },
    { title: 'Config', url: '/config', icon: 'settings' }
  ];
  public labels = ['List-park', 'Map-park' ];
  constructor(public authService: AuthenticationService) {}
}
