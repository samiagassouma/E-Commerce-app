import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Payment } from '../../services/payment/payment.service';
import { AuthService, User } from '../../services/auth/auth.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.vfs = pdfFonts.vfs;



export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent {

  payment: any;  // empty object (type-cast to Payment)
  currentUser: User | null = null;
  quantite: number = 0;
  subtotal: number = 0
  tvaRate: number = 19; // TVA 19%

  constructor(private route: ActivatedRoute, private location: Location, private authService: AuthService) { }

  invoiceNumber: string = '';
  invoiceDate: string = '' ;
  timbreFiscal = 1;

  companyInfo = {
    name: 'SFYF development',
    logo: 'assets/logo-social.png',
    address: '15, Rue Abou El Kacem Chebbi',
    city: 'BARDO, Tunis',
    phone: '21 701 089',
    email: 'sfyfdevelopment@gmail.com',
    siret: '12345678901234',
    tva: 'FR12345678901'
  };

  clientInfo = {
    name: '',
    company: '',
    email: '',
    taxNumber: ''
  };



  ngOnInit(): void {

    // retrieve passed data
    this.payment = history.state.payment;
    console.log(this.payment);
    this.quantite = Number(this.payment.subscriptionPlan.charAt(0))
    this.subtotal = this.payment.amount * this.quantite;
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${this.payment.idPayment}`;
    this.invoiceDate = new Date(this.payment.paymentDate).toLocaleDateString('tn-TN');
    
    this.clientInfo = {
      name: this.payment.User.name + ' ' + this.payment.User.lastName,
      company: this.payment.User.company_name,
      email: this.payment.User.email,
      taxNumber: this.payment.User.tax_number
    }
    console.log(this.payment);
    if (!this.payment) {
      // fallback: redirect back if no payment found
      this.location.back();
    }
  }


  goBack(): void {
    this.location.back();
  }


  // downloadInvoice(payment: any) {
  //   const tva = this.tvaAmount;
  //   const ttc = this.totalTTC;

  //   const docDefinition: any = {
  //     content: [
  //       // Header: Logo + Company Info
  //       {
  //         columns: [
  //           {
  //             image: 'data:image/png;base64,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', // Replace with company logo Base64
  //             width: 100
  //           },
  //           [
  //             { text: 'MyCompany SARL', style: 'companyName' },
  //             { text: '123 Rue des Affaires, Tunis', style: 'companyInfo' },
  //             { text: 'Téléphone : +216 22 333 444', style: 'companyInfo' },
  //             { text: 'Email : john.doe@email.com', style: 'companyInfo' },
  //           ]
  //         ]
  //       },

  //       { text: 'FACTURE', style: 'invoiceTitle', margin: [0, 20, 0, 20] },

  //       // Client & Invoice Info
  //       {
  //         columns: [
  //           [
  //             { text: 'Facturé à :', style: 'subheader' },
  //             { text: `${payment.User.name} ${payment.User.lastName}` },
  //             { text: payment.User.address },
  //             { text: payment.User.email }
  //           ],
  //           [
  //             { text: `Facture n° : ${payment.idPayment}`, alignment: 'right' },
  //             { text: `Date : ${new Date(payment.paymentDate).toLocaleDateString()}`, alignment: 'right' },
  //             { text: `Méthode de paiement : ${payment.paymentMethod || '-'}`, alignment: 'right' }
  //           ]
  //         ]
  //       },

  //       { text: '\n' },

  //       // Table of Payment Details
  //       {
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
  //           body: [
  //             [
  //               { text: 'Code', style: 'tableHeader' },
  //               { text: 'Description', style: 'tableHeader' },
  //               { text: 'Quantité', style: 'tableHeader' },
  //               { text: 'Prix Unitaire', style: 'tableHeader' },
  //               { text: 'TVA %', style: 'tableHeader' },
  //               { text: 'Total TVA', style: 'tableHeader' },
  //               { text: 'Total TTC', style: 'tableHeader' }
  //             ],
  //             [
  //               payment.idPayment,
  //               `Paiement pour ${payment.subscriptionPlan || 'Service'}`,
  //               payment.subscriptionPlan?.toString().slice(0, 1),
  //               `${payment.amount} ${payment.currency}`,
  //               '18%',
  //               `${tva.toFixed(2)} TND`,
  //               { text: `${ttc.toFixed(2)} TND`, bold: true }
  //             ]
  //           ]
  //         },
  //         layout: 'lightHorizontalLines'
  //       },

  //       { text: '\nNotes : Merci pour votre confiance. Cette facture doit être réglée dans un délai de 15 jours.', style: 'notes' },

  //       // Footer
  //       {
  //         text: 'MyCompany SARL - 123 Rue des Affaires, Tunis - Téléphone: +216 22 333 444 - Email: john.doe@email.com',
  //         style: 'footer'
  //       }
  //     ],
  //     styles: {
  //       companyName: { fontSize: 14, bold: true, alignment: 'right' },
  //       companyInfo: { fontSize: 10, alignment: 'right' },
  //       invoiceTitle: { fontSize: 20, bold: true, alignment: 'center' },
  //       subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
  //       tableHeader: { bold: true, fillColor: '#eeeeee', alignment: 'center' },
  //       notes: { fontSize: 10, italics: true, margin: [0, 20, 0, 20] },
  //       footer: { fontSize: 8, alignment: 'center', margin: [0, 30, 0, 0], color: 'gray' }
  //     },
  //     defaultStyle: {
  //       fontSize: 11
  //     }
  //   };

  //   pdfMake.createPdf(docDefinition).download(`facture-${payment.idPayment}.pdf`);
  // }

  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async generateInvoicePDF(): Promise<void> {

    const invoiceNumber = this.invoiceNumber;
    const invoiceDate = this.invoiceDate;
    const companyInfo = this.companyInfo;
    const clientInfo = this.clientInfo;
    const tvaRate = this.tvaRate;
    const timbreFiscal = this.timbreFiscal;

    // Calculate totals
    const subtotal = this.subtotal;
    const tvaAmount = this.tvaAmount;
    const totalTTC = this.totalTTC;

    // Get logo as base64 (optional - you can also use a placeholder)
    let logoBase64 = '';
    try {
      logoBase64 = await this.getBase64ImageFromURL(companyInfo.logo);
    } catch (error) {
      console.warn('Could not load logo, using placeholder');
    }

    const docDefinition: TDocumentDefinitions = {
      content: [
        // Header Section - FIXED DESIGN
        {
          columns: [
            // Company Info with Logo (Left side)
            {
              width: '60%',
              stack: [
                // Company name and logo row
                {
                  columns: [
                    {
                      width: 80,
                      stack: [
                        logoBase64 ? {
                          image: logoBase64,
                          width: 70,
                          height: 70,
                          alignment: 'left'
                        } : {
                          text: 'LOGO',
                          style: 'logoPlaceholder',
                          alignment: 'center',
                          margin: [0, 20, 0, 20]
                        }
                      ]
                    },
                    {
                      width: '*',
                      stack: [
                        {
                          text: companyInfo.name,
                          style: 'companyName',
                          margin: [10, 0, 0, 8]
                        },
                        {
                          text: [
                            { text: companyInfo.address, style: 'companyDetails' },
                            { text: '\n' + companyInfo.city, style: 'companyDetails' },
                            { text: '\nTél: ' + companyInfo.phone, style: 'companyDetails' },
                            { text: '\nEmail: ' + companyInfo.email, style: 'companyDetails' }
                          ],
                          margin: [10, 0, 0, 15]
                        }
                      ]
                    }
                  ]
                },
                // Legal info section
                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 280, y2: 0,
                      lineWidth: 1,
                      lineColor: '#e0e0e0'
                    }
                  ],
                  margin: [0, 10, 0, 10]
                },
                {
                  text: [
                    { text: 'SIRET: ', style: 'legalLabel' },
                    { text: companyInfo.siret, style: 'legalText' },
                    { text: '  •  N° TVA: ', style: 'legalLabel' },
                    { text: companyInfo.tva, style: 'legalText' }
                  ]
                }
              ]
            },
            // Invoice Info (Right side) - PROPERLY RIGHT ALIGNED
            {
              width: '40%',
              stack: [
                {
                  text: 'FACTURE',
                  style: 'invoiceTitle',
                  alignment: 'right',
                  margin: [0, 0, 0, 20]
                },
                // Force right alignment using margin
                {
                  table: {
                    widths: [80, 80],
                    body: [
                      [
                        { text: 'N° Facture:', style: 'invoiceLabel' },
                        { text: invoiceNumber, style: 'invoiceValue' }
                      ],
                      [
                        { text: 'Date:', style: 'invoiceLabel' },
                        { text: invoiceDate, style: 'invoiceValue' }
                      ]
                    ]
                  },
                  layout: 'noBorders',
                  margin: [60, 0, 0, 0] // Left margin to push right
                }
              ]
            }
          ],
          margin: [0, 0, 0, 30]
        },

        // Blue separator line
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 515, y2: 0,
              lineWidth: 2,
              lineColor: '#007acc'
            }
          ],
          margin: [0, 0, 0, 25]
        },

        // Client Section
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'Facturé à:',
                      style: 'sectionTitle',
                      margin: [0, 0, 0, 10]
                    },
                    {
                      text: [
                        { text: clientInfo.name, bold: true, fontSize: 12 },
                        { text: '\n' + clientInfo.company, fontSize: 10 },
                        { text: '\nContact: ' + clientInfo.email, fontSize: 10 },
                        { text: '\nMatricule fiscale: ' + clientInfo.taxNumber, fontSize: 10 }
                      ],
                      lineHeight: 1.2
                    }
                  ],
                  fillColor: '#f8f9fa',
                  margin: [15, 15, 15, 15]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0
          },
          margin: [0, 0, 0, 25]
        },

        // Items Table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              // Header
              [
                { text: 'Produit', style: 'tableHeader' },
                { text: 'Quantité', style: 'tableHeader' },
                { text: 'Prix Unitaire', style: 'tableHeader' },
                { text: 'Total HT', style: 'tableHeader' }
              ],
              // Items
              [
                { text: "Assistant", style: 'tableCell' },
                { text: this.quantite.toString(), style: 'tableCellCenter' },
                { text: this.formatCurrency(this.payment.amount), style: 'tableCellRight' },
                { text: this.formatCurrency(this.payment.amount* this.quantite) , style: 'tableCellRight' }
              ]
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => {
              return rowIndex === 0 ? '#007acc' : (rowIndex % 2 === 0 ? '#f8f9fa' : null);
            },
            hLineWidth: (i: number, node: any) => {
              return (i === 0 || i === node.table.body.length) ? 2 : 1;
            },
            vLineWidth: () => 0,
            hLineColor: () => '#e0e0e0',
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 8,
            paddingBottom: () => 8
          },
          margin: [0, 0, 0, 25]
        },

        // Tax Summary Table
        {
          columns: [
            { width: '*', text: '' }, // Spacer
            {
              width: 250,
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: `TVA ${tvaRate}%:`, style: 'summaryLabel' },
                    { text: this.formatCurrency(tvaAmount), style: 'summaryValue' }
                  ],
                  [
                    { text: 'Timbre fiscal:', style: 'summaryLabel' },
                    { text: this.formatCurrency(timbreFiscal), style: 'summaryValue'}
                  ],
                  [
                    { text: 'Total TTC:', style: 'summaryLabel' },
                    { text: this.formatCurrency(totalTTC), style: 'summaryValue' }
                  ]
                ]
              },
              layout: {
                hLineWidth: (i: number, node: any) => {
                  return i === node.table.body.length ? 0 : 1;
                },
                vLineWidth: () => 1,
                hLineColor: () => '#e0e0e0',
                vLineColor: () => '#e0e0e0',
                fillColor: (rowIndex: number) => {
                  if (rowIndex === 3) return '#e0e0e0'; // Total row
                  return null;
                },
                paddingLeft: () => 15,
                paddingRight: () => 15,
                paddingTop: () => 10,
                paddingBottom: () => 10
              }
            }
          ],
          margin: [0, 0, 0, 30]
        },

        // Footer
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 515, y2: 0,
              lineWidth: 2,
              lineColor: '#007acc'
            }
          ],
          margin: [0, 0, 0, 15]
        },
        {
          text: 'Merci pour votre confiance. Pour toute question concernant cette facture, n\'hésitez pas à nous contacter.',
          style: 'footerText',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 515, y2: 0,
              lineWidth: 1,
              lineColor: '#e0e0e0'
            }
          ],
          margin: [0, 0, 0, 10]
        },
        {
          text: `${companyInfo.name} • ${companyInfo.address} - ${companyInfo.city} • ${companyInfo.phone}`,
          style: 'legalFooter',
          alignment: 'center',
          margin: [0,130,0,0]
        }
      ],

      styles: {
        companyName: {
          fontSize: 22,
          bold: true,
          color: '#007acc'
        },
        companyDetails: {
          fontSize: 10,
          color: '#666666'
        },
        legalLabel: {
          fontSize: 9,
          bold: true,
          color: '#888888'
        },
        legalText: {
          fontSize: 9,
          color: '#888888'
        },
        logoPlaceholder: {
          fontSize: 12,
          color: '#007acc',
          // bor: [1, 1, 1, 1],
          // borderColor: '#007acc',
          alignment: 'center'
        },
        invoiceTitle: {
          fontSize: 28,
          color: '#007acc',
          bold: false
        },
        invoiceLabel: {
          fontSize: 11,
          bold: true,
          color: '#555555',
          margin: [0, 2, 5, 2]
        },
        invoiceValue: {
          fontSize: 11,
          color: '#555555',
          margin: [0, 2, 0, 2]
        },
        sectionTitle: {
          fontSize: 14,
          bold: true,
          color: '#007acc'
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: 'white',
          fillColor: '#007acc'
        },
        tableCell: {
          fontSize: 10,
          color: '#555555'
        },
        tableCellCenter: {
          fontSize: 10,
          color: '#555555',
          alignment: 'center'
        },
        tableCellRight: {
          fontSize: 10,
          color: '#333333',
          alignment: 'right',
          bold: true
        },
        summaryLabel: {
          fontSize: 11,
          color: '#333333'
        },
        summaryValue: {
          fontSize: 11,
          color: '#333333',
          bold: true,
          alignment: 'right'
        },
        paymentText: {
          fontSize: 10,
          color: '#555555'
        },
        bankTitle: {
          fontSize: 12,
          bold: true,
          color: '#007acc'
        },
        bankDetails: {
          fontSize: 10,
          font: 'Roboto'
        },
        footerText: {
          fontSize: 10,
          color: '#666666',
          italics: true
        },
        legalFooter: {
          fontSize: 8,
          color: '#888888'
        }
      },

      defaultStyle: {
        font: 'Roboto'
      },

      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60]
    };

    pdfMake.createPdf(docDefinition).download(`Facture-${invoiceNumber}.pdf`);
  }



  get tvaAmount(): number {
    return (this.subtotal * this.tvaRate) / 100;
  }

  get totalTTC(): number {
    return this.subtotal + this.tvaAmount + this.timbreFiscal;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tn-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }


}


