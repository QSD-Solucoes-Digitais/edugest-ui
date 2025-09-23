import {Component, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {DrawerModule} from 'primeng/drawer';
import {AvatarModule} from 'primeng/avatar';
import {MenuItem} from 'primeng/api';
import {Breadcrumb} from 'primeng/breadcrumb';
import {Header} from './component/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DrawerModule, ButtonModule, AvatarModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('edugest-ui');

  items: MenuItem[] | undefined;

  home: MenuItem | undefined;

  ngOnInit() {
    this.items = [
      { label: 'Electronics' },
      { label: 'Computer' },
      { label: 'Accessories' },
      { label: 'Keyboard' },
      { label: 'Wireless' }
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };
  }
}
