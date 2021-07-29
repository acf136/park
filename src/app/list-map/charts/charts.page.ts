import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IParking } from 'src/shared/interfaces/interfaces';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { LoadingService } from 'src/shared/services/Loading.service';
import { NavigationService } from 'src/shared/services/navigation.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
})
export class ChartsPage implements OnInit {

  @ViewChild('barCanvas') private barCanvas: ElementRef;
  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;

  barChart: any;
  doughnutChart: any;

  bars: any;
  colorArray: any;
  public parkingList: IParking[];

  public totalPlaces: number = 0;
  public occupiedPlaces: number = 0;
  public freePlaces: number = 0;

  public numberFreePlacesData: number[] = [];
  public numberOccupiedPlacesData: number[] = [];
  public ParkingNamesLabels: string[] = [];

  constructor(private firestoreParkingService: FirestoreParkingService,
    private router: Router,
    private loadingService: LoadingService,
    private navigation: NavigationService) { 
    Chart.register(...registerables);
  }

  ngOnInit() {
    //Charts creation needs to be in ionViewDidEnter
  }

  ionViewDidEnter() {
    this.loadData().subscribe(res => {
      this.manageData();
      this.createDoughnutChart();
      this.createBarChart();
    }, error => { 
      alert("Error getting all parkings");
    });
  }

  manageData(){
    let eachParkingFreePlaces: number = 0;
    let eachParkingOccupiedPlaces: number = 0;
      
    //Gets data to display on charts
    this.parkingList.forEach(parking => {
      this.ParkingNamesLabels.push(parking.name);
      this.totalPlaces += parking.places.length;
      parking.places.forEach(place => {
        if (place.occupied) {
          this.occupiedPlaces += 1;
          eachParkingOccupiedPlaces += 1;
        }else{
          this.freePlaces += 1;
          eachParkingFreePlaces += 1;
        }
      });
      this.numberFreePlacesData.push(eachParkingFreePlaces);
      this.numberOccupiedPlacesData.push(eachParkingOccupiedPlaces);
      eachParkingFreePlaces = 0;
      eachParkingOccupiedPlaces = 0;
    });
  }

  //Counts how many occupied and free places are in all different parkings
  loadData(): Observable<boolean> {
    return new Observable(observer => {
      //init spinner
      this.loadingService.present();

      this.firestoreParkingService.getParkings().subscribe( (pparkings) =>  {
        //stop spinner
        this.loadingService.dismiss();

        this.parkingList = pparkings.map( (t) => ({                           //1st subscribe param
          id: t.payload.doc.id,   ...t.payload.doc.data() as IParking
        }) );

        observer.next(true);
        observer.complete();
      }, (err) => {
        //stop spinner
        this.loadingService.dismiss();
        observer.error(err);
        observer.complete();
        console.log("Error getting document:", err);
      });
    });
  }

  createBarChart() {
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.ParkingNamesLabels,
        datasets: [{
          label: 'Number of free Places',
          data: this.numberFreePlacesData,
          backgroundColor: 'rgb(0,128,0)',
          borderColor: 'rgb(0,128,0)',
          borderWidth: 1
        },
        {
          label: 'Number of occupied Places',
          data: this.numberOccupiedPlacesData,
          backgroundColor: 'rgb(255,0,0)',
          borderColor: 'rgb(255,0,0)',
          borderWidth: 1
        }]
      }
    });
  }

  /**
   * Creates the Doughnut chart displaying Occupied / free places
   */
  createDoughnutChart() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Occupied Places', 'Free Places'],
        datasets: [{
          label: 'Places',
          data: [this.occupiedPlaces, this.freePlaces],
          backgroundColor: [
            'rgb(255,0,0)',
            'rgb(0,128,0)'
          ],
          hoverBackgroundColor: [
            'rgb(139,0,0)',
            'rgb(0,100,0)'
          ]
        }]
      }
    });
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
    if ( !backRoute ) {
    //  console.log('getBackRoute /');
      return '/' ; // only one route in history
    }
    else {
      // console.log('getBackRoute '+backRoute);
      return backRoute;
    }
  }

}