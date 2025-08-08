import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-wedding-list',
  imports: [NavBarComponent],
  templateUrl: './wedding-list.component.html',
  styleUrls: ['./wedding-list.component.css']
})
export class WeddingListComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
