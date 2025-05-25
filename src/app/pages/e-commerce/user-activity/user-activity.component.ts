import { Component, OnInit,OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserActivityData, UserActive } from '../../../@core/data/user-activity';

@Component({
  selector: 'ngx-user-activity',
  styleUrls: ['./user-activity.component.scss'],
  templateUrl: './user-activity.component.html',
})
export class ECommerceUserActivityComponent implements OnInit,OnDestroy {

  private alive = true;
  apiUrl:string = "https://localhost:7228/";
  notificationList : any =[];
  userActivity: UserActive[] = [];
  type = 'month';
  types = ['week', 'month', 'year'];
  currentTheme: string;

  constructor(private themeService: NbThemeService,
              private userActivityService: UserActivityData, private http: HttpClient) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });

   // this.getUserActivity(this.type);
  }

  // getUserActivity(period: string) {
  //   this.userActivityService.getUserActivityData(period)
  //     .pipe(takeWhile(() => this.alive))
  //     .subscribe(userActivityData => {
  //       this.userActivity = userActivityData;
  //     });
  // }
  ngOnInit(): void {
    this.getNotificationList();
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
  }
}
