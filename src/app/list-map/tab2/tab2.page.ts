import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { IParking, IUserParking } from 'src/shared/interfaces/interfaces';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { LoadingService } from 'src/shared/services/Loading.service';

declare var google;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address: string;
  // lat: string;
  // long: string;
  autocomplete: { input: string };  autocompleteItems: any[];  googleAutocomplete: any;
  location: any;
  placeid: any;

  public parkings: IParking[] = [];
  public logedUserId: string;

  constructor(
      private geolocation: Geolocation,
      private nativeGeocoder: NativeGeocoder,
      public zone: NgZone,
      private firestoreParkingService: FirestoreParkingService,
      private loadingService: LoadingService,
      public authService: AuthenticationService,
      private firestoreUserParkingService: FirestoreUserParkingService,
      private router: Router
    ) {
      this.googleAutocomplete = new google.maps.places.AutocompleteService();
      this.autocomplete = { input: '' };
      this.autocompleteItems = [];
    }

  ngOnInit() {
    this.loadMap();
  }

  //CARGAR EL MAPA TIENE DOS PARTES
  loadMap() {
    this.loadingService.present();       //init spinner

    //OBTENEMOS LAS COORDENADAS DESDE EL TELEFONO.
    this.geolocation.getCurrentPosition().then( (resp) => {
      const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      const mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
      // this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.printAllParkingsMarkers();

      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map, this.map.center.lat());
        // this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng());
        // this.lat = this.map.center.lat();
        // this.long = this.map.center.lng();
      });
      this.loadingService.dismiss();                //stop spinner
    }).catch((error) => {
      this.loadingService.dismiss();                //stop spinner
      console.log('Error getting location', error);
    });

  }  //end of loadMap()

  /**
   * Print all parking marks in the map
   */
  printAllParkingsMarkers(){
    this.firestoreParkingService.getParkings().subscribe( (pparkings) =>  {

      const uid = JSON.parse(localStorage.getItem('user'))?.uid;
      const userParkingService = this.firestoreUserParkingService;
      const _router = this.router;

      let newUserParking: IUserParking;

      this.parkings = pparkings.map( (t) => ({                           //1st subscribe param
        id: t.payload.doc.id,   ...t.payload.doc.data() as IParking
      }) );

      // console.log("in ", this.parkings);

      this.parkings.forEach( elemParking => {
        //Por cada párking colocamos un marcador en el mapa
        const latLngMarker = new google.maps.LatLng(elemParking.lat, elemParking.long);
        const marker = new google.maps.Marker( { position: latLngMarker } );
        marker.setMap(this.map);

        // google.maps.event.addListener(marker, 'click', () => createNewUserParking(elemParking, userParkingService, _router)  );
        google.maps.event.addListener(marker, 'click', () => this.router.navigate(['/parking/' + elemParking.id])  );

        // async function createNewUserParking(elemParking: IParking, service: FirestoreUserParkingService, _router: Router) {
        //   // console.log("Parking Selected: " + elemParking.name);
        //   // //TODO: Toda la lógica que cargue el parking seleccionado para el usuario seleccionado
        //   // let newUserParking = {  idParking: elemParking.id,  idUser: uid   } ;
        //   // let myUPTable: IUserParking[] = [];
        //   // await service.getParkingsOfUser(newUserParking.idUser).then( (uptable) => myUPTable = uptable );
        //   // const existingUP =  myUPTable.filter( (up) => up.idParking === elemParking.id ) ;
        //   // // avoid creation of existing UserParking  elements
        //   // if ( existingUP.length === 0 )  service.create(newUserParking).then( (resolve) => {}  );
        //   _router.navigate(['/parking/' + newUserParking.idParking]) ;  //Go to the next page: parking detail
        // }

      });

    }, (err) => {
      this.loadingService.dismiss();    //stop spinner
      console.error(err);
    });
  }

  // /**
  //  *
  //  * @param lattitude
  //  * @param longitude
  //  */
  // getAddressFromCoords(lattitude, longitude) {
  //   // console.log("getAddressFromCoords "+lattitude+" "+longitude);
  //   let options: NativeGeocoderOptions = {
  //     useLocale: true,
  //     maxResults: 5
  //   };
  //   this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
  //     .then((result: NativeGeocoderResult[]) => {
  //       this.address = "";
  //       let responseAddress = [];
  //       for (let [key, value] of Object.entries(result[0])) {
  //         if(value.length>0)
  //         responseAddress.push(value);
  //       }
  //       responseAddress.reverse();
  //       for (let value of responseAddress) {
  //         this.address += value+", ";
  //       }
  //       this.address = this.address.slice(0, -2);
  //     })
  //     .catch((error: any) =>{
  //       this.address = "Address Not Available!";
  //     });
  // }

  //FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
  showCords(){
    // alert('lat' +this.lat+', long'+this.long );
    alert('latitude = ' +this.map.center.lat()+', longitude = '+this.map.center.lng() );
  }

  //autocomplete, update list in every view ion change event
  updateSearchResults(){
    if (this.autocomplete.input === '') {
      this.autocompleteItems = [];
      return;
    }
    this.googleAutocomplete.getPlacePredictions( { input: this.autocomplete.input } ,
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run( () => {
          predictions?.forEach( (prediction) => { this.autocompleteItems.push(prediction); } );
        });
      }
    );
  }

  //Función llamada desde ion-item en la ion-list
  selectSearchResult(item) {
    // alert(JSON.stringify(item));
    this.goTo(item);
  }

  // Llamada desde el evento ionClear de la ion-searchbar
  clearAutocomplete(){
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }

  /**
   *  Llamar a geocoder para cambiar el centro de this.map a la localización de address
   * @param address : valid google maps address, i.e "Calle Corcega, 123, Barcelona, Spain"
   */
   geocodeAddress( address: any ) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode( {address}, (results, status) => { } )
      .then( ({ results }) => {
        this.map.setCenter(results[0].geometry.location);
        // new google.maps.Marker({
        //   map: this.map,
        //   position: results[0].geometry.location,
        // });
      }).catch((e) =>
        alert('Geocode was not successful for the following reason: ' + e)
      );
  }

  /**
   * Llamar a geocodeAddress para cambiar la situación del mapa
   * @param pitem : item de la ion-searchbar
   */
   goTo(pitem){
    const address = pitem.description; //In this case it gets the address from an item.description on the ion-list
    this.geocodeAddress(address);
    // return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+pitem.placeid;
  }

}
