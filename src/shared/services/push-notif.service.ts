import { Injectable } from '@angular/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { INotifDisponibilidad, INotifDisponibilidadWithId, IParksWithId, IUser } from '../interfaces/interfaces';
import { FirestoreNotifDisponibilidadService } from './firestore-notif-disponibilidad.service';
import { FirestoreParksService } from './firestore-parks.service';
import { FirestoreUserService } from './firestore-user.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotifService {
  myUserLogin: IUser ;

  initialDate = new Date(1900,1,1);
  lastParkingPlaceOfUser: IParksWithId;  //última plaza ocupada/liberada
  idLastParkingPlaceOfUser = '';

  constructor(
    public firestoreUserService: FirestoreUserService,
    public firestoreParksService: FirestoreParksService,
    public firestoreNotifDisponibilidadService: FirestoreNotifDisponibilidadService
  ) { }

  // unregister to push-notifications
  unregisterPushNotif() {
    // Remove all the notifications from the notifications screen
    this.removeAllDeliveredNotifications();   // without then process
    // Remove all listeners
    this.removeAllListeners(); // without then process
  }

  // register to push-notifications
  async registerPushNotif(): Promise<boolean> {
    // begin: register push-notif
    let registered = false;
    console.log('this.myUserLogin.envioDisponibilidad: user.envioDisponibilidad is true');
    await this.register().then(   // Register with Apple / Google to receive push via APNS/FCM
        (result) => { if ( result !== false ) registered = true; } ,
        (err) => console.log('PushNotifService.register : error = ', err)
      );
    if ( registered )  {
      this.registration();
      this.registrationError();
      this.pushNotificationReceived();
      this.pushNotificationActionPerformed();
    }
    return new Promise( (resolve) => resolve(registered) ) ;
  } // end : register push-notif

  // register to notifications by envioDisponibilidad
  async registerNotifEnvDisp() {
    const idUser = JSON.parse(localStorage.getItem('user')).uid;
    await this.firestoreUserService.getUserSync(idUser).then(
      (puser)   => this.myUserLogin = puser as IUser,
      (reject)  => {
        console.log('registerNotifEnvDisp: reject = '+reject);
        return;
      }
    );
    if ( this.myUserLogin.envioDisponibilidad ) {
      let registered = false;
      await this.registerPushNotif().then( (result) => registered = result );
      if ( !registered ) {  // to have a token for push-notifications
        window.alert('Unble to register to push-notifications');
        return ;
      }
      // Buscar aparcamiento del historial (IParks) donde está el usuario aparcado
      //     o el ultimo aparcamiento donde se ha aparcado
      await this.firestoreParksService.getPlazaDeUsuario(idUser).then(
        (plaza) => {  this.idLastParkingPlaceOfUser = plaza.id ; this.lastParkingPlaceOfUser = plaza.aparcamiento;  }
      );
      // Buscar la NotifDisponibilidad previa para este user
      let myNotifs: INotifDisponibilidadWithId[] = [] ; const myValue = idUser;
      await this.firestoreNotifDisponibilidadService.getCollectionNotifElemsSync('NotifDisponibilidad','idUser','==',myValue).then(
        (resultSet) =>  {
          if ( resultSet?.length > 0 )  myNotifs = resultSet;
        } ,
        (err) => console.log(err)
      );
      console.log('registerNotifEnvDisp: myNotifs.length =  '+myNotifs.length);
      // Si no existe crearla
      const newNotif: INotifDisponibilidad  = {
        idUser: JSON.parse(localStorage.getItem('user')).uid,
        registrationToken: JSON.parse(localStorage.getItem('tokenPushNotifications')),
        idParking: '', // Ultima plaza que ocupó el usuario
        coordX: '',  //
        coordY: '',
        datePark: null,
        dateLeave: null,
        notifSendToDevice: true
      } ;
      // si NO Ha aparcado nunca O user está aparcado entonces
      if ( this.lastParkingPlaceOfUser.idUser === ''  ||
        this.lastParkingPlaceOfUser.dateLeave < this.lastParkingPlaceOfUser.datePark ) {
        //  poner NotifDisponibilidad vacio <= dejar a inicial

      } else {  // sino (Ha aparcado una vez y NO está aparcado)
        //  poner NotifDisponibilidad con plaza
        if ( myNotifs.length > 0 ) { // actualizar la plaza con la que ya existía
          newNotif.idParking = myNotifs[0].idParking ;
          newNotif.coordY = myNotifs[0].coordX ;
          newNotif.coordY = myNotifs[0].coordY ;
          newNotif.notifSendToDevice = false;   // para que el node server envíe la notif
        } else {
          // La plaza la actualizará scanQR al dejar la plaza este usuario
        }
      } // fsi
      // Actualizar
      if ( myNotifs.length > 0 )   this.firestoreNotifDisponibilidadService.update(myNotifs[0].id, newNotif) ;
      // Crear
      else this.firestoreNotifDisponibilidadService.create(newNotif) ;


    } else this.unregisterPushNotif();    //this.myUserLogin.envioDisponibilidad = false

  }

  async register(): Promise<any> {
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
    else return new Promise( resolve => resolve(false) );
  }

  // Registration with a token received from FCM
  registration() {
    PushNotifications.addListener('registration',
       (token: Token) => {
        localStorage.setItem('tokenPushNotifications', JSON.stringify(token.value));
        window.alert('Push registration success, token: ' + token.value);
         console.log(token.value);
         // The token should be in INotifDisponibilidad.registrationToken set on registration process
       }
     );
     // Buscar una NotifDisponibilidad anterior de este user (puede existir de otro register de notifDisponibilidad)
     // Si no existe crearla
     // Buscar la última plaza ocupada por el user
     // Si no ha aparcado todavía poner notifSendToDevice a true y salir
     // Si el user está aparcado se le enviarán notificaciones cuando la ocupe y la deje otro usuario en scanQR,
     //    poner notifSendToDevice a true y salir

     // Si coinciden las Parking+plaza del user entonces poner notifSendToDevice a true
     // Si no coinciden actualizar la plaza de notifSendToDevice y poner notifSendToDevice a true
     // Crear una NotifDisponibilidad para este usuario que se rellenará con la plaza y fechas cuando la ocupe/abandone otro user

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
