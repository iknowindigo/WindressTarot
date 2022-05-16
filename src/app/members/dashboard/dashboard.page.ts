import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeDbService, DashboardUserInfo, TarotThrowCount } from '../../services/realtime-db.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  displayName: string;
  dashFolks: DashboardUserInfo[];
  classicFolk: DashboardUserInfo[];
  throwCounts: TarotThrowCount[];
  allThrowCounts: TarotThrowCount;
  refreshText: string;
  includeIndividualThrowsCounts: boolean;

  constructor(
    private router: Router,
    private realtimeDB: RealtimeDbService,
  ) {
    this.classicFolk = [];
    this.dashFolks = [];
    this.displayName = '';
    this.refreshText = '';
    this.throwCounts = [];
    this.includeIndividualThrowsCounts = false; // turn this on to see individual throw data
    this.allThrowCounts = new TarotThrowCount();
  }

  ngOnInit() {
    this.realtimeDB.watchLogins();
    this.realtimeDB.watchClassicLogins(); // 12-20
    this.realtimeDB.countAllReadings(); // another run
    this.realtimeDB.dashboardReadyState.subscribe(state => {
      if (state > 0) {
        // console.log('reading counts done');
        this.throwCounts = this.realtimeDB.getAllReadings();
        this.allThrowCounts = this.realtimeDB.getAllReadingTotals();
        this.refreshText = '!';
      }
    });
    this.realtimeDB.dashBoardState.subscribe(stateDashBoard => {
      if (stateDashBoard > 0) {
        this.dashFolks = this.realtimeDB.getDashFolks();
        this.classicFolk = this.realtimeDB.getClassicFolk();
        // console.log('dashboard has folks', this.dashFolks, this.classicFolk);
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
