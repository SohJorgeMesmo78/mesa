import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-site-footer',
  imports: [BrandLogoComponent],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {}
