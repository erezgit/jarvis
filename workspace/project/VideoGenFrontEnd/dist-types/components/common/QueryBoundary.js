import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Spinner } from './Spinner';
export function QueryBoundary({ query, children, fallback = (_jsx("div", { className: "flex items-center justify-center p-4", children: _jsx(Spinner, { size: "sm" }) })), error, }) {
    if (query.isLoading) {
        return fallback;
    }
    if (query.isError && error) {
        return error;
    }
    if (!query.data) {
        return null;
    }
    return _jsx(_Fragment, { children: children(query.data) });
}
