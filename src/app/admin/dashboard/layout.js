"use client"

import FeatherIcon from 'feather-icons-react';

import {CustomDashboard} from "../../../components/CustomDashboard";
import { useEffect } from 'react';

export default function RootLayout({children}) {

    const dashboardItems = [
        {
            id: 1,
            title: "Users",
            pathName:"/admin/dashboard/users",
            icon: (<FeatherIcon icon="users" className='menu-icon' />)
        },
        {
            id: 2,
            title: "Invoices",
            pathName:"/admin/dashboard/invoices",
            icon: (<FeatherIcon icon="file" className='menu-icon' />)
        },
        {
            id: 3,
            title: "Master CSV",
            pathName:"/admin/dashboard/master_csv",
            icon: (<FeatherIcon icon="file-text" className='menu-icon' />)
        },
        {
            id: 4,
            title: "VMPP",
            pathName:"/admin/dashboard/vmpp",
            icon: (<FeatherIcon icon="package" className='menu-icon' />)
        },
        {
            id: 5,
            title: "AMPP",
            pathName:"/admin/dashboard/ampp",
            icon: (<FeatherIcon icon="box" className='menu-icon' />)
        },
        {
            id: 6,
            title: "Concession",
            pathName:"/admin/dashboard/concession",
            icon: (<FeatherIcon icon="percent" className='menu-icon' />)
        },
        {
            id: 7,
            title: "Missing Report",
            pathName:"/admin/dashboard/missing_report",
            icon: (<FeatherIcon icon="alert-triangle" className='menu-icon' />)
        },
    ]

    useEffect(() => {
        const path = (!window)? "test" : window.location.pathname
        console.log("@@@ LOCATION: ", path);
    }, []);

    return (
        <CustomDashboard 
            dashboardItems={dashboardItems}
        >
            {children}
        </CustomDashboard>
    )
}
