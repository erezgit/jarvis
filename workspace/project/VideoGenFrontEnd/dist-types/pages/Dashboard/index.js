import { jsx as _jsx } from "react/jsx-runtime";
import { PageHeader } from '@/components/common/PageHeader';
const Dashboard = () => {
    return (_jsx("div", { className: "container mx-auto pt-6 px-10 space-y-6", children: _jsx(PageHeader, { title: "Dashboard", className: "text-2xl font-bold tracking-tight" }) }));
};
export default Dashboard;
