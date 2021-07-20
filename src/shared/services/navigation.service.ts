import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class NavigationService {
  public history: string[] = [];

  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe(
      (event) => {
        if ( event instanceof NavigationEnd ) {
          this.history.push(event.urlAfterRedirects) ;
          // for (let i = 0; i < this.history.length ; i++)
          //   console.log('NavigationService : history : '+ this.history[i]);
        }
      }
    );
  }

  back(): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }

} // end of NavigationService
