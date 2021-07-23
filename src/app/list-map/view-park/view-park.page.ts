import { Component, Input, OnInit } from '@angular/core';
import { IParking, IPlace, IUserParking } from 'src/shared/interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';
import { NavigationService } from 'src/shared/services/navigation.service';
import { GlobalEventsService } from 'src/shared/services/global-events.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { UserService } from 'src/shared/services/user.service';

@Component({
  selector: 'app-view-park',
  templateUrl: './view-park.page.html',
  styleUrls: ['./view-park.page.scss'],
})
export class ViewParkPage implements OnInit {
  @Input() parking: IParking;
  @Input() placesRows: IPlace[][] = [[]] ;  //Array of Array of IPlace for ion-grid
  id: any;
  data: any;
  isNewParking: Boolean = false;
  userParkings: IUserParking[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreParkingService: FirestoreParkingService,
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController,
    private navigation: NavigationService,
    private firestoreUserParkingService: FirestoreUserParkingService,
    public globalEventsService: GlobalEventsService,
    public userService: UserService
   ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
   }
  /**
    Load the view but wait to load of all parking(this.id) data
  */
  ngOnInit() {
    this.loadData();
    this.checkIfNewParking();
  }

  // callback function to sort 2 places:
  placesSortCriteria = (p1: IPlace, p2: IPlace) => {
    if (p1.coordX < p2.coordX) return -1;  //disordered
    else if (p1.coordX === p2.coordX) {      //see cols
      if (p1.coordY < p2.coordY) return -1;  //disordered
      else if (p1.coordY === p2.coordY) return 0; // equal
            else  return 1 ;                  // ordered
    }
  };

  // copy ordered parking.places to a 2 dimensional placesRows array grid
  copyPlacesToGrid() {
    if (this.parking.places.length > 0) {
      for ( let i=0, nextCol = 0, nextRow = 0, lastCoordX = this.parking.places[0].coordX ;
            i <  this.parking.places.length;
            i++)
      {
        if ( this.parking.places[i].coordX !== lastCoordX ) { // break: continue on next row
            lastCoordX = this.parking.places[i].coordX ;
            nextRow++; this.placesRows[nextRow] = [] ;
            nextCol=0;
          }
          this.placesRows[nextRow][nextCol] = this.parking.places[i];
          nextCol++;
      }
    }
  }

  /**
    Use  firestoreParkingService.getParking(id) that returns a Subscription embedded in a Promise
   */
  loadData() {
    this.firestoreParkingService.getParking(this.id)
      .subscribe(
        (pparking) => {
          this.parking = pparking as IParking;
          // sort every row of places individually
          this.parking.places = this.parking.places.sort( this.placesSortCriteria );
          // console.log('ParkingView.idParking = ', this.parking.idParking );
          // this.parking.places.forEach( item => console.log('X=',item.coordX,'Y=',item.coordY));
          this.copyPlacesToGrid();

          console.log("parking: ", this.parking);
          console.log("places: ", this.parking.places);

        },
        (err) => { alert('Error caught at subscribe on Firebase url "' + err.url + '" '); },   //2nd subscribe param
        () => {} //Complete
      );
  }

  //Checks if would be needed to add a new relationship user-parking in case the user scans a barcode
  checkIfNewParking() {
    this.firestoreUserParkingService.getUserParkingsSync().
        subscribe(
          (uparkings) => {
            this.userParkings = uparkings.map(
              (t) => ({
                id: t.payload.doc.id,
                ...t.payload.doc.data() as IUserParking
              })
            ).filter(
              (up) => up.idUser === JSON.parse(localStorage.getItem('user')).uid
            );
            console.log("userParkings: ", this.userParkings);

            let userParkingsString: String[] = [];
            this.userParkings.forEach(userParking => {
              userParkingsString.push(userParking.idParking);
            });

            //Check if this parking is a new one or not
            if (userParkingsString.indexOf(this.id) < 0) {
              console.log("Parking nuevo");
              this.isNewParking = true;
            }
          });
  }

