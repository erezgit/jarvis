module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct calls to authentication functions',
      category: 'Security',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noDirectAuth: 'Direct calls to authentication functions are not allowed. Use authenticateToken middleware instead.',
      noGetAuthUser: 'Direct calls to getAuthenticatedUser are not allowed. User data should be accessed from req.user after middleware authentication.',
    }
  },

  create(context) {
    return {
      // Catch direct calls to getAuthenticatedUser
      CallExpression(node) {
        if (node.callee.name === 'getAuthenticatedUser') {
          context.report({
            node,
            messageId: 'noGetAuthUser',
          });
        }
      },

      // Catch imports of deprecated auth functions
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source.includes('lib/auth/server')) {
          const specifiers = node.specifiers;
          specifiers.forEach(specifier => {
            if (specifier.imported && specifier.imported.name === 'getAuthenticatedUser') {
              context.report({
                node,
                messageId: 'noDirectAuth',
              });
            }
          });
        }
      }
    };
  },
}; 