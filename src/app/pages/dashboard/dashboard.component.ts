import {Component,OnInit, OnDestroy} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar';
import { WebSocketService } from '../services/websocket.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import {
  NbComponentStatus,
  NbGlobalLogicalPosition,
  NbGlobalPhysicalPosition,
  NbGlobalPosition,
  NbToastrService,
  NbToastrConfig,
} from '@nebular/theme';

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
  total: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit,OnDestroy {

  private alive = true;
  apiUrl:string = "https://localhost:7228/";
  socketSubscription: Subscription = new Subscription();
  solarValue: number;
  lowStockValue: string ='0';
  overStockValue: string ='0';
  expiringValue: string ='0';
  totalProductsValue: string ='0';
  outOfStockValue: string ='0';
  expiredValue: string ='0';
  notificationList: any=[];
  lightCard: CardSettings = {
    title: 'Low stock items',
    iconClass: 'nb-arrow-thin-down',
    type: 'warning',
    total: ''
  };
  rollerShadesCard: CardSettings = {
    title: 'Over stock items',
    iconClass: 'nb-paper-plane',
    type: 'info',
    total: ''
  };
  wirelessAudioCard: CardSettings = {
    title: 'Expiring Items',
    iconClass: 'nb-danger',
    type: 'danger',
    total: ''
  };
  // coffeeMakerCard: CardSettings = {
  //   title: 'Coffee Maker',
  //   iconClass: 'nb-coffee-maker',
  //   type: 'warning',
  // };

  statusCards: string;

  commonStatusCardsSet: CardSettings[] = [
    this.lightCard,
    this.rollerShadesCard,
    this.wirelessAudioCard,
    // this.coffeeMakerCard,
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    dark: CardSettings[];
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    dark: this.commonStatusCardsSet,
  };
  config: NbToastrConfig;
  destroyByClick = true;
  duration = 4000;
  hasIcon = true;
  position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
  preventDuplicates = false;

  constructor(private themeService: NbThemeService,
              private solarService: SolarData,
              private websocketService : WebSocketService,
              private http: HttpClient,
              private toastrService: NbToastrService
            ) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
    });

    this.solarService.getSolarData()
      .pipe(takeWhile(() => this.alive))
      .subscribe((data) => {
        this.solarValue = data;
      });
  }

    ngOnInit(){
    this.getDashboardData("");
    this.getNotificationList();
    this.websocketService.startConnection().subscribe(() => {
      this.websocketService.receiveMessage().subscribe((message) => {
        console.log("Real time update triggered.");
        this.getDashboardData("UPDATE");
      });
    });

    
    // this.socketSubscription = this.websocketService.connect('ws://your-server-url')
    //   .subscribe({
    //     next: (data: any) => {
    //       this.lowStockValue = data?.lowStock;
    //       this.overStockValue=data?.overStock;
    //       this.expiryValue = data?.expiryStock;
    //     },
    //     error: (err) => {
    //       console.error('WebSocket Error:', err);
    //     }
    //   });
  }

  private showToast(type: NbComponentStatus, title: string, body: string) {
      const config = {
        status: type,
        destroyByClick: this.destroyByClick,
        duration: this.duration,
        hasIcon: this.hasIcon,
        position: this.position,
        preventDuplicates: this.preventDuplicates,
      };
      const titleContent = title ? `${title}` : '';
  
      this.toastrService.show(
        body,
        titleContent,
        config);
  }
  getDashboardData(message: string){
    this.http.get(this.apiUrl + 'api/inventory/dashboard-metrics').subscribe((data:any) => {
          this.lowStockValue = data?.lowStockItems;
          this.overStockValue=data?.overStockItems;
          this.outOfStockValue=data?.outOfStockItems;
          this.totalProductsValue = data?.totalProducts;
          this.expiringValue = data?.expiringItems;
          this.expiredValue = data?.expiredItems;
          if(message){
            this.showToast('success','Success', "Metrics data updated." );
          }
    });
  }
  getNotificationList(){
    this.http.get(this.apiUrl + 'api/inventory/notification-list').subscribe((data:any) => {
          if(data){
            this.notificationList = data;
          }
    });
  }
  ngOnDestroy() {
    this.alive = false;
    this.socketSubscription.unsubscribe();
  }
}
