export function isApiError(response) {
    return response.status === 'error';
}
export function isApiSuccess(response) {
    return response.status === 'success';
}
