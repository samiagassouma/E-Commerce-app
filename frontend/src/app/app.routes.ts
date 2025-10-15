import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CreateAssistantComponent } from './pages/create-assistant/create-assistant.component';
import { InterfaceAssistantComponent } from './pages/interface-assistant/interface-assistant.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { RedirectPaymentComponent } from './pages/redirect-payment/redirect-payment.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SucessComponent } from './pages/redirect-payment/sucess/sucess.component';
import { FailureComponent } from './pages/redirect-payment/failure/failure.component';
import { AisComponent } from './dashboard/ais/ais.component';
import { PaymentsComponent } from './dashboard/payments/payments.component';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { UsersComponent } from './dashboard-admin/users/users.component';
import { AssistantsComponent } from './dashboard-admin/assistants/assistants.component';
import { PaymentsAdminComponent } from './dashboard-admin/payments-admin/payments-admin.component';
import { ReportsComponent } from './dashboard-admin/reports/reports.component';


export const routes: Routes = [

    // { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: SignInComponent },
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'create',
        component: CreateAssistantComponent,
    },
    {
        path: 'chat',
        component: InterfaceAssistantComponent,
    },
    {
        path: 'redirectPaymentSuccess',
        component: SucessComponent
    },
    {
        path: 'redirectPaymentFailure',
        component: FailureComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
    },
    {
        path: 'ais',
        component: AisComponent,
    },
    { path: 'payment/:assistantId', component: PaymentComponent },
    { path: 'invoice', component: InvoiceComponent },
    {
        path: 'dashboard-admin', component: DashboardAdminComponent, children: [
            { path: 'users', component: UsersComponent },
            { path: 'assistants', component: AssistantsComponent },
            { path: 'payments', component: PaymentsAdminComponent },
            { path: 'reports', component: ReportsComponent },
            { path: '', redirectTo: 'reports', pathMatch: 'full' }
        ]
    },


];
