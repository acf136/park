import { Injectable } from '@angular/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushNotifService {

  constructor() { }

  async register(): Promise<void> {
    let permission = false;
    // iOS will prompt user and return if they granted permission or not || // Android will just grant without prompting
    await PushNotifications.requestPermissions().then(
      (result) => {
        if (result.receive === 'granted') permission = true;
        else  console.log('PushNotifications.requestPermissions : result.receive = '+result.receive);
      },
      (err) => console.log('PushNotifService : error = ', err)
    );
    if ( permission ) return PushNotifications.register();  //Promise<void>
  }

  // Registration with a token received from FCM
  registration() {
    PushNotifications.addListener('registration',
       (token: Token) => {
         window.alert('Push registration success, token: ' + token.value);
         console.log(token.value);
         // The token should be in INotifDisponibilidad.registrationToken set on registration process
       }
     );
  }

  // Registration error handler
  registrationError() {
    PushNotifications.addListener('registrationError',
        (error: any) => {
          window.alert('Error on registration: ' + JSON.stringify(error));
        }
     );
  }

  // pushNotificationReceived handler to show the notification payload if the app is open on our device
  pushNotificationReceived() {
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        window.alert('Push received: ' + JSON.stringify(notification));
      }
    );
  }

  // Method called when tapping on a notification on status bar and the app is not in foreground
  pushNotificationActionPerformed(){
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        window.alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  removeAllDeliveredNotifications(){
    return PushNotifications.removeAllDeliveredNotifications();
  }

  removeAllListeners(){
    return PushNotifications.removeAllListeners();
  }
} // end of PushNotifService
