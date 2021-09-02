import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
// import { Geolocation } from '@ionic-native/geolocation/ngx';
// import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import * as L from 'leaflet';
import { MarkerService } from 'src/shared/services/marker.service';

import { AlertController } from '@ionic/angular';
import { IParking, IUserParking } from 'src/shared/interfaces/interfaces';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { LoadingService } from 'src/shared/services/Loading.service';


const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements  OnInit, AfterViewInit {
  // @ViewChild('map',  {static: false}) mapElement: ElementRef;
  // map: any;
  address: string;
  // autocomplete: { input: string };  autocompleteItems: any[];  googleAutocomplete: any;
  location: any;
  placeid: any;
  public parkings: IParking[] = [];
  public logedUserId: string;

  private map;

  constructor(
      // private geolocation: Geolocation,
      // private nativeGeocoder: NativeGeocoder,
      public zone: NgZone,
      private firestoreParkingService: FirestoreParkingService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      public authService: AuthenticationService,
      private firestoreUserParkingService: FirestoreUserParkingService,
      private router: Router,
      private markerService: MarkerService
    ) {
      // this.googleAutocomplete = new google.maps.places.AutocompleteService();
      // this.autocomplete = { input: '' };
      // this.autocompleteItems = [];
    }

  // Initialization
  ngAfterViewInit(): void {

  }

  ngOnInit() {
    this.initMap();
    // this.markerService.makeCapitalMarkers(this.map);
    this.markerService.makeCapitalCircleMarkers(this.map);
  }

  // Load the map
  initMap() {
    // this.map = L.map( 'mapLeaflet', { center: [41.41906, 2.17945 ], zoom: 18 } ); //openstreetmap.org/ vivari Pl.Maragall
    this.map = L.map( 'mapLeaflet', { center: [39.8282, -98.5795 ], zoom: 3 } );
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

  }  //end of initMap()

  /**
   * Print all parking marks in the map
   */
  printAllParkingsMarkers(){
    // // this.overrideMapsOverlayView();
    // // const iconBase = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/';
    // const iconBase = '../assets/icon/';
    // const icons: Record<string, { icon: string }> = {
    //   parking: {
    //     icon: iconBase + 'P@RKING-SEED-Transp-32x32.png',
    //   },
    // };

    // this.firestoreParkingService.getParkings().subscribe( (pparkings) =>  {
    //   this.parkings = pparkings.map( (t) => ({                           //1st subscribe param
    //     id: t.payload.doc.id,   ...t.payload.doc.data() as IParking
    //   }) );
    //   // console.log("printAllParkingsMarkers ", this.parkings);
    //   this.parkings.forEach( elemParking => {
    //     //Por cada párking colocamos un marcador en el mapa
    //     const latLngMarker = new google.maps.LatLng( elemParking.lat, elemParking.long );
    //     const marker = new google.maps.Marker(
    //       { position: latLngMarker,
    //         icon: icons["parking"].icon,
    //         // labelOrigin: new google.maps.Point( parseFloat(elemParking.lat), parseFloat(elemParking.long)) ;
    //         label: { text: elemParking.name , color: 'red', className : "MyLabelTranslate50px" } ,
    //         opacity: 0.75,
    //         draggable : true,
    //       }
    //     );
    //     marker.setMap(this.map);

    //     google.maps.event.addListener(marker, 'click',
    //       async () => {
    //         // Buscar parking por lat/long en this.parkings
    //         const parkingSelected = this.parkings.filter( p => p.lat === marker.position.lat().toString() &&
    //                                                           p.long === marker.position.lng().toString()  );
    //         const msgParkingSelected = parkingSelected[0].name;
    //         let respuesta = 'cancel';
    //         await this.presentAlert( msgParkingSelected ,'Confirm to Enter', '').then( resp => respuesta = resp as string );
    //         if ( respuesta === 'cancel' ) return;
    //         this.router.navigate(['/parking/' + elemParking.id]);
    //       }
    //     );

    //   });

    // }, (err) => {
    //   this.loadingService.dismiss();    //stop spinner
    //   console.error(err);
    // });

  }  // end of printAllParkingsMarkers

  //FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
  showCords(){
    // // alert('lat' +this.lat+', long'+this.long );
    // alert('latitude = ' +this.map.center.lat()+', longitude = '+this.map.center.lng() );
  }

  //autocomplete, update list in every view ion change event
  updateSearchResults(){
    // if (this.autocomplete.input === '') {
    //   this.autocompleteItems = [];
    //   return;
    // }
    // this.googleAutocomplete.getPlacePredictions( { input: this.autocomplete.input } ,
    //   (predictions, status) => {
    //     this.autocompleteItems = [];
    //     this.zone.run( () => {
    //       predictions?.forEach( (prediction) => { this.autocompleteItems.push(prediction); } );
    //     });
    //   }
    // );
  }

  //Función llamada desde ion-item en la ion-list
  selectSearchResult(item) {
    // // alert(JSON.stringify(item));
    // this.goTo(item);
    // this.autocompleteItems = [];
    // this.autocomplete.input = item.description ;
  }

  // Llamada desde el evento ionClear de la ion-searchbar
  clearAutocomplete(){
    // this.autocompleteItems = [];
    // this.autocomplete.input = '';
  }

  /**
   *  Llamar a geocoder para cambiar el centro de this.map a la localización de address
   * @param address : valid google maps address, i.e "Calle Corcega, 123, Barcelona, Spain"
   */
   geocodeAddress( address: any ) {
    // const geocoder = new google.maps.Geocoder();

    // geocoder.geocode( {address}, (results, status) => { } )
    //   .then( ({ results }) => {
    //     this.map.setCenter(results[0].geometry.location);
    //     // new google.maps.Marker({
    //     //   map: this.map,
    //     //   position: results[0].geometry.location,
    //     // });
    //   }).catch((e) =>
    //     alert('Geocode was not successful for the following reason: ' + e)
    //   );
  }

  /**
   * Llamar a geocodeAddress para cambiar la situación del mapa
   * @param pitem : item de la ion-searchbar
   */
   goTo(pitem){
  //   const address = pitem.description; //In this case it gets the address from an item.description on the ion-list
  //   this.geocodeAddress(address);
  //   // return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+pitem.placeid;
  }

    /**
   * Presents the modal where the user is asked to confirm or cancel
   * when he scans a parking place
   *
   * @param data
   */
     async presentAlert(_header: string, _message: string, data?: string) {
      // return new Promise( async (resolve) => {
      //   const alert = this.alertController.create( {
      //     header: _header,
      //     message: _message,
      //     backdropDismiss: false,
      //     buttons: [  { text: 'Cancel',  role: 'cancel',  handler: cancel => resolve('cancel')   },
      //                 { text: 'Confirm', role: 'confirm', handler: confirm => resolve('confirm') }
      //              ]
      //   } );  //alertController.create
      //   ( await alert ).present();
      // });
    }
}
