import { Component } from '@angular/core';
import { SkeletonComponent } from '../../skeleton/skeleton.component';

@Component({
  selector: 'app-skeleton-docs-page',
  imports: [SkeletonComponent],
  templateUrl: './skeleton-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class SkeletonDocsPage {}
