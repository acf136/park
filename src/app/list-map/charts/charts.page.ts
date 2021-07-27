import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
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

  //@ViewChild('barCanvas') private barCanvas: ElementRef;
  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  //@ViewChild('lineCanvas') private lineCanvas: ElementRef;

  //barChart: any;
  doughnutChart: any;
  //lineChart: any;

  bars: any;
  colorArray: any;
  public parkingList: IParking[];

  public totalPlaces: number = 0;
  public occupiedPlaces: number = 0;
  public freePlaces: number = 0;

  constructor(private firestoreParkingService: FirestoreParkingService,
    private router: Router,
    private loadingService: LoadingService,
    private navigation: NavigationService) { 
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadData();
  }

  //Counts how many occupied and free places are in all different parkings
  loadData(){
    //init spinner
    this.loadingService.present();

    this.firestoreParkingService.getParkings().subscribe((parkings) => {
      //stop spinner
      this.loadingService.dismiss();

      this.parkingList = parkings.map((t) => ({
        id: t.payload.doc.id,
        ...t.payload.doc.data() as IParking
      }));

      // let pparkings = parkings as IParking[];
      // pparkings.forEach(parking => {
      //   let newParking = parking as IParking;
      //   this.parkingList.push(newParking)
      // });

      //Counts how many free / occupied places there are in total
      this.parkingList.forEach(parking => {
        this.totalPlaces += parking.places.length;
        parking.places.forEach(place => {
          if (place.occupied) {
            this.occupiedPlaces += 1;
          }else{
            this.freePlaces += 1;
          }
        });
      });

      this.createDoughnutChart();
    }, (err) => {
      //stop spinner
      this.loadingService.dismiss();
      console.error(err);
    });
  }

  // countPlaces() {
  //   this.parkingList.forEach(parking => {
  //     this.totalPlaces += parking.places.length;
  //     parking.places.forEach(place => {
  //       if (place.occupied) {
  //         this.occupiedPlaces += 1;
  //       }else{
  //         this.freePlaces += 1;
  //       }
  //     });
  //   });

  //   this.createDoughnutChart();
  // }

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

  // onClickBack(){
  //   // return this.backRoute ;
  //   //return '/tabs/tab1';
  //   this.router.navigate(['/tabs/tab1']);
  // }

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