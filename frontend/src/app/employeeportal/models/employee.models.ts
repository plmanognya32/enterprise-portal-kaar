export interface EmployeeProfile {
    employeeId: number,
    name: string,
    joiningDate: Date,
    lastDate: Date,
    lastUpdated: string,
    companyCode: string,
    personnelArea: string,
    employeeGroup: string,
    employeeSubGroup: string,
    organizationalKey: string,
    personnelSubarea: string,
    payrollArea: string,
    adminGroup: string,
}

export interface EmployeeLeaveData {
    employeeId?: string;
    type: string;
    from: string;
    to: string;
    days: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    absenceHours?: number;
    payrollDays?: number;
    payrollHours?: number;
    creditedDays?: number;
    subsequentIllness?: string;
    repeatedIllness?: string;
    calendarDays?: number;
    premiumIndicator?: string;
    position?: string;
    reportedAt?: string;
    sicknessConfirmed?: string;
}