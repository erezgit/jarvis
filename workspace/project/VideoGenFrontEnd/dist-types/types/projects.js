export function isProjectError(error) {
    return error instanceof Error && 'code' in error;
}
