import { Component } from '@angular/core';
import { OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { IParking, IUserParking } from 'src/shared/interfaces/interfaces';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { LoadingService } from 'src/shared/services/Loading.service';
import { ParkingService } from 'src/shared/services/parking.service';
import { UserService } from 'src/shared/services/user.service';

declare var google;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address:string;
  lat: string;
  long: string;  
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;

  public parkings: IParking[] = [];
  public logedUserId: string;

  constructor(private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,    
    public zone: NgZone,
    private firestoreParkingService: FirestoreParkingService,
    private loadingService: LoadingService,
    public authService: AuthenticationService,
    private userService: UserService,
    private router: Router) 
    {
      this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
      this.autocomplete = { input: '' };
      this.autocompleteItems = [];
    }

  ngOnInit() {
    this.loadMap();
  }

  //CARGAR EL MAPA TIENE DOS PARTES 
  loadMap() {

    //init spinner
    this.loadingService.present();
    
    //OBTENEMOS LAS COORDENADAS DESDE EL TELEFONO.
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      } 
      
      //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude); 
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 
      
      this.printAllParkingsMarkers();
      
      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map, this.map.center.lat());
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
        this.lat = this.map.center.lat()
        this.long = this.map.center.lng()
      }); 
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  printAllParkingsMarkers(){
    this.firestoreParkingService.getParkings().subscribe((pparkings) =>  { 
      //stop spinner
      this.loadingService.dismiss();
      //const uid = this.authService.getUserData().uid;
      const uid = JSON.parse(localStorage.getItem('user')).uid;

      const _userService: UserService = this.userService;
      const _router: Router = this.router;

      let newUserParking: IUserParking;

      this.parkings = pparkings.map((t) => ({                           //1st subscribe param
        id: t.payload.doc.id,  
        ...t.payload.doc.data() as IParking
      }));

      console.log("in ", this.parkings);
      
      this.parkings.forEach(element => {
        //Por cada párking colocamos un marcador en el mapa
        let latLngMarker = new google.maps.LatLng(element.lat, element.long);
        var marker = new google.maps.Marker({
          position: latLngMarker
        });
        marker.setMap(this.map);
        
        google.maps.event.addListener(marker, 'click', function () {
          prueba(element, _userService, _router);
        });

        function prueba(element: IParking, service: UserService, _router: Router){
          console.log("Parking Selected: " + element.name);
          
          //TODO: Toda la lógica que cargue el parking seleccionado para el usuario seleccionado
          newUserParking = {
            idParking: element.id,
            idUser: uid
          }

          //TODO: CONTROL NON REPEATED RELATIONSHIP IN FIRESTORE DB
          _userService.addParkingOnUser(newUserParking).then(() => {
            //Go to the next page: DETALLE DEL PARKING
            _router.navigate(['/parking/' + newUserParking.idParking]);
          }).catch((err) => {
            console.log(err)
          });

        }

      });

    }, (err) => { 
      //stop spinner
      this.loadingService.dismiss();
      console.error(err); 
    });
  }
  
  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords "+lattitude+" "+longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5    
    }; 
    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if(value.length>0)
          responseAddress.push(value); 
        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value+", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) =>{ 
        this.address = "Address Not Available!";
      }); 
  }

  //FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
  ShowCords(){
    alert('lat' +this.lat+', long'+this.long )
  }
  
  //AUTOCOMPLETE, SIMPLEMENTE ACTUALIZAMOS LA LISTA CON CADA EVENTO DE ION CHANGE EN LA VISTA.
  // UpdateSearchResults(){
  //   if (this.autocomplete.input == '') {
  //     this.autocompleteItems = [];
  //     return;
  //   }
  //   this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
  //   (predictions, status) => {
  //     this.autocompleteItems = [];
  //     this.zone.run(() => {
  //       predictions.forEach((prediction) => {
  //         this.autocompleteItems.push(prediction);
  //       });
  //     });
  //   });
  // }
  
  //FUNCION QUE LLAMAMOS DESDE EL ITEM DE LA LISTA.
  // SelectSearchResult(item) {
  //   //AQUI PONDREMOS LO QUE QUERAMOS QUE PASE CON EL PLACE ESCOGIDO, GUARDARLO, SUBIRLO A FIRESTORE.
  //   //HE AÑADIDO UN ALERT PARA VER EL CONTENIDO QUE NOS OFRECE GOOGLE Y GUARDAMOS EL PLACEID PARA UTILIZARLO POSTERIORMENTE SI QUEREMOS.
  //   alert(JSON.stringify(item))      
  //   this.placeid = item.place_id
  // }
  
  
  //LLAMAMOS A ESTA FUNCION PARA LIMPIAR LA LISTA CUANDO PULSAMOS IONCLEAR.
  // ClearAutocomplete(){
  //   this.autocompleteItems = []
  //   this.autocomplete.input = ''
  // }
 
  //EJEMPLO PARA IR A UN LUGAR DESDE UN LINK EXTERNO, ABRIR GOOGLE MAPS PARA DIRECCIONES. 
  // GoTo(){
  //   return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+this.placeid;
  // }

}