  /**
   * Scan QR process, automatically opens camera, and catches
   * the scanned code in barcodeData variable
   */
   ScanQr() {
    this.data = null;
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.data = barcodeData;
      //TODO:
      //Buscar si existe la plaza escaneada
      const place = this.checkScannedCode(barcodeData.text);
      if(place != null){
        //mirar el estado de la plaza escaneada
        let header: string = "Barcode " + this.data.text + " Scanned!";
        let message: string;
        let isLeaving: boolean;
        if(place.occupied){
          //Ask sure leaving
          console.log("Place occupied!");
          message = "Do you want to leave your parking place free?";
          isLeaving = true;
        }else{
          //Ask sure staying
          console.log("Place NOT occupied!");
          isLeaving = false;
          message = "Do you want to park in this place?";
        }
        this.presentAlertConfirm(header, message, this.data.text, isLeaving)
      }else{
        console.log("El código escaneado no existe en este párking");
      }
      //Dependiendo del estado, preguntar una cosa u otra
      //Responder l input del usuario

    }).catch(err => {
      console.log('Error', err);
    });
  }

  checkScannedCode(data: string): IPlace{
    const row = data[0];
    const col = data[1];

    for (var i = 0, len = this.parking.places.length; i < len; i++) {
      console.log(this.parking.places[i].coordX + this.parking.places[i].coordY);

      if (this.parking.places[i].coordX === row && this.parking.places[i].coordY === col) {
        console.log("Place found!");
        return this.parking.places[i];
      }
      console.log('Loop will continue.');
    }
    return null;
  }

  invertPlaceStatus(data: string){
    const row = data[0];
    const col = data[1];

    for (var i = 0, len = this.parking.places.length; i < len; i++) {
      console.log(this.parking.places[i].coordX + this.parking.places[i].coordY);

      if (this.parking.places[i].coordX === row && this.parking.places[i].coordY === col) {
        console.log("Occupied BEFORE: " + this.parking.places[i].occupied);
        this.parking.places[i].occupied = !this.parking.places[i].occupied;
        console.log("Occupied AFTER: " + this.parking.places[i].occupied);
        break;
      }
      console.log('Loop will continue.');
    }
  }
  /**
   * Presents the modal where the user is asked to confirm or cancel
   * when he scans a parking place
   *
   * @param data
   */
   async presentAlertConfirm(_header: string, _message: string, data: string, isLeaving: boolean) {
    console.log("Alert creation");
    const alert = await this.alertController.create({
      header: _header,
      message: _message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            //if (isLeaving) {
              //
              //const place = this.checkScannedCode(data);
              this.invertPlaceStatus(data);
              console.log("PARKING ID: " + this.id);
              console.log("PARKING: " + this.parking.places);
              this.firestoreParkingService.update(this.id, this.parking);

              if (this.isNewParking) {
                console.log("Añade nuevo user parking");
                this.addNewUserParking();
              }

              this.loadData();
            //}else{
              //
            //}
          }
        }
      ]
    });

    await alert.present();
  }

  addNewUserParking() {
    let newUserParking: IUserParking;
    this.isNewParking = false;

    newUserParking = {
      idParking: this.id,
      idUser: JSON.parse(localStorage.getItem('user')).uid
    };

    this.userService.addParkingOnUser(newUserParking).then(() => {
      console.log("New UserParking added, idParking: " + newUserParking.idParking);
      console.log("New UserParking added, idUser: " + newUserParking.idUser);
    }).catch((err) => {
      console.log(err);
    });
  }

  onBackButtonPressed(){
    this.globalEventsService.publishSomeData();
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    // return mode === 'ios' ? 'Back' : 'Back';
    return 'Back';  //no 'Back' text for the moment
  }

  // [defaultHref]="getBackRoute()"
  getBackRoute(){
    // use the navigationService to get the last route into backRoute
    const backRoute = this.navigation.history[this.navigation.history.length - 2];
    if ( !backRoute )  return '/' ; // only one route in history
    else   return backRoute;
  }

}
