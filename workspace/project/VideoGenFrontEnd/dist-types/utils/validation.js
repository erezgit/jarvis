export const validationRules = {
    email: (value) => {
        if (value === null)
            return 'Email is required';
        if (typeof value !== 'string')
            return 'Invalid email format';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            return 'Invalid email address';
        }
        return undefined;
    },
    password: (value) => {
        if (value === null)
            return 'Password is required';
        if (typeof value !== 'string')
            return 'Invalid password format';
        if (value.length < 6)
            return 'Password must be at least 6 characters';
        return undefined;
    },
    username: (value) => {
        if (value === null)
            return 'Username is required';
        if (typeof value !== 'string')
            return 'Invalid username format';
        if (value.length < 3)
            return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        return undefined;
    },
};
