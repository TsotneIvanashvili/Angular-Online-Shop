import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiAreaService } from '../services/api-area.service';

@Component({
  selector: 'app-profile-page',
  imports: [RouterModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  constructor(public api: ApiAreaService) {}
  ngOnInit(): void {
    this.getProfileData();
  }

  public userId: any;

  getProfileData() {
    this.api.profileInfo().subscribe({
      next: (data: any) => {
        console.log(data);
        this.userId = data._id;
        sessionStorage.setItem('userId', this.userId);
      },
    });
  }
}
