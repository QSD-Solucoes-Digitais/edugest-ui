import {Component, ViewChild} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {Drawer, DrawerModule} from "primeng/drawer";
import {Ripple} from "primeng/ripple";
import {StyleClass} from "primeng/styleclass";
import {AvatarModule} from 'primeng/avatar';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DrawerModule, ButtonModule, Ripple, AvatarModule, StyleClass, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e: any): void {
    this.drawerRef.close(e);
  }

  visible: boolean = false;

}
