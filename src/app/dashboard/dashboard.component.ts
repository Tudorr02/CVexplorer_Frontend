import { Component , OnInit , inject , computed, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';

import { SplitterModule } from 'primeng/splitter';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ChartModule } from 'primeng/chart';
import { ChartCounts, ChartsService } from '../_services/charts.service';
import { min } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [ChartModule,RouterModule, SplitterModule,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  AccountService = inject(AccountService);
  Router = inject(Router);
  chartsService = inject(ChartsService);

  chart2Data: any;
  chart2Options: any;

  chart1Data: any;
  chart1Options: any;

  cd = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  positionPublicId?: string;
  departmentId?:     number;
 
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(qp => {
        this.positionPublicId = qp.get('positionPublicId') ?? undefined;
        const dept = qp.get('departmentId');
        this.departmentId = dept != null ? Number(dept) : undefined;   
        this.loadSeniorityChart(this.positionPublicId!, this.departmentId!);  
        this.loadScoresChart(this.positionPublicId, this.departmentId);
    });
  }



  loadScoresChart(positionPublicId?: string, departmentId?: number): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.chartsService
      .getScoreDistribution(positionPublicId, departmentId)
      .subscribe((data: ChartCounts) => {
        const labels = Object.keys(data);
        const values = Object.values(data);

        // Colors from CSS tokens
        const bgColor = [
          documentStyle.getPropertyValue('--p-cyan-500'),
          documentStyle.getPropertyValue('--p-primary-color'),
          documentStyle.getPropertyValue('--p-orange-500'),
          documentStyle.getPropertyValue('--p-gray-500'),
        ];

        const borderColor = [
          documentStyle.getPropertyValue('--p-cyan-400'),
          documentStyle.getPropertyValue('--p-primary-hover-color'),
          documentStyle.getPropertyValue('--p-orange-400'),
          documentStyle.getPropertyValue('--p-gray-400'),
        ];

       
        this.chart2Data = {
          labels,
          datasets: [
            {
              // label: 'Score Density',
              data: values,
              backgroundColor: bgColor.slice(0, labels.length),
              borderColor: borderColor.slice(0, labels.length),
              borderWidth: 1,
              minBarLength: 5,
            }
          ]
        };

        this.chart2Options = {
          responsive: true,
          
          plugins: {
            legend: {
              display:false
            }
          },
          scales: {
            x: {
               ticks: {
                color: textColorSecondary,
                font: {
                  size: 15,
                  weight: 'bold',
                  family: 'Lexend'
                }
              },
              grid: { color: surfaceBorder }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: textColorSecondary,
                font: {
                  size: 15,
                  weight: 'bold',
                  family: 'Lexend'
                }
              },
              grid: { color: surfaceBorder }
            }
          }
        };
        this.cd.markForCheck();
      });
  }

  loadSeniorityChart(positionPublicId: string, departmentId: number): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-muted-color');

    this.chartsService
      .getSeniorityDistribution(positionPublicId, departmentId)
      .subscribe((data: ChartCounts) => {
        const labels = Object.keys(data);
        const rawValues = Object.values(data);

        const backgroundColor = [
          documentStyle.getPropertyValue('--p-cyan-500'),
          documentStyle.getPropertyValue('--p-primary-color'),
          documentStyle.getPropertyValue('--p-orange-500'),
          documentStyle.getPropertyValue('--p-gray-500'),
          documentStyle.getPropertyValue('--p-purple-500')
        ];

        const hoverBackgroundColor = [
          documentStyle.getPropertyValue('--p-cyan-400'),
          documentStyle.getPropertyValue('--p-primary-hover-color'),
          documentStyle.getPropertyValue('--p-orange-400'),
          documentStyle.getPropertyValue('--p-gray-400'),
          documentStyle.getPropertyValue('--p-purple-400')
        ];

         const total = rawValues.reduce((sum, v) => sum + v, 0);
        const minPercent = 0.02; // 2%
        const minValue = total * minPercent;
        let adjusted = rawValues.map(v => (v > 0 && v < minValue) ? minValue : v);
        const adjustedSum = adjusted.reduce((sum, v) => sum + v, 0);
        adjusted = adjusted.map(v => (v / adjustedSum) * total);


        this.chart1Data = {
          labels,
          datasets: [
            {
              data: adjusted,
              backgroundColor: backgroundColor.slice(0, labels.length),
              hoverBackgroundColor: hoverBackgroundColor.slice(0, labels.length),
              rawData: rawValues, // păstrăm valorile originale pentru tooltip
            }
          ]
        };

        this.chart1Options = {
          responsive: true,
          cutout: '60%',
          radius: '80%',
          plugins: {
             
            legend: {
              
              position: 'top',
              align: 'center',
              labels: {
                color: textColor,
                font:{
                  size : 15,
                  weight: 'bold',
                  family: 'Lexend'
                },
                padding: 14
              },
              
              
            },
            tooltip: {
              callbacks: {
                label: (context: { dataIndex: any; dataset: { rawData: { [x: string]: any; }; }; label: any; }) => {
                  const idx = context.dataIndex;
                  const raw = context.dataset.rawData[idx];
                  return `${context.label}: ${raw}`;
                }
              }
            },
            
          },
          layout: {
            padding: {
              top: 20,
              bottom: 20,
            }
            
          }
        }
        this.cd.markForCheck();
      });
  }
}

