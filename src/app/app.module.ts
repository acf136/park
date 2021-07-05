import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// simulating Http client through In-memory Web API
// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService } from '../shared/services/in-memory-data.service';
// simulating Http client through In-memory Web API

import { UserService } from 'src/shared/services/user.service';
import { LoadingService } from 'src/shared/services/Loading.service';

//  Firebase modules
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

// Environment
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests and returns simulated server responses.
    // Remove it when a real server is ready to receive requests, or use
    // ( environment.production ? HttpClientInMemoryWebApiModule.forRoot(DataService) : [] )
    // in environment files
    // HttpClientInMemoryWebApiModule.forRoot( InMemoryDataService, { dataEncapsulation: false, delay : 500 } ),
    // end of HttpClientInMemoryWebApiModule
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule
    ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    UserService,
    LoadingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
