import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { PaymentService } from '../../services/payment/payment.service';
import { AssistantService } from '../../services/assistant.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  activeTab = 'users';
  currentDate = new Date();
  userSearchTerm = '';
  activeCount = 0;
  inactiveCount = 0;
  totalAssistants = 0;
  time = 'Daily';
  totalUsers = 0;
  averageAssistantsPerUser = 0;
  maxAssistantsPerUser = 0;
  revenueCurrentYear = 0;
  avgPerMonth = 0

  tabs = [
    { key: 'users', label: 'Users' },
    { key: 'payments', label: 'Payments' },
    { key: 'assistants', label: 'AI Assistants' }
  ];

  stats = {
    totalUsers: 1247,
    newUsersThisMonth: 84,
    totalRevenue: 45670,
    revenueGrowth: 12.5,
    aiInteractions: 15420,
    activeAssistants: 8
  };

  usersChartData!: ChartData<'bar'>;
  usersChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: 'rgba(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          title: function (context: any) {
            return context[0].label;
          },
          label: function (context: any) {
            return `${context.parsed.y} users`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            //weight: 'medium'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.8)',
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          stepSize: 1,
          callback: function (value: any) {
            return value + ' users';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    elements: {
      bar: {
        borderRadius: 8
      }
    }
  };

  paymentPieChartData!: ChartData<'pie'>;
  paymentLineChartData!: ChartData<'line'>;
  paymentBarChartData!: ChartData<'bar'>;
  paymentLineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#3b82f6',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 15,
        callbacks: {
          title: function (context: any) {
            return context[0].label + ' Revenue';
          },
          label: function (context: any) {
            return `${context.parsed.y.toLocaleString()} TND`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            //weight: 'medium' as const
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.8)',
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          stepSize: 1000,
          callback: function (value: any) {
            return (value / 1000).toFixed(0) + 'K';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const
    },
    elements: {
      line: {
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const
      }
    }
  };
  paymentBarChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#3b82f6',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 15,
        callbacks: {
          label: function (context: any) {
            return `Revenue: ${context.parsed.y.toLocaleString()} TND`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            //weight: 'medium' as const
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.8)',
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          callback: function (value: any) {
            return value.toLocaleString();
          },
          stepSize: 1000,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart' as const
    }
  };
  paymentPieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#374151',
          font: {
            size: 12,
            //weight: 'medium' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#3b82f6',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 15,
        callbacks: {
          label: function (context: any) {
            const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutQuart' as const
    }
  };
  usersStatsLoaded = false;
  paymentsStatsLoaded = false;
  assistantsStatsLoaded = false;
  // Orange-themed color palette
  // Option 1: Multi-Color Vibrant Palette (Recommended)
  colorPalette = {
    primary: [
      'rgba(59, 130, 246, 0.8)',  // blue-500
      'rgba(247, 148, 29, 0.8)',  // emerald-500
      'rgba(16, 185, 129, 0.8)',  // amber-500
      'rgba(239, 68, 68, 0.8)',   // red-500
      'rgba(139, 92, 246, 0.8)'   // violet-500
    ],
    borders: [
      'rgba(59, 130, 246, 0.8)',  // blue-500
      'rgba(251, 146, 60, 0.9)',  // emerald-500
      'rgba(16, 185, 129, 0.8)',  // amber-500
      'rgba(239, 68, 68, 0.8)',   // red-500
      'rgba(139, 92, 246, 0.8)'   // violet-500
    ]
  };

  assistantPalette = {
    line: {
      primary: 'rgba(59, 130, 246)', // orange-500
      background: 'rgba(59, 130, 246, 0.1)',
      gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)'
    },
    doughnut: {
      active: 'rgba(34, 197, 94, 0.9)', // green-500 for active
      inactive: 'rgba(239, 68, 68, 0.9)', // red-500 for inactive
      activeBorder: 'rgb(34, 197, 94)',
      inactiveBorder: 'rgb(239, 68, 68)'
    }
  };
  assistantsChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Number of Assistants',
        data: [],
        borderColor: this.assistantPalette.line.primary,
        backgroundColor: this.assistantPalette.line.background,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: this.assistantPalette.line.primary,
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: this.assistantPalette.line.primary,
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 3,
      }
    ]
  };

  assistantsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#3b82f6',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 15,
        callbacks: {
          title: function (context: any) {
            return context[0].label + ' Assistants';
          },
          label: function (context: any) {
            return `Total: ${context.parsed.y.toLocaleString()} assistants`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            //weight: 'medium' as const
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.8)',
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          stepSize: 100,
          callback: function (value: any) {
            return value.toLocaleString();
          }
        },

      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const
    },
    elements: {
      line: {
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const
      }
    }
  };

  assistantsDoughnutChartData: ChartData<'doughnut'> = {
    labels: ['Active Assistants', 'Inactive Assistants'],
    datasets: [
      {
        data: [],
        backgroundColor: []
      }
    ]
  };

  assistantsDoughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#374151',
          font: {
            size: 12,
            //weight: 'medium' as const
          }
        }
      },
      tooltip: {
        enabled: true, // Explicitly enable tooltips
        external: undefined, // Remove any custom external tooltip
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#3b82f6',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 15,
        callbacks: {
          label: function (context: any) {
            const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        hoverBackgroundColor: undefined, // Let Chart.js handle hover colors
        hoverBorderColor: undefined,
        hoverBorderWidth: 3
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutQuart' as const
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  };


  constructor(private usersService: UserService, private paymentsService: PaymentService, private assistantService: AssistantService) { }

  ngOnInit(): void {
    // Update current time every minute
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    this.loadUsersStats();
  }




  getTabClasses(tabKey: string): string {
    const baseClasses = 'flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200';

    if (this.activeTab === tabKey) {
      return baseClasses + ' bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg';
    }
    return baseClasses + ' text-gray-600 hover:text-orange-600 hover:bg-orange-50';
  }


  onTabClick(tabKey: string) {
    this.activeTab = tabKey;
    switch (tabKey) {
      case 'users':
        this.loadUsersStats();

        break;
      case 'payments':
        this.loadPaymentsStats();

        break;
      case 'assistants':
        this.loadAssistantsStats("per_day");
        break;
      default:
        break;
    }
  }


  loadUsersStats() {
    if (this.usersStatsLoaded) {
      this.usersChartData.datasets[0].data = [];
    }
    this.usersService.getUserStats().subscribe((res) => {
      this.totalUsers = res.totalUsers;
      const distribution = res.assistantsDistribution.distribution;
      this.maxAssistantsPerUser = res.assistantsDistribution.stats.maxassistantsperuser;
      this.averageAssistantsPerUser = res.assistantsDistribution.stats.avgassistantsperuser;
      const buckets = [1, 2, 3, 4, 5];
      const chartData = buckets.map(b => distribution.find((d: { assistantsCount: number; }) => d.assistantsCount === b)?.usersCount || 0);
      console.log("chartsData=", chartData);
      this.usersChartData = {
        labels: ['1 Assistant', '2 Assistants', '3 Assistants', '4 Assistants', '5+ Assistants'],
        datasets: [{
          label: 'Number of Users',
          data: chartData,
          backgroundColor: [
            'rgba(244, 63, 94, 0.9)',   // rose-500
            'rgba(251, 113, 133, 0.9)', // rose-400
            'rgba(245, 158, 11, 0.9)',  // amber-500
            'rgba(34, 197, 94, 0.9)',   // green-500
            'rgba(99, 102, 241, 0.9)'   // indigo-500
          ],
          borderColor: [
            'rgba(244, 63, 94, 0.9)',   // rose-500
            'rgba(251, 113, 133, 0.9)', // rose-400
            'rgba(245, 158, 11, 0.9)',  // amber-500
            'rgba(34, 197, 94, 0.9)',   // green-500
            'rgba(99, 102, 241, 0.9)'   // indigo-500
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      };
      this.usersStatsLoaded = true;
    });


  }

  loadPaymentsStats() {
    this.paymentsService.getPaymentsStats().subscribe(data => {
      console.log(data);
      this.revenueCurrentYear = data.revenueCurrentYear.totalRevenue;
      this.avgPerMonth = data.revenueCurrentYear.avgPerMonth;

      // Enhanced Pie Chart
      this.paymentPieChartData = {
        labels: data.repartition.map((d: { subscriptionPlan: string; }) => d.subscriptionPlan),
        datasets: [
          {
            data: data.repartition.map((d: { total_payments: number; }) => d.total_payments),
            backgroundColor: this.colorPalette.primary,
            borderColor: this.colorPalette.borders,
            borderWidth: 2,
            hoverOffset: 15,
            hoverBorderWidth: 3,
            hoverBorderColor: '#FFFFFF',
          },
        ],
      };


      // Enhanced Bar Chart
      this.paymentBarChartData = {
        labels: data.repartition.map((d: { subscriptionPlan: string; }) => d.subscriptionPlan),
        datasets: [
          {
            label: 'Revenue',
            data: data.repartition.map((d: { total_revenue: number; }) => d.total_revenue),
            backgroundColor: this.colorPalette.primary,
            borderColor: this.colorPalette.borders,
            borderWidth: 2,
            borderRadius: 12,
            borderSkipped: false,
            hoverBackgroundColor: this.colorPalette.borders,
            hoverBorderWidth: 3,
          },
        ],
      };



      // Enhanced Line Chart
      this.paymentLineChartData = {
        labels: data.revenuePerMonth.map((d: { month: string | number | Date; }) =>
          new Date(d.month).toLocaleString('default', { month: 'short', year: 'numeric' })
        ),
        datasets: [
          {
            label: 'Revenue',
            data: data.revenuePerMonth.map((d: { total_revenue: any; }) => d.total_revenue),
            borderColor: 'rgba(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246,0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: 'rgba(59, 130, 246)',  
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(59, 130, 246)',
            pointHoverBorderColor: '#FFFFFF',
            pointHoverBorderWidth: 3,
          },
        ],
      };


      this.paymentsStatsLoaded = true;

    });
    if (this.paymentsStatsLoaded) {
      this.paymentBarChartData.datasets[0].data = [];
      this.paymentLineChartData.datasets[0].data = [];
      this.paymentPieChartData.datasets[0].data = [];

    }
  }

  // Add these helper methods to your component class

  getTotalRevenue(): number {
    if (!this.paymentBarChartData?.datasets?.[0]?.data) return 0;
    // return this.paymentBarChartData.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
    return 10;
  }


  getGrowthRate(): number {
    if (!this.paymentLineChartData?.datasets?.[0]?.data || this.paymentLineChartData.datasets[0].data.length < 2) return 0;

    const data = this.paymentLineChartData.datasets[0].data;
    console.log(data);
    const lastMonth = data[data.length - 1] as number;
    const previousMonth = data[data.length - 2] as number;

    if (previousMonth === 0) return 0;

    return Math.round(((lastMonth - previousMonth) / previousMonth) * 100);
  }



  loadAssistantsStats(period: string) {
    if (!this.totalAssistants) {
      this.assistantService.getTotalAssistants().subscribe(
        (res) => this.totalAssistants = res.totalAssistants,
      )
    }
    if (period == "per_day") {
      this.loadDailyStats();
    }
    else {
      this.time = 'Monthly';
      this.loadMonthlyStats();
    }
    const assistantPalette = {
      line: {
        primary: 'rgba(59, 130, 246)', // orange-500
        background: 'rgba(249, 115, 22, 0.1)',
        gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)'
      },
      doughnut: {
        active: 'rgba(34, 197, 94, 0.9)', // green-500 for active
        inactive: 'rgba(239, 68, 68, 0.9)', // red-500 for inactive
        activeBorder: 'rgb(34, 197, 94)',
        inactiveBorder: 'rgb(239, 68, 68)'
      }
    };
    this.assistantService.getAssistantsStatus().subscribe((res: { activeCount: number; inactiveCount: number; }) => {
      console.log("res==", res);
      this.activeCount = res.activeCount;
      this.inactiveCount = res.inactiveCount;
      this.assistantsDoughnutChartData = {
        labels: ['Active Assistants', 'Inactive Assistants'],
        datasets: [
          {
            data: [res.activeCount, res.inactiveCount],
            backgroundColor: [
              assistantPalette.doughnut.active,
              assistantPalette.doughnut.inactive
            ],
            borderColor: [
              assistantPalette.doughnut.activeBorder,
              assistantPalette.doughnut.inactiveBorder
            ],
            borderWidth: 2,
            hoverOffset: 15,
            hoverBorderWidth: 3,
            hoverBorderColor: '#FFFFFF',
            // cutout: '60%', // Makes it a doughnut instead of pie
          },
        ],
      };
      this.assistantsStatsLoaded = true;
    });
    if (this.assistantsStatsLoaded) {
      this.assistantsChartData.datasets[0].data = [];
      this.assistantsDoughnutChartData.datasets[0].data = [];
      this.assistantsStatsLoaded = false;
    }

  }



  loadDailyStats(month?: number, year?: number) {
    this.assistantService.getAssistantStats('per_day', month, year).subscribe(res => {
      console.log("daily stats:", res);
      this.assistantsChartData = {
        ...this.assistantsChartData,
        labels: res.data.map((d: { label: any }) => d.label),
        datasets: [
          {
            ...this.assistantsChartData.datasets[0],
            data: res.data.map((d: { total: number }) => d.total)
          }
        ]
      };


      // this.assistantsChartData.labels = res.data.map((d: { label: any; }) => d.label);
      // this.assistantsChartData.datasets[0].data = res.data.map((d: { total: number; }) => d.total);

    });
  }



  loadMonthlyStats(year?: number) {
    this.assistantService.getAssistantStats('per_month', undefined, 2025).subscribe(res => {
      this.assistantsChartData = {
        ...this.assistantsChartData,
        labels: res.data.map((d: { label: any }) => d.label),
        datasets: [
          {
            ...this.assistantsChartData.datasets[0],
            data: res.data.map((d: { total: number }) => d.total)
          }
        ]
      };
    });
  }

  // Add these helper methods to your component class for Assistant Charts

  getActiveRate(): number {
    return Math.round((this.activeCount / this.totalAssistants) * 100);
  }

  getInactiveRate(): number {
    return Math.round((this.inactiveCount / this.totalAssistants) * 100);
  }



  getPeakPeriod(): string {
    if (!this.assistantsChartData?.datasets?.[0]?.data || !this.assistantsChartData?.labels) return 'N/A';

    const data = this.assistantsChartData.datasets[0].data;
    const labels = this.assistantsChartData.labels;
    const maxValue = Math.max(...data.map(d => Number(d)));
    const maxIndex = data.findIndex(d => Number(d) === maxValue);

    return labels[maxIndex]?.toString() || 'N/A';
  }

  getAssistantGrowthRate(): number {
    if (!this.assistantsChartData?.datasets?.[0]?.data || this.assistantsChartData.datasets[0].data.length < 2) return 0;

    const data = this.assistantsChartData.datasets[0].data;
    const lastPeriod = Number(data[data.length - 1]);
    const previousPeriod = Number(data[data.length - 2]);

    if (previousPeriod === 0) return 0;

    return Math.round(((lastPeriod - previousPeriod) / previousPeriod) * 100);
  }
}




