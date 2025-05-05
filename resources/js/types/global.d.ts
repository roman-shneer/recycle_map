import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import ziggyRoute, { Config as ZiggyConfig } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

declare global {
    interface Window {
        axios: AxiosInstance;
    }
    interface WindowEventMap {
        "report_me": CustomEvent<{ id: number }>;
        "route_me": CustomEvent<{ id: number }>;
    }
    interface ReportData {
        title: string;
        from_time: string;
        to_time: string;
        cash: string;
        lat: number;
        lng: number;
    }

    var route: typeof ziggyRoute;
    var Ziggy: ZiggyConfig;
}

declare module 'vue' {
    interface ComponentCustomProperties {
        route: typeof ziggyRoute;
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}

declare module 'googlemaps';